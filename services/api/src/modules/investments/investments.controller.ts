import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { InvestmentsService } from './investments.service';
import { CreateTradeDto } from './dto/create-trade.dto';

@ApiTags('investments')
@ApiBearerAuth()
@Controller('investments')
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  @Post('trades')
  @ApiOperation({
    summary: 'Execute a trade',
    description:
      'Places a buy or sell order for a given asset within a portfolio. Market orders execute at the current price; limit orders wait until the target price is hit.',
  })
  @ApiCreatedResponse({ description: 'Trade order placed' })
  @ApiBadRequestResponse({ description: 'Invalid trade data, insufficient funds, or wrong PIN' })
  async createTrade(@Request() req: any, @Body() dto: CreateTradeDto) {
    return this.investmentsService.createTrade(req.user?.id, dto);
  }

  @Get('trades')
  @ApiOperation({
    summary: 'List trade history',
    description: 'Returns paginated trade history across all portfolios.',
  })
  @ApiQuery({ name: 'portfolioId', required: false, description: 'Filter by portfolio' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ description: 'Trade list returned' })
  async getTrades(
    @Request() req: any,
    @Query('portfolioId') portfolioId?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ): Promise<any> {
    return this.investmentsService.getTrades(req.user?.id, { portfolioId, page, limit });
  }

  @Get('trades/:id')
  @ApiOperation({
    summary: 'Get trade details',
    description: 'Returns details for a specific trade order.',
  })
  @ApiParam({ name: 'id', description: 'Trade UUID' })
  @ApiOkResponse({ description: 'Trade details returned' })
  @ApiNotFoundResponse({ description: 'Trade not found' })
  async getTrade(@Request() req: any, @Param('id') id: string): Promise<any> {
    return this.investmentsService.getTrade(req.user?.id, id);
  }

  @Get('holdings')
  @ApiOperation({
    summary: 'Get all holdings',
    description: 'Returns current holdings across all portfolios with market value.',
  })
  @ApiQuery({ name: 'portfolioId', required: false, description: 'Filter by portfolio' })
  @ApiOkResponse({ description: 'Holdings list returned' })
  async getHoldings(
    @Request() req: any,
    @Query('portfolioId') portfolioId?: string,
  ): Promise<any> {
    return this.investmentsService.getHoldings(req.user?.id, portfolioId);
  }

  @Get('holdings/:assetSymbol')
  @ApiOperation({
    summary: 'Get holding detail for a specific asset',
    description: 'Returns detailed information about a specific asset holding including cost basis and gain/loss.',
  })
  @ApiParam({ name: 'assetSymbol', description: 'Asset ticker symbol' })
  @ApiOkResponse({ description: 'Holding detail returned' })
  async getHolding(
    @Request() req: any,
    @Param('assetSymbol') assetSymbol: string,
    @Query('portfolioId') portfolioId?: string,
  ): Promise<any> {
    return this.investmentsService.getHolding(req.user?.id, assetSymbol, portfolioId);
  }

  @Get('summary')
  @ApiOperation({
    summary: 'Get investment summary',
    description: 'Returns an aggregate summary of all investments: total value, total return, asset breakdown.',
  })
  @ApiOkResponse({ description: 'Investment summary returned' })
  async getSummary(@Request() req: any) {
    return this.investmentsService.getSummary(req.user?.id);
  }
}
