import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
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
    // TODO: Create trade record

    const portfolio = await this.db.portfolio.findFirst({
      where: { id: dto.portfolioId, userId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    // TODO: Replace with actual price lookup
    const estimatedPrice = dto.limitPrice || 0;
    const estimatedTotal = estimatedPrice * dto.quantity;

    const trade = await this.db.trade.create({
      data: {
        userId,
        portfolioId: dto.portfolioId,
        assetSymbol: dto.assetSymbol,
        type: dto.type,
        orderType: dto.orderType,
        quantity: dto.quantity,
        limitPrice: dto.limitPrice,
        estimatedPrice,
        estimatedTotal,
        note: dto.note,
        status: dto.orderType === 'MARKET' ? 'EXECUTING' : 'PENDING',
      },
    });

    this.logger.log(
      `Trade created: ${trade.id} - ${dto.type} ${dto.quantity} ${dto.assetSymbol} (${dto.orderType})`,
    );

    return {
      tradeId: trade.id,
      status: trade.status,
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

  async getTrades(userId: string, query: TradeQuery) {
    const { portfolioId, page, limit } = query;
    const skip = (page - 1) * Math.min(limit, 100);
    const take = Math.min(limit, 100);

    const where: any = { userId };
    if (portfolioId) {
      where.portfolioId = portfolioId;
    }

    const [trades, total] = await Promise.all([
      this.db.trade.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.db.trade.count({ where }),
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

  async getTrade(userId: string, tradeId: string) {
    const trade = await this.db.trade.findFirst({
      where: { id: tradeId, userId },
    });

    if (!trade) {
      throw new NotFoundException('Trade not found');
    }

    return trade;
  }

  async getHoldings(userId: string, portfolioId?: string) {
    // TODO: Query holdings table grouped by asset
    // TODO: Fetch current prices from MarketsService
    // TODO: Compute market value and unrealized gain/loss

    const where: any = { userId };
    if (portfolioId) {
      where.portfolioId = portfolioId;
    }

    const holdings = await this.db.holding.findMany({
      where,
      orderBy: { marketValue: 'desc' },
    });

    return {
      holdings: holdings.map((h) => ({
        assetSymbol: h.assetSymbol,
        quantity: h.quantity,
        averageCost: h.averageCost,
        currentPrice: 0, // TODO: Fetch live price
        marketValue: h.marketValue,
        unrealizedGain: 0, // TODO: Compute
        unrealizedGainPercent: 0,
      })),
      totalMarketValue: holdings.reduce((sum, h) => sum + (h.marketValue || 0), 0),
    };
  }

  async getHolding(userId: string, assetSymbol: string, portfolioId?: string) {
    const where: any = { userId, assetSymbol };
    if (portfolioId) {
      where.portfolioId = portfolioId;
    }

    const holding = await this.db.holding.findFirst({ where });

    if (!holding) {
      throw new NotFoundException(`No holding found for ${assetSymbol}`);
    }

    // TODO: Fetch current price and compute detailed gain/loss breakdown

    return {
      assetSymbol: holding.assetSymbol,
      quantity: holding.quantity,
      averageCost: holding.averageCost,
      totalCostBasis: holding.averageCost * holding.quantity,
      currentPrice: 0, // TODO: Fetch live
      marketValue: holding.marketValue,
      unrealizedGain: 0,
      unrealizedGainPercent: 0,
    };
  }

  async getSummary(userId: string) {
    // TODO: Aggregate all holdings across all portfolios
    // TODO: Compute total invested, total current value, total return

    const holdings = await this.db.holding.findMany({
      where: { userId },
    });

    const totalMarketValue = holdings.reduce((sum, h) => sum + (h.marketValue || 0), 0);
    const totalCostBasis = holdings.reduce(
      (sum, h) => sum + (h.averageCost || 0) * (h.quantity || 0),
      0,
    );

    return {
      totalInvested: totalCostBasis,
      totalMarketValue,
      totalReturn: totalMarketValue - totalCostBasis,
      totalReturnPercent: totalCostBasis > 0
        ? ((totalMarketValue - totalCostBasis) / totalCostBasis) * 100
        : 0,
      holdingCount: holdings.length,
      assetBreakdown: [], // TODO: Group by asset class
    };
  }
}
