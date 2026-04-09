import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

interface UserQuery {
  status?: string;
  kycStatus?: string;
  search?: string;
  page: number;
  limit: number;
}

interface PaginationQuery {
  page: number;
  limit: number;
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly db: DatabaseService) {}

  // --- User Management ---

  async getUsers(query: UserQuery) {
    const { kycStatus, search, page, limit } = query;
    const skip = (page - 1) * Math.min(limit, 100);
    const take = Math.min(limit, 100);

    const where: any = {};
    if (kycStatus) where.kycStatus = kycStatus;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.db.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          phoneNumber: true,
          fullName: true,
          email: true,
          kycStatus: true,
          kycTier: true,
          riskProfile: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.db.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: { page, limit: take, total, totalPages: Math.ceil(total / take) },
    };
  }

  async getUser(userId: string) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      include: {
        kycDocuments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        portfolios: {
          select: {
            id: true,
            name: true,
            portfolioType: true,
            isActive: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            transactions: true,
            savingsGoals: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUserKycStatus(userId: string, kycStatus: string, reason: string | undefined, adminId: string) {
    const validStatuses = ['pending', 'submitted', 'verified', 'rejected'];
    if (!validStatuses.includes(kycStatus)) {
      throw new BadRequestException(`Invalid KYC status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const user = await this.db.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const previousStatus = user.kycStatus;

    await this.db.user.update({
      where: { id: userId },
      data: { kycStatus: kycStatus as any },
    });

    // TODO: Create audit log entry
    // TODO: If suspended/blocked, revoke active sessions
    // TODO: Send notification to user about account status change

    this.logger.log(
      `User ${userId} kycStatus changed from ${previousStatus} to ${kycStatus} by admin ${adminId}`,
    );

    return {
      userId,
      previousStatus,
      newStatus: kycStatus,
      reason,
      message: `User KYC status updated to ${kycStatus}`,
    };
  }

  // --- KYC Review ---

  async getPendingKyc(query: PaginationQuery) {
    const { page, limit } = query;
    const skip = (page - 1) * Math.min(limit, 100);
    const take = Math.min(limit, 100);

    const [documents, total] = await Promise.all([
      this.db.kycDocument.findMany({
        where: { status: 'pending' },
        orderBy: { createdAt: 'asc' },
        skip,
        take,
        include: {
          user: {
            select: { id: true, fullName: true, phoneNumber: true },
          },
        },
      }),
      this.db.kycDocument.count({ where: { status: 'pending' } }),
    ]);

    return {
      data: documents,
      pagination: { page, limit: take, total, totalPages: Math.ceil(total / take) },
    };
  }

  async getKycSubmission(documentId: string) {
    const document = await this.db.kycDocument.findUnique({
      where: { id: documentId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            email: true,
            dateOfBirth: true,
            kycStatus: true,
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundException('KYC document not found');
    }

    return document;
  }

  async reviewKyc(
    documentId: string,
    decision: 'verified' | 'rejected',
    reason: string | undefined,
    reviewerId: string,
  ) {
    const document = await this.db.kycDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('KYC document not found');
    }

    if (document.status !== 'pending') {
      throw new BadRequestException('This document has already been reviewed');
    }

    if (decision === 'rejected' && !reason) {
      throw new BadRequestException('Rejection reason is required');
    }

    await this.db.kycDocument.update({
      where: { id: documentId },
      data: {
        status: decision,
        reviewNotes: decision === 'rejected' ? reason : null,
        reviewedBy: reviewerId,
      },
    });

    // Update user KYC status
    await this.db.user.update({
      where: { id: document.userId },
      data: {
        kycStatus: decision,
      },
    });

    // TODO: Create audit log entry
    // TODO: Send notification to user about KYC decision
    // TODO: If verified, run sanctions screening

    this.logger.log(
      `KYC document ${documentId} ${decision} by ${reviewerId}`,
    );

    return {
      documentId,
      decision,
      reason,
      message: `KYC document ${decision}`,
    };
  }

  // --- Reporting ---

  async getDashboard() {
    // TODO: Use materialized views or caching for performance in production

    const [
      totalUsers,
      pendingKyc,
      totalTransactions,
      totalDeposits,
      totalWithdrawals,
      activePortfolios,
      activeSavingsGoals,
      openAlerts,
    ] = await Promise.all([
      this.db.user.count(),
      this.db.kycDocument.count({ where: { status: 'pending' } }),
      this.db.transaction.count({ where: { status: 'completed' } }),
      this.db.transaction.aggregate({
        where: { type: 'deposit', status: 'completed' },
        _sum: { amountFcfa: true },
      }),
      this.db.transaction.aggregate({
        where: { type: 'withdrawal', status: 'completed' },
        _sum: { amountFcfa: true },
      }),
      this.db.portfolio.count({ where: { isActive: true } }),
      this.db.savingsGoal.count({ where: { isActive: true } }),
      this.db.amlAlert.count({ where: { status: 'open' } }),
    ]);

    return {
      users: {
        total: totalUsers,
        pendingKyc,
      },
      transactions: {
        total: totalTransactions,
        totalDeposits: totalDeposits._sum?.amountFcfa || BigInt(0),
        totalWithdrawals: totalWithdrawals._sum?.amountFcfa || BigInt(0),
        netFlow:
          (totalDeposits._sum?.amountFcfa || BigInt(0)) -
          (totalWithdrawals._sum?.amountFcfa || BigInt(0)),
      },
      portfolios: {
        active: activePortfolios,
      },
      savings: {
        activeGoals: activeSavingsGoals,
      },
      compliance: {
        openAlerts,
      },
      currency: 'XOF',
      generatedAt: new Date().toISOString(),
    };
  }

  async getTransactionReport(from: string, to: string, groupBy: string) {
    // TODO: Implement proper date grouping with raw SQL or Prisma aggregation
    // TODO: Group transactions by the specified interval

    const transactions = await this.db.transaction.findMany({
      where: {
        status: 'completed',
        createdAt: {
          gte: new Date(from),
          lte: new Date(to),
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const totalVolume = transactions.reduce((sum, t) => sum + t.amountFcfa, BigInt(0));
    const deposits = transactions.filter((t) => t.type === 'deposit');
    const withdrawals = transactions.filter((t) => t.type === 'withdrawal');

    return {
      period: { from, to },
      groupBy,
      summary: {
        totalTransactions: transactions.length,
        totalVolume,
        totalDeposits: deposits.reduce((sum, t) => sum + t.amountFcfa, BigInt(0)),
        totalWithdrawals: withdrawals.reduce((sum, t) => sum + t.amountFcfa, BigInt(0)),
        depositCount: deposits.length,
        withdrawalCount: withdrawals.length,
      },
      timeSeries: [], // TODO: Group by date interval
      currency: 'XOF',
    };
  }

  async getUserReport(from: string, to: string) {
    const newUsers = await this.db.user.count({
      where: {
        createdAt: {
          gte: new Date(from),
          lte: new Date(to),
        },
      },
    });

    const kycVerified = await this.db.kycDocument.count({
      where: {
        status: 'verified',
        updatedAt: {
          gte: new Date(from),
          lte: new Date(to),
        },
      },
    });

    return {
      period: { from, to },
      newRegistrations: newUsers,
      kycVerified,
      kycConversionRate: newUsers > 0 ? Math.round((kycVerified / newUsers) * 100) : 0,
      timeSeries: [], // TODO: Group by date
    };
  }

  async getAumReport() {
    // TODO: Compute total AUM from all active portfolios and holdings
    // TODO: Break down by asset class and portfolio type

    const portfolios = await this.db.portfolio.findMany({
      where: { isActive: true },
      select: { portfolioType: true, totalValueFcfa: true },
    });

    const savingsTotal = await this.db.savingsGoal.aggregate({
      where: { isActive: true },
      _sum: { currentAmountFcfa: true },
    });

    const byType: Record<string, { count: number; totalValue: bigint }> = {};
    for (const p of portfolios) {
      if (!byType[p.portfolioType]) {
        byType[p.portfolioType] = { count: 0, totalValue: BigInt(0) };
      }
      byType[p.portfolioType].count++;
      byType[p.portfolioType].totalValue += p.totalValueFcfa || BigInt(0);
    }

    return {
      totalAum: BigInt(0), // TODO: Compute from live holdings market value
      totalInvested: portfolios.reduce((sum, p) => sum + (p.totalValueFcfa || BigInt(0)), BigInt(0)),
      totalSavings: savingsTotal._sum?.currentAmountFcfa || BigInt(0),
      portfolioCount: portfolios.length,
      byType: Object.entries(byType).map(([portfolioType, data]) => ({
        portfolioType,
        ...data,
      })),
      currency: 'XOF',
      generatedAt: new Date().toISOString(),
    };
  }
}
