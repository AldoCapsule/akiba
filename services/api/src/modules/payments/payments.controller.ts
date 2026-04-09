import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Request,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { PispiWebhookDto } from './dto/pispi-webhook.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('deposits')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Initiate a deposit',
    description:
      'Initiates a deposit via PI-SPI compliant mobile money or bank transfer. The user will receive a prompt on their mobile money app to confirm.',
  })
  @ApiCreatedResponse({ description: 'Deposit initiated, awaiting provider confirmation' })
  @ApiBadRequestResponse({ description: 'Invalid deposit data or insufficient provider balance' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async createDeposit(@Request() req: any, @Body() dto: CreateDepositDto) {
    return this.paymentsService.createDeposit(req.user?.id, dto);
  }

  @Post('withdrawals')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Initiate a withdrawal',
    description:
      'Initiates a withdrawal to the specified mobile money account or bank. Requires PIN authorization.',
  })
  @ApiCreatedResponse({ description: 'Withdrawal initiated' })
  @ApiBadRequestResponse({ description: 'Insufficient balance or invalid PIN' })
  async createWithdrawal(@Request() req: any, @Body() dto: CreateWithdrawalDto) {
    return this.paymentsService.createWithdrawal(req.user?.id, dto);
  }

  @Post('webhook/pispi')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'PI-SPI payment webhook',
    description:
      'Receives payment status callbacks from PI-SPI providers. Verifies HMAC signature before processing.',
  })
  @ApiOkResponse({ description: 'Webhook processed' })
  async handleWebhook(
    @Body() dto: PispiWebhookDto,
    @Headers('x-webhook-signature') signature: string,
  ) {
    return this.paymentsService.handleWebhook(dto, signature);
  }

  @Get('transactions')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get transaction history',
    description: 'Returns paginated transaction history for the authenticated user.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default 20, max 100)' })
  @ApiQuery({ name: 'type', required: false, enum: ['DEPOSIT', 'WITHDRAWAL', 'ALL'], description: 'Filter by transaction type' })
  @ApiOkResponse({ description: 'Transaction list returned' })
  async getTransactions(
    @Request() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('type') type?: string,
  ) {
    return this.paymentsService.getTransactions(req.user?.id, { page, limit, type });
  }

  @Get('transactions/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get transaction details',
    description: 'Returns details for a specific transaction.',
  })
  @ApiParam({ name: 'id', description: 'Transaction UUID' })
  @ApiOkResponse({ description: 'Transaction details returned' })
  async getTransaction(@Request() req: any, @Param('id') id: string) {
    return this.paymentsService.getTransaction(req.user?.id, id);
  }

  @Get('balance')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get account balance',
    description: 'Returns the current CFA franc balance for the authenticated user.',
  })
  @ApiOkResponse({ description: 'Balance returned' })
  async getBalance(@Request() req: any) {
    return this.paymentsService.getBalance(req.user?.id);
  }
}
