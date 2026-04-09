import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateTradeDto } from './dto/create-trade.dto';

interface TradeQuery {
  portfolioId?: string;
  page: number;
  limit: number;
}

@Injectable()
export class InvestmentsService {
  private readonly logger = new Logger(InvestmentsService.name);

  constructor(private readonly db: DatabaseService) {}

  async createTrade(userId: string, dto: CreateTradeDto) {
    // TODO: Verify portfolio belongs to user
    // TODO: Verify PIN
    // TODO: For BUY: check sufficient cash balance in portfolio
    // TODO: For SELL: check sufficient holding quantity
    // TODO: For MARKET order: fetch current price from MarketsService
    // TODO: For LIMIT order: store as pending until price conditions met
    // TODO: Submit order to broker/exchange integration
    // TODO: Create trade order record

    const portfolio = await this.db.portfolio.findFirst({
      where: { id: dto.portfolioId, userId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    // Look up asset by ticker
    const asset = await this.db.asset.findFirst({
      where: { ticker: dto.assetSymbol.toUpperCase() },
    });

    if (!asset) {
      throw new NotFoundException(`Asset ${dto.assetSymbol} not found`);
    }

    // TODO: Replace with actual price lookup
    const estimatedPrice = dto.limitPrice || 0;
    const estimatedTotal = estimatedPrice * dto.quantity;

    const tradeOrder = await this.db.tradeOrder.create({
      data: {
        portfolioId: dto.portfolioId,
        assetId: asset.id,
        side: dto.type === 'BUY' ? 'buy' : 'sell',
        quantityRequested: dto.quantity,
        amountFcfa: BigInt(estimatedTotal),
        status: dto.orderType === 'MARKET' ? 'executing' : 'pending',
      },
    });

    this.logger.log(
      `Trade order created: ${tradeOrder.id} - ${dto.type} ${dto.quantity} ${dto.assetSymbol} (${dto.orderType})`,
    );

    return {
      tradeId: tradeOrder.id,
      status: tradeOrder.status,
      type: dto.type,
      assetSymbol: dto.assetSymbol,
      quantity: dto.quantity,
      orderType: dto.orderType,
      estimatedPrice,
      estimatedTotal,
      message:
        dto.orderType === 'MARKET'
          ? 'Market order is being executed'
          : `Limit order placed at ${dto.limitPrice} XOF`,
    };
  }

  async getTrades(userId: string, query: TradeQuery): Promise<any> {
    const { portfolioId, page, limit } = query;
    const skip = (page - 1) * Math.min(limit, 100);
    const take = Math.min(limit, 100);

    // Find user's portfolio IDs to scope the query
    const portfolioWhere: any = { userId };
    if (portfolioId) {
      portfolioWhere.id = portfolioId;
    }
    const userPortfolios = await this.db.portfolio.findMany({
      where: portfolioWhere,
      select: { id: true },
    });
    const portfolioIds = userPortfolios.map((p) => p.id);

    const where: any = { portfolioId: { in: portfolioIds } };

    const [trades, total] = await Promise.all([
      this.db.tradeOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.db.tradeOrder.count({ where }),
    ]);

    return {
      data: trades,
      pagination: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async getTrade(userId: string, tradeId: string): Promise<any> {
    const trade = await this.db.tradeOrder.findFirst({
      where: { id: tradeId },
      include: { portfolio: { select: { userId: true } } },
    });

    if (!trade || trade.portfolio.userId !== userId) {
      throw new NotFoundException('Trade not found');
    }

    return trade;
  }

  async getHoldings(userId: string, portfolioId?: string): Promise<any> {
    // TODO: Fetch current prices from MarketsService
    // TODO: Compute market value and unrealized gain/loss

    const portfolioWhere: any = { userId };
    if (portfolioId) {
      portfolioWhere.id = portfolioId;
    }
    const userPortfolios = await this.db.portfolio.findMany({
      where: portfolioWhere,
      select: { id: true },
    });
    const portfolioIds = userPortfolios.map((p) => p.id);

    const holdings = await this.db.holding.findMany({
      where: { portfolioId: { in: portfolioIds } },
      orderBy: { currentValueFcfa: 'desc' },
    });

    return {
      holdings: holdings.map((h) => ({
        portfolioId: h.portfolioId,
        assetId: h.assetId,
        quantity: h.quantity,
        averageCostFcfa: h.averageCostFcfa,
        currentValueFcfa: h.currentValueFcfa,
        unrealizedGain: BigInt(0), // TODO: Compute
        unrealizedGainPercent: 0,
      })),
      totalMarketValue: holdings.reduce((sum, h) => sum + (h.currentValueFcfa || BigInt(0)), BigInt(0)),
    };
  }

  async getHolding(userId: string, assetSymbol: string, portfolioId?: string): Promise<any> {
    // Look up asset by ticker
    const asset = await this.db.asset.findFirst({
      where: { ticker: assetSymbol.toUpperCase() },
    });

    if (!asset) {
      throw new NotFoundException(`Asset ${assetSymbol} not found`);
    }

    const portfolioWhere: any = { userId };
    if (portfolioId) {
      portfolioWhere.id = portfolioId;
    }
    const userPortfolios = await this.db.portfolio.findMany({
      where: portfolioWhere,
      select: { id: true },
    });
    const portfolioIds = userPortfolios.map((p) => p.id);

    const holding = await this.db.holding.findFirst({
      where: { assetId: asset.id, portfolioId: { in: portfolioIds } },
    });

    if (!holding) {
      throw new NotFoundException(`No holding found for ${assetSymbol}`);
    }

    // TODO: Fetch current price and compute detailed gain/loss breakdown

    return {
      assetId: holding.assetId,
      portfolioId: holding.portfolioId,
      quantity: holding.quantity,
      averageCostFcfa: holding.averageCostFcfa,
      currentValueFcfa: holding.currentValueFcfa,
      unrealizedGain: BigInt(0),
      unrealizedGainPercent: 0,
    };
  }

  async getSummary(userId: string) {
    // TODO: Aggregate all holdings across all portfolios
    // TODO: Compute total invested, total current value, total return

    const userPortfolios = await this.db.portfolio.findMany({
      where: { userId },
      select: { id: true },
    });
    const portfolioIds = userPortfolios.map((p) => p.id);

    const holdings = await this.db.holding.findMany({
      where: { portfolioId: { in: portfolioIds } },
    });

    const totalMarketValue = holdings.reduce((sum, h) => sum + (h.currentValueFcfa || BigInt(0)), BigInt(0));
    // averageCostFcfa is Decimal, convert to Number for calculation
    const totalCostBasis = holdings.reduce(
      (sum, h) => sum + Number(h.averageCostFcfa || 0) * Number(h.quantity || 0),
      0,
    );

    return {
      totalInvested: totalCostBasis,
      totalMarketValue,
      totalReturn: Number(totalMarketValue) - totalCostBasis,
      totalReturnPercent: totalCostBasis > 0
        ? ((Number(totalMarketValue) - totalCostBasis) / totalCostBasis) * 100
        : 0,
      holdingCount: holdings.length,
      assetBreakdown: [], // TODO: Group by asset class
    };
  }
}
