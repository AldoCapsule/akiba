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
    const { status, kycStatus, search, page, limit } = query;
    const skip = (page - 1) * Math.min(limit, 100);
    const take = Math.min(limit, 100);

    const where: any = {};
    if (status) where.status = status;
    if (kycStatus) where.kycStatus = kycStatus;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
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
          phone: true,
          fullName: true,
          email: true,
          status: true,
          kycStatus: true,
          riskProfile: true,
          createdAt: true,
          lastLoginAt: true,
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
        kycSubmissions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        portfolios: {
          select: {
            id: true,
            name: true,
            strategy: true,
            status: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            transactions: true,
            savingsGoals: true,
            trades: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUserStatus(userId: string, status: string, reason: string | undefined, adminId: string) {
    const validStatuses = ['ACTIVE', 'SUSPENDED', 'BLOCKED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const user = await this.db.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const previousStatus = user.status;

    await this.db.user.update({
      where: { id: userId },
      data: { status, updatedAt: new Date() },
    });

    // TODO: Create audit log entry
    // TODO: If SUSPENDED or BLOCKED, revoke active sessions
    // TODO: Send notification to user about account status change

    this.logger.log(
      `User ${userId} status changed from ${previousStatus} to ${status} by admin ${adminId}`,
    );

    return {
      userId,
      previousStatus,
      newStatus: status,
      reason,
      message: `User status updated to ${status}`,
    };
  }

  // --- KYC Review ---

  async getPendingKyc(query: PaginationQuery) {
    const { page, limit } = query;
    const skip = (page - 1) * Math.min(limit, 100);
    const take = Math.min(limit, 100);

    const [submissions, total] = await Promise.all([
      this.db.kycSubmission.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'asc' },
        skip,
        take,
        include: {
          user: {
            select: { id: true, fullName: true, phone: true },
          },
        },
      }),
      this.db.kycSubmission.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      data: submissions,
      pagination: { page, limit: take, total, totalPages: Math.ceil(total / take) },
    };
  }

  async getKycSubmission(submissionId: string) {
    const submission = await this.db.kycSubmission.findUnique({
      where: { id: submissionId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
            dateOfBirth: true,
            status: true,
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('KYC submission not found');
    }

    return submission;
  }

  async reviewKyc(
    submissionId: string,
    decision: 'APPROVED' | 'REJECTED',
    reason: string | undefined,
    reviewerId: string,
  ) {
    const submission = await this.db.kycSubmission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new NotFoundException('KYC submission not found');
    }

    if (submission.status !== 'PENDING') {
      throw new BadRequestException('This submission has already been reviewed');
    }

    if (decision === 'REJECTED' && !reason) {
      throw new BadRequestException('Rejection reason is required');
    }

    await this.db.kycSubmission.update({
      where: { id: submissionId },
      data: {
        status: decision,
        rejectionReason: decision === 'REJECTED' ? reason : null,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      },
    });

    // Update user KYC status
    await this.db.user.update({
      where: { id: submission.userId },
      data: {
        kycStatus: decision,
        updatedAt: new Date(),
      },
    });

    // TODO: Create audit log entry
    // TODO: Send notification to user about KYC decision
    // TODO: If APPROVED, run sanctions screening

    this.logger.log(
      `KYC submission ${submissionId} ${decision} by ${reviewerId}`,
    );

    return {
      submissionId,
      decision,
      reason,
      message: `KYC submission ${decision.toLowerCase()}`,
    };
  }

  // --- Reporting ---

  async getDashboard() {
    // TODO: Use materialized views or caching for performance in production

    const [
      totalUsers,
      activeUsers,
      pendingKyc,
      totalTransactions,
      totalDeposits,
      totalWithdrawals,
      activePortfolios,
      activeSavingsGoals,
      openAlerts,
    ] = await Promise.all([
      this.db.user.count(),
      this.db.user.count({ where: { status: 'ACTIVE' } }),
      this.db.kycSubmission.count({ where: { status: 'PENDING' } }),
      this.db.transaction.count({ where: { status: 'COMPLETED' } }),
      this.db.transaction.aggregate({
        where: { type: 'DEPOSIT', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      this.db.transaction.aggregate({
        where: { type: 'WITHDRAWAL', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      this.db.portfolio.count({ where: { status: 'ACTIVE' } }),
      this.db.savingsGoal.count({ where: { status: 'ACTIVE' } }),
      this.db.amlAlert.count({ where: { status: 'OPEN' } }),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        pendingKyc,
      },
      transactions: {
        total: totalTransactions,
        totalDeposits: totalDeposits._sum.amount || 0,
        totalWithdrawals: totalWithdrawals._sum.amount || 0,
        netFlow: (totalDeposits._sum.amount || 0) - (totalWithdrawals._sum.amount || 0),
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
        status: 'COMPLETED',
        createdAt: {
          gte: new Date(from),
          lte: new Date(to),
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
    const deposits = transactions.filter((t) => t.type === 'DEPOSIT');
    const withdrawals = transactions.filter((t) => t.type === 'WITHDRAWAL');

    return {
      period: { from, to },
      groupBy,
      summary: {
        totalTransactions: transactions.length,
        totalVolume,
        totalDeposits: deposits.reduce((sum, t) => sum + t.amount, 0),
        totalWithdrawals: withdrawals.reduce((sum, t) => sum + t.amount, 0),
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

    const kycApproved = await this.db.kycSubmission.count({
      where: {
        status: 'APPROVED',
        reviewedAt: {
          gte: new Date(from),
          lte: new Date(to),
        },
      },
    });

    return {
      period: { from, to },
      newRegistrations: newUsers,
      kycApproved,
      kycConversionRate: newUsers > 0 ? Math.round((kycApproved / newUsers) * 100) : 0,
      timeSeries: [], // TODO: Group by date
    };
  }

  async getAumReport() {
    // TODO: Compute total AUM from all active portfolios and holdings
    // TODO: Break down by asset class and strategy

    const portfolios = await this.db.portfolio.findMany({
      where: { status: 'ACTIVE' },
      select: { strategy: true, initialAmount: true },
    });

    const savingsTotal = await this.db.savingsGoal.aggregate({
      where: { status: 'ACTIVE' },
      _sum: { currentAmount: true },
    });

    const byStrategy: Record<string, { count: number; totalInvested: number }> = {};
    for (const p of portfolios) {
      if (!byStrategy[p.strategy]) {
        byStrategy[p.strategy] = { count: 0, totalInvested: 0 };
      }
      byStrategy[p.strategy].count++;
      byStrategy[p.strategy].totalInvested += p.initialAmount || 0;
    }

    return {
      totalAum: 0, // TODO: Compute from live holdings market value
      totalInvested: portfolios.reduce((sum, p) => sum + (p.initialAmount || 0), 0),
      totalSavings: savingsTotal._sum.currentAmount || 0,
      portfolioCount: portfolios.length,
      byStrategy: Object.entries(byStrategy).map(([strategy, data]) => ({
        strategy,
        ...data,
      })),
      currency: 'XOF',
      generatedAt: new Date().toISOString(),
    };
  }
}
