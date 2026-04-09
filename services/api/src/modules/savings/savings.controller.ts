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
import { SavingsService } from './savings.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { ContributeGoalDto } from './dto/contribute-goal.dto';
import { CreateRecurringDto } from './dto/create-recurring.dto';

@ApiTags('savings')
@ApiBearerAuth()
@Controller('savings')
export class SavingsController {
  constructor(private readonly savingsService: SavingsService) {}

  @Post('goals')
  @ApiOperation({
    summary: 'Create a savings goal',
    description: 'Creates a new savings goal with a target amount and date. Optionally makes an initial contribution.',
  })
  @ApiCreatedResponse({ description: 'Goal created' })
  @ApiBadRequestResponse({ description: 'Invalid goal data' })
  async createGoal(@Request() req: any, @Body() dto: CreateGoalDto) {
    return this.savingsService.createGoal(req.user?.id, dto);
  }

  @Get('goals')
  @ApiOperation({
    summary: 'List all savings goals',
    description: 'Returns all savings goals with their progress and contribution history summary.',
  })
  @ApiOkResponse({ description: 'Goals list returned' })
  async getGoals(@Request() req: any) {
    return this.savingsService.getGoals(req.user?.id);
  }

  @Get('goals/:id')
  @ApiOperation({
    summary: 'Get savings goal details',
    description: 'Returns detailed information about a savings goal including contribution history.',
  })
  @ApiParam({ name: 'id', description: 'Goal UUID' })
  @ApiOkResponse({ description: 'Goal details returned' })
  @ApiNotFoundResponse({ description: 'Goal not found' })
  async getGoal(@Request() req: any, @Param('id') id: string) {
    return this.savingsService.getGoal(req.user?.id, id);
  }

  @Post('goals/:id/contribute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Make a contribution to a savings goal',
    description: 'Transfers funds from the user cash balance to the savings goal vault.',
  })
  @ApiParam({ name: 'id', description: 'Goal UUID' })
  @ApiOkResponse({ description: 'Contribution successful' })
  @ApiBadRequestResponse({ description: 'Insufficient balance or invalid PIN' })
  async contribute(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: ContributeGoalDto,
  ) {
    return this.savingsService.contribute(req.user?.id, id, dto);
  }

  @Post('goals/:id/withdraw')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Withdraw from a savings goal',
    description: 'Moves funds from the savings goal vault back to the user cash balance.',
  })
  @ApiParam({ name: 'id', description: 'Goal UUID' })
  @ApiOkResponse({ description: 'Withdrawal successful' })
  async withdraw(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: ContributeGoalDto,
  ) {
    return this.savingsService.withdraw(req.user?.id, id, dto);
  }

  @Put('goals/:id')
  @ApiOperation({
    summary: 'Update a savings goal',
    description: 'Updates goal name, target amount, or target date.',
  })
  @ApiParam({ name: 'id', description: 'Goal UUID' })
  @ApiOkResponse({ description: 'Goal updated' })
  async updateGoal(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: Partial<CreateGoalDto>,
  ) {
    return this.savingsService.updateGoal(req.user?.id, id, dto);
  }

  @Delete('goals/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a savings goal',
    description: 'Closes the goal and returns any saved funds to the cash balance.',
  })
  @ApiParam({ name: 'id', description: 'Goal UUID' })
  async deleteGoal(@Request() req: any, @Param('id') id: string) {
    return this.savingsService.deleteGoal(req.user?.id, id);
  }

  @Post('recurring')
  @ApiOperation({
    summary: 'Set up a recurring deposit',
    description: 'Creates a scheduled recurring deposit from mobile money to a savings goal.',
  })
  @ApiCreatedResponse({ description: 'Recurring deposit scheduled' })
  async createRecurring(@Request() req: any, @Body() dto: CreateRecurringDto) {
    return this.savingsService.createRecurring(req.user?.id, dto);
  }

  @Get('recurring')
  @ApiOperation({
    summary: 'List recurring deposits',
    description: 'Returns all active recurring deposit schedules.',
  })
  @ApiOkResponse({ description: 'Recurring deposits list returned' })
  async getRecurring(@Request() req: any) {
    return this.savingsService.getRecurring(req.user?.id);
  }

  @Delete('recurring/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Cancel a recurring deposit',
    description: 'Cancels an active recurring deposit schedule.',
  })
  @ApiParam({ name: 'id', description: 'Recurring deposit UUID' })
  async cancelRecurring(@Request() req: any, @Param('id') id: string) {
    return this.savingsService.cancelRecurring(req.user?.id, id);
  }

  @Get('vault')
  @ApiOperation({
    summary: 'Get savings vault summary',
    description: 'Returns the total savings across all goals and overall progress.',
  })
  @ApiOkResponse({ description: 'Vault summary returned' })
  async getVault(@Request() req: any) {
    return this.savingsService.getVault(req.user?.id);
  }
}
