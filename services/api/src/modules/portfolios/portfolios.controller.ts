import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiParam,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { PortfoliosService } from './portfolios.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { RebalanceDto } from './dto/rebalance.dto';

@ApiTags('portfolios')
@ApiBearerAuth()
@Controller('portfolios')
export class PortfoliosController {
  constructor(private readonly portfoliosService: PortfoliosService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new portfolio',
    description:
      'Creates a portfolio with the specified strategy. For non-CUSTOM strategies, the robo-advisor computes the target allocation based on the user risk profile.',
  })
  @ApiCreatedResponse({ description: 'Portfolio created' })
  @ApiBadRequestResponse({ description: 'Invalid portfolio data or risk assessment not completed' })
  async create(@Request() req: any, @Body() dto: CreatePortfolioDto) {
    return this.portfoliosService.create(req.user?.id, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all portfolios',
    description: 'Returns all portfolios owned by the authenticated user with summary performance data.',
  })
  @ApiOkResponse({ description: 'Portfolio list returned' })
  async findAll(@Request() req: any) {
    return this.portfoliosService.findAll(req.user?.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get portfolio details',
    description: 'Returns detailed portfolio information including holdings, allocation, and performance metrics.',
  })
  @ApiParam({ name: 'id', description: 'Portfolio UUID' })
  @ApiOkResponse({ description: 'Portfolio details returned' })
  @ApiNotFoundResponse({ description: 'Portfolio not found' })
  async findOne(@Request() req: any, @Param('id') id: string): Promise<any> {
    return this.portfoliosService.findOne(req.user?.id, id);
  }

  @Get(':id/performance')
  @ApiOperation({
    summary: 'Get portfolio performance',
    description: 'Returns time-series performance data, returns, and benchmark comparison.',
  })
  @ApiParam({ name: 'id', description: 'Portfolio UUID' })
  @ApiOkResponse({ description: 'Performance data returned' })
  async getPerformance(@Request() req: any, @Param('id') id: string) {
    return this.portfoliosService.getPerformance(req.user?.id, id);
  }

  @Get(':id/allocation')
  @ApiOperation({
    summary: 'Get current vs target allocation',
    description: 'Returns the current asset allocation compared to the target allocation, highlighting drift.',
  })
  @ApiParam({ name: 'id', description: 'Portfolio UUID' })
  @ApiOkResponse({ description: 'Allocation data returned' })
  async getAllocation(@Request() req: any, @Param('id') id: string) {
    return this.portfoliosService.getAllocation(req.user?.id, id);
  }

  @Post(':id/rebalance')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rebalance portfolio',
    description:
      'Triggers a portfolio rebalance. If autoRebalance is true, the robo-advisor computes the optimal trades. Otherwise, applies the provided target allocations.',
  })
  @ApiParam({ name: 'id', description: 'Portfolio UUID' })
  @ApiOkResponse({ description: 'Rebalancing trades generated' })
  @ApiBadRequestResponse({ description: 'Invalid rebalance request' })
  async rebalance(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: RebalanceDto,
  ) {
    return this.portfoliosService.rebalance(req.user?.id, id, dto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update portfolio settings',
    description: 'Updates portfolio name, description, or strategy.',
  })
  @ApiParam({ name: 'id', description: 'Portfolio UUID' })
  @ApiOkResponse({ description: 'Portfolio updated' })
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: Partial<CreatePortfolioDto>,
  ) {
    return this.portfoliosService.update(req.user?.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete portfolio',
    description: 'Liquidates all holdings and deletes the portfolio. Funds are returned to the cash balance.',
  })
  @ApiParam({ name: 'id', description: 'Portfolio UUID' })
  async remove(@Request() req: any, @Param('id') id: string) {
    return this.portfoliosService.remove(req.user?.id, id);
  }
}
