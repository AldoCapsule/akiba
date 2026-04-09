import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { MarketsService } from './markets.service';

@ApiTags('markets')
@Controller('markets')
export class MarketsController {
  constructor(private readonly marketsService: MarketsService) {}

  @Get('assets')
  @ApiOperation({
    summary: 'List all available assets',
    description:
      'Returns the catalog of investable assets including BRVM equities, government bonds, corporate bonds, and money market instruments.',
  })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by asset type (EQUITY, BOND, MONEY_MARKET, FUND)' })
  @ApiQuery({ name: 'sector', required: false, description: 'Filter by sector' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ description: 'Asset catalog returned' })
  async getAssets(
    @Query('type') type?: string,
    @Query('sector') sector?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.marketsService.getAssets({ type, sector, page, limit });
  }

  @Get('assets/search')
  @ApiOperation({
    summary: 'Search assets',
    description: 'Searches assets by name, ticker symbol, or ISIN code.',
  })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiOkResponse({ description: 'Search results returned' })
  async searchAssets(@Query('q') query: string) {
    return this.marketsService.searchAssets(query);
  }

  @Get('assets/:symbol')
  @ApiOperation({
    summary: 'Get asset details',
    description: 'Returns detailed information for a specific asset including description, financials, and latest price.',
  })
  @ApiParam({ name: 'symbol', description: 'Asset ticker symbol (e.g. SNTS, SGBC)' })
  @ApiOkResponse({ description: 'Asset details returned' })
  @ApiNotFoundResponse({ description: 'Asset not found' })
  async getAsset(@Param('symbol') symbol: string) {
    return this.marketsService.getAsset(symbol);
  }

  @Get('assets/:symbol/price')
  @ApiOperation({
    summary: 'Get current price',
    description: 'Returns the latest price and intraday data for an asset.',
  })
  @ApiParam({ name: 'symbol', description: 'Asset ticker symbol' })
  @ApiOkResponse({ description: 'Price data returned' })
  async getPrice(@Param('symbol') symbol: string) {
    return this.marketsService.getPrice(symbol);
  }

  @Get('assets/:symbol/history')
  @ApiOperation({
    summary: 'Get historical price data',
    description: 'Returns historical price data for charting. Supports daily, weekly, and monthly intervals.',
  })
  @ApiParam({ name: 'symbol', description: 'Asset ticker symbol' })
  @ApiQuery({ name: 'interval', required: false, enum: ['1D', '1W', '1M'], description: 'Data interval' })
  @ApiQuery({ name: 'from', required: false, description: 'Start date (ISO 8601)' })
  @ApiQuery({ name: 'to', required: false, description: 'End date (ISO 8601)' })
  @ApiOkResponse({ description: 'Historical price data returned' })
  async getPriceHistory(
    @Param('symbol') symbol: string,
    @Query('interval') interval = '1D',
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.marketsService.getPriceHistory(symbol, { interval, from, to });
  }

  @Get('indices')
  @ApiOperation({
    summary: 'Get market indices',
    description: 'Returns BRVM Composite and BRVM 10 index values and daily changes.',
  })
  @ApiOkResponse({ description: 'Index data returned' })
  async getIndices() {
    return this.marketsService.getIndices();
  }

  @Get('movers')
  @ApiOperation({
    summary: 'Get top movers',
    description: 'Returns top gainers, losers, and most traded assets of the day.',
  })
  @ApiOkResponse({ description: 'Movers data returned' })
  async getMovers() {
    return this.marketsService.getMovers();
  }
}
