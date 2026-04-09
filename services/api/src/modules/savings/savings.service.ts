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
        category: dto.category,
        targetAmount: dto.targetAmount,
        targetDate: new Date(dto.targetDate),
        description: dto.description,
        currentAmount: dto.initialContribution || 0,
        status: 'ACTIVE',
      },
    });

    if (dto.initialContribution) {
      await this.db.savingsContribution.create({
        data: {
          goalId: goal.id,
          userId,
          amount: dto.initialContribution,
          type: 'DEPOSIT',
          note: 'Initial contribution',
        },
      });
    }

    this.logger.log(`Savings goal created: ${goal.id} - ${dto.name} (${dto.targetAmount} XOF)`);

    return {
      id: goal.id,
      name: goal.name,
      category: goal.category,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      progressPercent: goal.targetAmount > 0
        ? Math.round((goal.currentAmount / goal.targetAmount) * 100)
        : 0,
      targetDate: goal.targetDate,
      status: 'ACTIVE',
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
      category: g.category,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      progressPercent: g.targetAmount > 0
        ? Math.round((g.currentAmount / g.targetAmount) * 100)
        : 0,
      targetDate: g.targetDate,
      status: g.status,
    }));
  }

  async getGoal(userId: string, goalId: string) {
    const goal = await this.db.savingsGoal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new NotFoundException('Savings goal not found');
    }

    const contributions = await this.db.savingsContribution.findMany({
      where: { goalId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const daysRemaining = Math.max(
      0,
      Math.ceil((goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    );

    const remaining = goal.targetAmount - goal.currentAmount;
    const monthlyNeeded = daysRemaining > 0
      ? Math.ceil(remaining / (daysRemaining / 30))
      : remaining;

    return {
      ...goal,
      progressPercent: goal.targetAmount > 0
        ? Math.round((goal.currentAmount / goal.targetAmount) * 100)
        : 0,
      remaining,
      daysRemaining,
      monthlyNeeded,
      contributions,
    };
  }

  async contribute(userId: string, goalId: string, dto: ContributeGoalDto) {
    // TODO: Verify PIN
    // TODO: Verify sufficient cash balance
    // TODO: Debit cash balance, credit savings goal

    const goal = await this.db.savingsGoal.findFirst({
      where: { id: goalId, userId, status: 'ACTIVE' },
    });

    if (!goal) {
      throw new NotFoundException('Active savings goal not found');
    }

    const newAmount = goal.currentAmount + dto.amount;

    await this.db.savingsGoal.update({
      where: { id: goalId },
      data: {
        currentAmount: newAmount,
        status: newAmount >= goal.targetAmount ? 'COMPLETED' : 'ACTIVE',
        updatedAt: new Date(),
      },
    });

    await this.db.savingsContribution.create({
      data: {
        goalId,
        userId,
        amount: dto.amount,
        type: 'DEPOSIT',
        note: dto.note,
      },
    });

    this.logger.log(`Contribution of ${dto.amount} XOF to goal ${goalId}`);

    return {
      goalId,
      contributed: dto.amount,
      newBalance: newAmount,
      progressPercent: goal.targetAmount > 0
        ? Math.round((newAmount / goal.targetAmount) * 100)
        : 0,
      isCompleted: newAmount >= goal.targetAmount,
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

    if (goal.currentAmount < dto.amount) {
      throw new BadRequestException(
        `Insufficient goal balance. Available: ${goal.currentAmount} XOF`,
      );
    }

    const newAmount = goal.currentAmount - dto.amount;

    await this.db.savingsGoal.update({
      where: { id: goalId },
      data: { currentAmount: newAmount, updatedAt: new Date() },
    });

    await this.db.savingsContribution.create({
      data: {
        goalId,
        userId,
        amount: dto.amount,
        type: 'WITHDRAWAL',
        note: dto.note,
      },
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
        targetAmount: dto.targetAmount,
        targetDate: dto.targetDate ? new Date(dto.targetDate) : undefined,
        description: dto.description,
        updatedAt: new Date(),
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      targetAmount: updated.targetAmount,
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
      data: { status: 'CLOSED', updatedAt: new Date() },
    });

    this.logger.log(`Savings goal ${goalId} closed. Returned ${goal.currentAmount} XOF to cash.`);
  }

  async createRecurring(userId: string, dto: CreateRecurringDto) {
    // TODO: Verify goal exists and belongs to user
    // TODO: Verify source account is a valid mobile money number
    // TODO: Register recurring debit with payment provider

    const goal = await this.db.savingsGoal.findFirst({
      where: { id: dto.goalId, userId, status: 'ACTIVE' },
    });

    if (!goal) {
      throw new NotFoundException('Active savings goal not found');
    }

    const recurring = await this.db.recurringDeposit.create({
      data: {
        userId,
        goalId: dto.goalId,
        amount: dto.amount,
        frequency: dto.frequency,
        sourceAccount: dto.sourceAccount,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : goal.targetDate,
        status: 'ACTIVE',
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
      status: 'ACTIVE',
    };
  }

  async getRecurring(userId: string) {
    const deposits = await this.db.recurringDeposit.findMany({
      where: { userId, status: 'ACTIVE' },
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
      data: { status: 'CANCELLED', updatedAt: new Date() },
    });

    this.logger.log(`Recurring deposit ${recurringId} cancelled`);
  }

  async getVault(userId: string) {
    const goals = await this.db.savingsGoal.findMany({
      where: { userId, status: 'ACTIVE' },
    });

    const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);

    return {
      totalSaved,
      totalTarget,
      overallProgress: totalTarget > 0
        ? Math.round((totalSaved / totalTarget) * 100)
        : 0,
      activeGoals: goals.length,
      currency: 'XOF',
    };
  }
}
