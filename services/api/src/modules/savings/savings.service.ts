import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { ContributeGoalDto } from './dto/contribute-goal.dto';
import { CreateRecurringDto } from './dto/create-recurring.dto';

@Injectable()
export class SavingsService {
  private readonly logger = new Logger(SavingsService.name);

  constructor(private readonly db: DatabaseService) {}

  async createGoal(userId: string, dto: CreateGoalDto) {
    // TODO: If initialContribution provided, verify sufficient cash balance
    // TODO: Debit cash balance for initial contribution

    const goal = await this.db.savingsGoal.create({
      data: {
        userId,
        name: dto.name,
        goalType: dto.category.toLowerCase() as any,
        targetAmountFcfa: BigInt(dto.targetAmount),
        targetDate: new Date(dto.targetDate),
        currentAmountFcfa: BigInt(dto.initialContribution || 0),
        isActive: true,
      },
    });

    this.logger.log(`Savings goal created: ${goal.id} - ${dto.name} (${dto.targetAmount} XOF)`);

    return {
      id: goal.id,
      name: goal.name,
      goalType: goal.goalType,
      targetAmountFcfa: goal.targetAmountFcfa,
      currentAmountFcfa: goal.currentAmountFcfa,
      progressPercent: goal.targetAmountFcfa > BigInt(0)
        ? Math.round(Number(goal.currentAmountFcfa * BigInt(100) / goal.targetAmountFcfa))
        : 0,
      targetDate: goal.targetDate,
      isActive: goal.isActive,
    };
  }

  async getGoals(userId: string) {
    const goals = await this.db.savingsGoal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return goals.map((g) => ({
      id: g.id,
      name: g.name,
      goalType: g.goalType,
      targetAmountFcfa: g.targetAmountFcfa,
      currentAmountFcfa: g.currentAmountFcfa,
      progressPercent: g.targetAmountFcfa > BigInt(0)
        ? Math.round(Number(g.currentAmountFcfa * BigInt(100) / g.targetAmountFcfa))
        : 0,
      targetDate: g.targetDate,
      isActive: g.isActive,
    }));
  }

  async getGoal(userId: string, goalId: string) {
    const goal = await this.db.savingsGoal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new NotFoundException('Savings goal not found');
    }

    const daysRemaining = goal.targetDate
      ? Math.max(
          0,
          Math.ceil((goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        )
      : 0;

    const remaining = goal.targetAmountFcfa - goal.currentAmountFcfa;
    const monthlyNeeded = daysRemaining > 0
      ? Number(remaining) / (daysRemaining / 30)
      : Number(remaining);

    return {
      ...goal,
      progressPercent: goal.targetAmountFcfa > BigInt(0)
        ? Math.round(Number(goal.currentAmountFcfa * BigInt(100) / goal.targetAmountFcfa))
        : 0,
      remaining,
      daysRemaining,
      monthlyNeeded: Math.ceil(monthlyNeeded),
    };
  }

  async contribute(userId: string, goalId: string, dto: ContributeGoalDto) {
    // TODO: Verify PIN
    // TODO: Verify sufficient cash balance
    // TODO: Debit cash balance, credit savings goal

    const goal = await this.db.savingsGoal.findFirst({
      where: { id: goalId, userId, isActive: true },
    });

    if (!goal) {
      throw new NotFoundException('Active savings goal not found');
    }

    const contributionAmount = BigInt(dto.amount);
    const newAmount = goal.currentAmountFcfa + contributionAmount;
    const isCompleted = newAmount >= goal.targetAmountFcfa;

    await this.db.savingsGoal.update({
      where: { id: goalId },
      data: {
        currentAmountFcfa: newAmount,
        isActive: !isCompleted,
        completedAt: isCompleted ? new Date() : undefined,
      },
    });

    this.logger.log(`Contribution of ${dto.amount} XOF to goal ${goalId}`);

    return {
      goalId,
      contributed: dto.amount,
      newBalance: newAmount,
      progressPercent: goal.targetAmountFcfa > BigInt(0)
        ? Math.round(Number(newAmount * BigInt(100) / goal.targetAmountFcfa))
        : 0,
      isCompleted,
    };
  }

  async withdraw(userId: string, goalId: string, dto: ContributeGoalDto) {
    // TODO: Verify PIN
    // TODO: Credit cash balance

    const goal = await this.db.savingsGoal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new NotFoundException('Savings goal not found');
    }

    const withdrawalAmount = BigInt(dto.amount);

    if (goal.currentAmountFcfa < withdrawalAmount) {
      throw new BadRequestException(
        `Insufficient goal balance. Available: ${goal.currentAmountFcfa} XOF`,
      );
    }

    const newAmount = goal.currentAmountFcfa - withdrawalAmount;

    await this.db.savingsGoal.update({
      where: { id: goalId },
      data: { currentAmountFcfa: newAmount },
    });

    this.logger.log(`Withdrawal of ${dto.amount} XOF from goal ${goalId}`);

    return {
      goalId,
      withdrawn: dto.amount,
      newBalance: newAmount,
    };
  }

  async updateGoal(userId: string, goalId: string, dto: Partial<CreateGoalDto>) {
    const goal = await this.db.savingsGoal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new NotFoundException('Savings goal not found');
    }

    const updated = await this.db.savingsGoal.update({
      where: { id: goalId },
      data: {
        name: dto.name,
        targetAmountFcfa: dto.targetAmount ? BigInt(dto.targetAmount) : undefined,
        targetDate: dto.targetDate ? new Date(dto.targetDate) : undefined,
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      targetAmountFcfa: updated.targetAmountFcfa,
      targetDate: updated.targetDate,
      message: 'Goal updated',
    };
  }

  async deleteGoal(userId: string, goalId: string) {
    const goal = await this.db.savingsGoal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new NotFoundException('Savings goal not found');
    }

    // TODO: If goal has balance, transfer back to cash balance
    // TODO: Cancel any associated recurring deposits

    await this.db.savingsGoal.update({
      where: { id: goalId },
      data: { isActive: false },
    });

    this.logger.log(`Savings goal ${goalId} closed. Returned ${goal.currentAmountFcfa} XOF to cash.`);
  }

  async createRecurring(userId: string, dto: CreateRecurringDto) {
    // TODO: Verify goal exists and belongs to user
    // TODO: Verify source account is a valid mobile money number
    // TODO: Register recurring debit with payment provider

    const goal = await this.db.savingsGoal.findFirst({
      where: { id: dto.goalId, userId, isActive: true },
    });

    if (!goal) {
      throw new NotFoundException('Active savings goal not found');
    }

    const recurring = await this.db.recurringDeposit.create({
      data: {
        userId,
        savingsGoalId: dto.goalId,
        amountFcfa: BigInt(dto.amount),
        frequency: dto.frequency.toLowerCase() as any,
        sourceWalletType: dto.sourceAccount,
        nextExecutionDate: new Date(dto.startDate),
        isActive: true,
      },
    });

    this.logger.log(
      `Recurring deposit created: ${recurring.id} - ${dto.amount} XOF ${dto.frequency}`,
    );

    return {
      id: recurring.id,
      goalId: dto.goalId,
      goalName: goal.name,
      amount: dto.amount,
      frequency: dto.frequency,
      startDate: dto.startDate,
      isActive: true,
    };
  }

  async getRecurring(userId: string) {
    const deposits = await this.db.recurringDeposit.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return deposits;
  }

  async cancelRecurring(userId: string, recurringId: string) {
    const recurring = await this.db.recurringDeposit.findFirst({
      where: { id: recurringId, userId },
    });

    if (!recurring) {
      throw new NotFoundException('Recurring deposit not found');
    }

    // TODO: Cancel with payment provider

    await this.db.recurringDeposit.update({
      where: { id: recurringId },
      data: { isActive: false },
    });

    this.logger.log(`Recurring deposit ${recurringId} cancelled`);
  }

  async getVault(userId: string) {
    const goals = await this.db.savingsGoal.findMany({
      where: { userId, isActive: true },
    });

    const totalSaved = goals.reduce((sum, g) => sum + g.currentAmountFcfa, BigInt(0));
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmountFcfa, BigInt(0));

    return {
      totalSaved,
      totalTarget,
      overallProgress: totalTarget > BigInt(0)
        ? Math.round(Number(totalSaved * BigInt(100) / totalTarget))
        : 0,
      activeGoals: goals.length,
      currency: 'XOF',
    };
  }
}
