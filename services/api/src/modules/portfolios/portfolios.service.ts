import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreatePortfolioDto, PortfolioStrategy } from './dto/create-portfolio.dto';
import { RebalanceDto } from './dto/rebalance.dto';

/** Default robo-advisor allocations by strategy (WAEMU market context) */
const STRATEGY_ALLOCATIONS: Record<string, { assetClass: string; targetPercent: number }[]> = {
  CONSERVATIVE: [
    { assetClass: 'GOVERNMENT_BONDS', targetPercent: 50 },
    { assetClass: 'CORPORATE_BONDS', targetPercent: 25 },
    { assetClass: 'MONEY_MARKET', targetPercent: 15 },
    { assetClass: 'BRVM_EQUITY', targetPercent: 10 },
  ],
  MODERATE_CONSERVATIVE: [
    { assetClass: 'GOVERNMENT_BONDS', targetPercent: 35 },
    { assetClass: 'CORPORATE_BONDS', targetPercent: 25 },
    { assetClass: 'BRVM_EQUITY', targetPercent: 25 },
    { assetClass: 'MONEY_MARKET', targetPercent: 15 },
  ],
  MODERATE: [
    { assetClass: 'BRVM_EQUITY', targetPercent: 35 },
    { assetClass: 'GOVERNMENT_BONDS', targetPercent: 25 },
    { assetClass: 'CORPORATE_BONDS', targetPercent: 20 },
    { assetClass: 'MONEY_MARKET', targetPercent: 10 },
    { assetClass: 'REAL_ESTATE', targetPercent: 10 },
  ],
  MODERATE_AGGRESSIVE: [
    { assetClass: 'BRVM_EQUITY', targetPercent: 50 },
    { assetClass: 'CORPORATE_BONDS', targetPercent: 20 },
    { assetClass: 'GOVERNMENT_BONDS', targetPercent: 15 },
    { assetClass: 'REAL_ESTATE', targetPercent: 10 },
    { assetClass: 'MONEY_MARKET', targetPercent: 5 },
  ],
  AGGRESSIVE: [
    { assetClass: 'BRVM_EQUITY', targetPercent: 65 },
    { assetClass: 'CORPORATE_BONDS', targetPercent: 15 },
    { assetClass: 'REAL_ESTATE', targetPercent: 10 },
    { assetClass: 'GOVERNMENT_BONDS', targetPercent: 5 },
    { assetClass: 'MONEY_MARKET', targetPercent: 5 },
  ],
};

/** Maps PortfolioStrategy to Prisma PortfolioType */
function mapStrategyToPortfolioType(strategy: PortfolioStrategy): string {
  switch (strategy) {
    case PortfolioStrategy.CONSERVATIVE:
    case PortfolioStrategy.MODERATE_CONSERVATIVE:
    case PortfolioStrategy.MODERATE:
    case PortfolioStrategy.MODERATE_AGGRESSIVE:
    case PortfolioStrategy.AGGRESSIVE:
      return 'robo_managed';
    case PortfolioStrategy.CUSTOM:
      return 'self_directed';
    default:
      return 'robo_managed';
  }
}

@Injectable()
export class PortfoliosService {
  private readonly logger = new Logger(PortfoliosService.name);

  constructor(private readonly db: DatabaseService) {}

  async create(userId: string, dto: CreatePortfolioDto) {
    // TODO: Verify user has completed risk assessment if using non-CUSTOM strategy
    // TODO: If CUSTOM, validate allocations sum to 100%
    // TODO: If initialAmount provided, verify sufficient cash balance

    const allocations =
      dto.strategy === PortfolioStrategy.CUSTOM
        ? dto.customAllocation
        : STRATEGY_ALLOCATIONS[dto.strategy];

    if (dto.strategy === PortfolioStrategy.CUSTOM && !dto.customAllocation?.length) {
      throw new BadRequestException('Custom allocation is required for CUSTOM strategy');
    }

    if (dto.strategy === PortfolioStrategy.CUSTOM) {
      const total = dto.customAllocation!.reduce((sum, a) => sum + a.targetPercent, 0);
      if (Math.abs(total - 100) > 0.01) {
        throw new BadRequestException(`Allocation percentages must sum to 100, got ${total}`);
      }
    }

    const portfolioType = mapStrategyToPortfolioType(dto.strategy);

    const portfolio = await this.db.portfolio.create({
      data: {
        userId,
        name: dto.name,
        portfolioType: portfolioType as any,
        targetAllocation: allocations as any,
        totalValueFcfa: BigInt(dto.initialAmount || 0),
        isActive: true,
      },
    });

    // TODO: Create allocation records
    // TODO: If initialAmount, execute initial trades via InvestmentsService

    this.logger.log(`Portfolio created: ${portfolio.id} (${dto.strategy}) for user ${userId}`);

    return {
      id: portfolio.id,
      name: portfolio.name,
      portfolioType: portfolio.portfolioType,
      allocations,
      isActive: portfolio.isActive,
      createdAt: portfolio.createdAt,
    };
  }

  async findAll(userId: string) {
    const portfolios = await this.db.portfolio.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    // TODO: Enrich each portfolio with current value, total return, etc.

    return portfolios.map((p) => ({
      id: p.id,
      name: p.name,
      portfolioType: p.portfolioType,
      totalValueFcfa: p.totalValueFcfa,
      totalReturn: BigInt(0), // TODO: Compute gain/loss
      returnPercent: 0,
      createdAt: p.createdAt,
    }));
  }

  async findOne(userId: string, portfolioId: string): Promise<any> {
    const portfolio = await this.db.portfolio.findFirst({
      where: { id: portfolioId, userId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    // TODO: Fetch holdings from holdings table
    // TODO: Compute current market value for each holding
    // TODO: Compute total portfolio value and return

    return {
      ...portfolio,
      holdings: [], // TODO: Populate
      totalReturn: BigInt(0),
      returnPercent: 0,
    };
  }

  async getPerformance(userId: string, portfolioId: string) {
    const portfolio = await this.db.portfolio.findFirst({
      where: { id: portfolioId, userId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    // TODO: Fetch time-series portfolio valuations
    // TODO: Compute return metrics (daily, weekly, monthly, YTD, all-time)
    // TODO: Compare against BRVM Composite index benchmark

    return {
      portfolioId,
      totalValueFcfa: portfolio.totalValueFcfa,
      totalReturn: BigInt(0),
      returnPercent: 0,
      timeSeries: [], // TODO: Array of { date, value } objects
      benchmark: {
        name: 'BRVM Composite',
        returnPercent: 0,
      },
    };
  }

  async getAllocation(userId: string, portfolioId: string) {
    const portfolio = await this.db.portfolio.findFirst({
      where: { id: portfolioId, userId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const targetAllocations = (portfolio.targetAllocation as any[]) || [];

    // TODO: Compute actual allocations from current holdings
    // TODO: Calculate drift between target and actual

    return {
      portfolioId,
      target: targetAllocations,
      actual: [], // TODO: Populate from holdings
      driftPercent: 0, // TODO: Compute max drift
      needsRebalance: false,
    };
  }

  async rebalance(userId: string, portfolioId: string, dto: RebalanceDto) {
    const portfolio = await this.db.portfolio.findFirst({
      where: { id: portfolioId, userId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    // TODO: Get current holdings and their market values
    // TODO: Determine target allocation (auto or manual)
    // TODO: Calculate trades needed to reach target allocation
    // TODO: Execute trades via InvestmentsService
    // TODO: Record rebalance event

    this.logger.log(
      `Rebalance ${dto.autoRebalance ? '(auto)' : '(manual)'} for portfolio ${portfolioId}`,
    );

    return {
      portfolioId,
      rebalanceType: dto.autoRebalance ? 'AUTO' : 'MANUAL',
      tradesGenerated: 0, // TODO: Actual trade count
      trades: [], // TODO: List of generated trades
      status: 'PENDING',
      message: 'Rebalancing trades have been generated and are pending execution',
    };
  }

  async update(userId: string, portfolioId: string, dto: Partial<CreatePortfolioDto>) {
    const portfolio = await this.db.portfolio.findFirst({
      where: { id: portfolioId, userId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const updated = await this.db.portfolio.update({
      where: { id: portfolioId },
      data: {
        name: dto.name,
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      message: 'Portfolio updated',
    };
  }

  async remove(userId: string, portfolioId: string) {
    const portfolio = await this.db.portfolio.findFirst({
      where: { id: portfolioId, userId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    // TODO: Liquidate all holdings (sell all positions)
    // TODO: Credit proceeds to user cash balance
    // TODO: Mark portfolio as inactive instead of deleting

    await this.db.portfolio.update({
      where: { id: portfolioId },
      data: { isActive: false },
    });

    this.logger.log(`Portfolio ${portfolioId} closed for user ${userId}`);
  }
}
