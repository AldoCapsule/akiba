import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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
  private readonly logger = new Logger(MarketsService.name);

  constructor(private readonly db: DatabaseService) {}

  async getAssets(query: AssetQuery) {
    const { type, sector, page, limit } = query;
    const skip = (page - 1) * Math.min(limit, 100);
    const take = Math.min(limit, 100);

    const where: any = {};
    if (type) where.type = type;
    if (sector) where.sector = sector;

    const [assets, total] = await Promise.all([
      this.db.asset.findMany({
        where,
        orderBy: { symbol: 'asc' },
        skip,
        take,
        select: {
          id: true,
          symbol: true,
          name: true,
          type: true,
          sector: true,
          currency: true,
          lastPrice: true,
          changePercent: true,
          marketCap: true,
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
          { symbol: { contains: query.toUpperCase() } },
          { name: { contains: query, mode: 'insensitive' } },
          { isin: { contains: query.toUpperCase() } },
        ],
      },
      take: 20,
      select: {
        id: true,
        symbol: true,
        name: true,
        type: true,
        lastPrice: true,
        changePercent: true,
      },
    });

    return { data: assets };
  }

  async getAsset(symbol: string) {
    const asset = await this.db.asset.findFirst({
      where: { symbol: symbol.toUpperCase() },
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
      where: { symbol: symbol.toUpperCase() },
      select: {
        symbol: true,
        lastPrice: true,
        previousClose: true,
        changePercent: true,
        dayHigh: true,
        dayLow: true,
        volume: true,
        updatedAt: true,
      },
    });

    if (!asset) {
      throw new NotFoundException(`Asset ${symbol} not found`);
    }

    // TODO: Fetch real-time price from BRVM data feed

    return {
      ...asset,
      currency: 'XOF',
      change: asset.lastPrice && asset.previousClose
        ? asset.lastPrice - asset.previousClose
        : 0,
    };
  }

  async getPriceHistory(symbol: string, query: PriceHistoryQuery) {
    const asset = await this.db.asset.findFirst({
      where: { symbol: symbol.toUpperCase() },
    });

    if (!asset) {
      throw new NotFoundException(`Asset ${symbol} not found`);
    }

    // TODO: Query price_history table with date range and interval
    // TODO: If data is stale, fetch from market data provider and cache

    const where: any = { assetId: asset.id };
    if (query.from) where.date = { ...where.date, gte: new Date(query.from) };
    if (query.to) where.date = { ...where.date, lte: new Date(query.to) };

    const history = await this.db.priceHistory.findMany({
      where,
      orderBy: { date: 'asc' },
      select: {
        date: true,
        open: true,
        high: true,
        low: true,
        close: true,
        volume: true,
      },
    });

    return {
      symbol: asset.symbol,
      interval: query.interval,
      data: history,
    };
  }

  async getIndices() {
    // TODO: Fetch live index data from BRVM data feed
    // TODO: Cache with short TTL (1-5 minutes during trading hours)

    const indices = await this.db.marketIndex.findMany({
      orderBy: { name: 'asc' },
    });

    return {
      data: indices.length > 0 ? indices : [
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

    const [gainers, losers, mostTraded] = await Promise.all([
      this.db.asset.findMany({
        where: { changePercent: { gt: 0 } },
        orderBy: { changePercent: 'desc' },
        take: 5,
        select: { symbol: true, name: true, lastPrice: true, changePercent: true },
      }),
      this.db.asset.findMany({
        where: { changePercent: { lt: 0 } },
        orderBy: { changePercent: 'asc' },
        take: 5,
        select: { symbol: true, name: true, lastPrice: true, changePercent: true },
      }),
      this.db.asset.findMany({
        orderBy: { volume: 'desc' },
        take: 5,
        select: { symbol: true, name: true, lastPrice: true, volume: true, changePercent: true },
      }),
    ]);

    return { gainers, losers, mostTraded };
  }
}
