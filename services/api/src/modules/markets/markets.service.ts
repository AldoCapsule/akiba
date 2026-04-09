import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

interface AssetQuery {
  type?: string;
  sector?: string;
  page: number;
  limit: number;
}

interface PriceHistoryQuery {
  interval: string;
  from?: string;
  to?: string;
}

@Injectable()
export class MarketsService {
  constructor(private readonly db: DatabaseService) {}

  async getAssets(query: AssetQuery) {
    const { type, sector, page, limit } = query;
    const skip = (page - 1) * Math.min(limit, 100);
    const take = Math.min(limit, 100);

    const where: any = {};
    if (type) where.assetType = type;
    if (sector) where.sector = sector;

    const [assets, total] = await Promise.all([
      this.db.asset.findMany({
        where,
        orderBy: { ticker: 'asc' },
        skip,
        take,
        select: {
          id: true,
          ticker: true,
          name: true,
          assetType: true,
          sector: true,
          currency: true,
          currentPriceFcfa: true,
          riskLevel: true,
          isShareCompliant: true,
        },
      }),
      this.db.asset.count({ where }),
    ]);

    return {
      data: assets,
      pagination: { page, limit: take, total, totalPages: Math.ceil(total / take) },
    };
  }

  async searchAssets(query: string) {
    if (!query || query.length < 2) {
      return { data: [] };
    }

    // TODO: Implement full-text search or use a search engine
    const assets = await this.db.asset.findMany({
      where: {
        OR: [
          { ticker: { contains: query.toUpperCase() } },
          { name: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
      select: {
        id: true,
        ticker: true,
        name: true,
        assetType: true,
        currentPriceFcfa: true,
        riskLevel: true,
      },
    });

    return { data: assets };
  }

  async getAsset(symbol: string) {
    const asset = await this.db.asset.findFirst({
      where: { ticker: symbol.toUpperCase() },
    });

    if (!asset) {
      throw new NotFoundException(`Asset ${symbol} not found`);
    }

    // TODO: Enrich with real-time data from market data provider
    // TODO: Include company financials (P/E, EPS, dividend yield)

    return asset;
  }

  async getPrice(symbol: string) {
    const asset = await this.db.asset.findFirst({
      where: { ticker: symbol.toUpperCase() },
      select: {
        ticker: true,
        currentPriceFcfa: true,
        lastPriceUpdate: true,
        riskLevel: true,
      },
    });

    if (!asset) {
      throw new NotFoundException(`Asset ${symbol} not found`);
    }

    // TODO: Fetch real-time price from BRVM data feed

    return {
      ...asset,
      currency: 'XOF',
    };
  }

  async getPriceHistory(symbol: string, query: PriceHistoryQuery) {
    const asset = await this.db.asset.findFirst({
      where: { ticker: symbol.toUpperCase() },
    });

    if (!asset) {
      throw new NotFoundException(`Asset ${symbol} not found`);
    }

    // TODO: Query price_history table with date range and interval
    // TODO: If data is stale, fetch from market data provider and cache

    const where: any = { assetId: asset.id };
    if (query.from) where.date = { ...where.date, gte: new Date(query.from) };
    if (query.to) where.date = { ...where.date, lte: new Date(query.to) };

    const history = await this.db.assetPriceHistory.findMany({
      where,
      orderBy: { date: 'asc' },
      select: {
        date: true,
        priceFcfa: true,
        openFcfa: true,
        highFcfa: true,
        lowFcfa: true,
        volume: true,
      },
    });

    return {
      ticker: asset.ticker,
      interval: query.interval,
      data: history,
    };
  }

  async getIndices() {
    // TODO: Fetch live index data from BRVM data feed
    // TODO: Cache with short TTL (1-5 minutes during trading hours)
    // Note: No marketIndex model in Prisma; return placeholder data

    return {
      data: [
        {
          name: 'BRVM Composite',
          value: 0,
          change: 0,
          changePercent: 0,
          updatedAt: new Date().toISOString(),
        },
        {
          name: 'BRVM 10',
          value: 0,
          change: 0,
          changePercent: 0,
          updatedAt: new Date().toISOString(),
        },
      ],
    };
  }

  async getMovers() {
    // TODO: Query assets sorted by daily change percentage
    // TODO: Cache with short TTL
    // Note: No changePercent or volume on Asset model; use priceHistory to compute movers

    const assets = await this.db.asset.findMany({
      where: { isActive: true },
      take: 15,
      select: {
        ticker: true,
        name: true,
        currentPriceFcfa: true,
        assetType: true,
      },
      orderBy: { lastPriceUpdate: 'desc' },
    });

    // TODO: Compute gainers/losers from price history comparison

    return {
      gainers: assets.slice(0, 5),
      losers: assets.slice(5, 10),
      mostTraded: assets.slice(10, 15),
    };
  }
}
