import {
  Controller,
  Get,
  Put,
  Param,
  Query,
  Body,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // --- User Management ---

  @Get('users')
  @ApiOperation({
    summary: 'List all users',
    description: 'Returns a paginated list of all registered users with their status and KYC information.',
  })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED', 'BLOCKED'] })
  @ApiQuery({ name: 'kycStatus', required: false, enum: ['NONE', 'PENDING', 'APPROVED', 'REJECTED'] })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name, phone, or email' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ description: 'Users list returned' })
  async getUsers(
    @Query('status') status?: string,
    @Query('kycStatus') kycStatus?: string,
    @Query('search') search?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.adminService.getUsers({ status, kycStatus, search, page, limit });
  }

  @Get('users/:id')
  @ApiOperation({
    summary: 'Get user details (admin view)',
    description:
      'Returns full user details including KYC submissions, transactions, portfolios, and activity history.',
  })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiOkResponse({ description: 'User details returned' })
  @ApiNotFoundResponse({ description: 'User not found' })
  async getUser(@Param('id') id: string) {
    return this.adminService.getUser(id);
  }

  @Put('users/:id/status')
  @ApiOperation({
    summary: 'Update user status',
    description: 'Activates, suspends, or blocks a user account.',
  })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiOkResponse({ description: 'User status updated' })
  async updateUserStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: { status: string; reason?: string },
  ) {
    return this.adminService.updateUserKycStatus(id, dto.status, dto.reason, req.user?.id);
  }

  // --- KYC Review ---

  @Get('kyc/pending')
  @ApiOperation({
    summary: 'List pending KYC submissions',
    description: 'Returns all KYC submissions awaiting review, ordered by submission date.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ description: 'Pending KYC submissions returned' })
  async getPendingKyc(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.adminService.getPendingKyc({ page, limit });
  }

  @Get('kyc/:id')
  @ApiOperation({
    summary: 'Get KYC submission details',
    description: 'Returns full details of a KYC submission including document URLs and user info.',
  })
  @ApiParam({ name: 'id', description: 'KYC submission UUID' })
  @ApiOkResponse({ description: 'KYC submission details returned' })
  @ApiNotFoundResponse({ description: 'Submission not found' })
  async getKycSubmission(@Param('id') id: string) {
    return this.adminService.getKycSubmission(id);
  }

  @Put('kyc/:id/review')
  @ApiOperation({
    summary: 'Review KYC submission',
    description: 'Approves or rejects a KYC submission. Approval triggers user KYC status update.',
  })
  @ApiParam({ name: 'id', description: 'KYC submission UUID' })
  @ApiOkResponse({ description: 'KYC submission reviewed' })
  @ApiBadRequestResponse({ description: 'Invalid review data' })
  async reviewKyc(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: { decision: 'verified' | 'rejected'; reason?: string },
  ) {
    return this.adminService.reviewKyc(id, dto.decision, dto.reason, req.user?.id);
  }

  // --- Reporting ---

  @Get('reports/dashboard')
  @ApiOperation({
    summary: 'Get admin dashboard metrics',
    description:
      'Returns key platform metrics: total users, AUM, transaction volume, active portfolios, etc.',
  })
  @ApiOkResponse({ description: 'Dashboard metrics returned' })
  async getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('reports/transactions')
  @ApiOperation({
    summary: 'Transaction volume report',
    description: 'Returns transaction volume aggregated by day, week, or month.',
  })
  @ApiQuery({ name: 'from', required: true, description: 'Start date' })
  @ApiQuery({ name: 'to', required: true, description: 'End date' })
  @ApiQuery({ name: 'groupBy', required: false, enum: ['day', 'week', 'month'] })
  @ApiOkResponse({ description: 'Transaction report returned' })
  async getTransactionReport(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('groupBy') groupBy = 'day',
  ) {
    return this.adminService.getTransactionReport(from, to, groupBy);
  }

  @Get('reports/users')
  @ApiOperation({
    summary: 'User growth report',
    description: 'Returns user registration and activation metrics over time.',
  })
  @ApiQuery({ name: 'from', required: true, description: 'Start date' })
  @ApiQuery({ name: 'to', required: true, description: 'End date' })
  @ApiOkResponse({ description: 'User growth report returned' })
  async getUserReport(@Query('from') from: string, @Query('to') to: string) {
    return this.adminService.getUserReport(from, to);
  }

  @Get('reports/aum')
  @ApiOperation({
    summary: 'Assets Under Management report',
    description: 'Returns total AUM broken down by asset class and portfolio strategy.',
  })
  @ApiOkResponse({ description: 'AUM report returned' })
  async getAumReport() {
    return this.adminService.getAumReport();
  }
}
