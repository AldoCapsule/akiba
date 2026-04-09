import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { PispiWebhookDto } from './dto/pispi-webhook.dto';

interface TransactionQuery {
  page: number;
  limit: number;
  type?: string;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly db: DatabaseService) {}

  async createDeposit(userId: string, dto: CreateDepositDto) {
    // TODO: Validate user KYC status (must be approved for deposits above threshold)
    // TODO: Check daily/monthly deposit limits per BCEAO regulations
    // TODO: Call PI-SPI provider API to initiate the deposit
    // TODO: Create transaction record with PENDING status
    // TODO: Return provider redirect URL or USSD prompt reference

    const transaction = await this.db.transaction.create({
      data: {
        userId,
        type: 'DEPOSIT',
        amount: dto.amount,
        currency: 'XOF',
        provider: dto.provider,
        sourceAccount: dto.sourceAccount,
        note: dto.note,
        status: 'PENDING',
      },
    });

    this.logger.log(
      `Deposit initiated: ${transaction.id} for ${dto.amount} XOF via ${dto.provider}`,
    );

    return {
      transactionId: transaction.id,
      status: 'PENDING',
      amount: dto.amount,
      currency: 'XOF',
      provider: dto.provider,
      message: 'Please confirm the payment on your mobile money app',
    };
  }

  async createWithdrawal(userId: string, dto: CreateWithdrawalDto) {
    // TODO: Verify user PIN
    // TODO: Check available balance
    // TODO: Check daily/monthly withdrawal limits
    // TODO: Check if user has sufficient uninvested balance
    // TODO: Call PI-SPI provider API to initiate the withdrawal
    // TODO: Debit user account and create transaction

    const balance = await this.getUserBalance(userId);

    if (balance < dto.amount) {
      throw new BadRequestException(
        `Insufficient balance. Available: ${balance} XOF, requested: ${dto.amount} XOF`,
      );
    }

    // TODO: Verify PIN against stored hash
    // const user = await this.db.user.findUnique({ where: { id: userId } });
    // if (!await bcrypt.compare(dto.pin, user.pinHash)) {
    //   throw new ForbiddenException('Invalid PIN');
    // }

    const transaction = await this.db.transaction.create({
      data: {
        userId,
        type: 'WITHDRAWAL',
        amount: dto.amount,
        currency: 'XOF',
        provider: dto.provider,
        destinationAccount: dto.destinationAccount,
        note: dto.note,
        status: 'PENDING',
      },
    });

    this.logger.log(
      `Withdrawal initiated: ${transaction.id} for ${dto.amount} XOF via ${dto.provider}`,
    );

    return {
      transactionId: transaction.id,
      status: 'PENDING',
      amount: dto.amount,
      currency: 'XOF',
      provider: dto.provider,
      message: 'Withdrawal is being processed',
    };
  }

  async handleWebhook(dto: PispiWebhookDto, headerSignature: string) {
    // TODO: Verify HMAC signature using provider webhook secret
    // TODO: Idempotency check - skip if already processed
    // TODO: Update transaction status based on event type
    // TODO: Credit/debit user wallet on success
    // TODO: Send notification to user
    // TODO: Log webhook for audit trail

    const isValid = this.verifyWebhookSignature(dto, headerSignature);
    if (!isValid) {
      this.logger.warn(`Invalid webhook signature for transaction ${dto.transactionId}`);
      throw new ForbiddenException('Invalid webhook signature');
    }

    const transaction = await this.db.transaction.findFirst({
      where: { id: dto.referenceId },
    });

    if (!transaction) {
      this.logger.warn(`Transaction not found for webhook: ${dto.referenceId}`);
      throw new NotFoundException('Transaction not found');
    }

    const newStatus =
      dto.eventType === 'PAYMENT_SUCCESS'
        ? 'COMPLETED'
        : dto.eventType === 'PAYMENT_FAILED'
          ? 'FAILED'
          : 'PENDING';

    await this.db.transaction.update({
      where: { id: transaction.id },
      data: {
        status: newStatus,
        providerTransactionId: dto.transactionId,
        providerStatusCode: dto.statusCode,
        updatedAt: new Date(),
      },
    });

    // TODO: If COMPLETED, update user wallet balance
    // TODO: Send push notification to user

    this.logger.log(
      `Webhook processed: ${dto.transactionId} -> ${newStatus}`,
    );

    return { received: true };
  }

  async getTransactions(userId: string, query: TransactionQuery) {
    const { page, limit, type } = query;
    const skip = (page - 1) * Math.min(limit, 100);
    const take = Math.min(limit, 100);

    const where: any = { userId };
    if (type && type !== 'ALL') {
      where.type = type;
    }

    const [transactions, total] = await Promise.all([
      this.db.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          type: true,
          amount: true,
          currency: true,
          provider: true,
          status: true,
          note: true,
          createdAt: true,
        },
      }),
      this.db.transaction.count({ where }),
    ]);

    return {
      data: transactions,
      pagination: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async getTransaction(userId: string, transactionId: string) {
    const transaction = await this.db.transaction.findFirst({
      where: { id: transactionId, userId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async getBalance(userId: string) {
    const balance = await this.getUserBalance(userId);

    return {
      balance,
      currency: 'XOF',
      updatedAt: new Date().toISOString(),
    };
  }

  private async getUserBalance(userId: string): Promise<number> {
    // TODO: Compute balance from completed deposits minus withdrawals and investments
    // TODO: Consider using a materialized balance field on the user/wallet table for performance

    const deposits = await this.db.transaction.aggregate({
      where: { userId, type: 'DEPOSIT', status: 'COMPLETED' },
      _sum: { amount: true },
    });

    const withdrawals = await this.db.transaction.aggregate({
      where: { userId, type: 'WITHDRAWAL', status: 'COMPLETED' },
      _sum: { amount: true },
    });

    const totalDeposits = deposits._sum.amount || 0;
    const totalWithdrawals = withdrawals._sum.amount || 0;

    return totalDeposits - totalWithdrawals;
  }

  private verifyWebhookSignature(dto: PispiWebhookDto, headerSignature: string): boolean {
    // TODO: Implement HMAC-SHA256 signature verification
    // const expectedSignature = crypto
    //   .createHmac('sha256', process.env.PISPI_WEBHOOK_SECRET)
    //   .update(JSON.stringify(dto))
    //   .digest('hex');
    // return `sha256=${expectedSignature}` === headerSignature;

    return dto.signature === headerSignature;
  }
}
