import { apiClient, ApiResponse } from './client';

export type GoalType =
  | 'emergency'
  | 'hajj'
  | 'education'
  | 'housing'
  | 'business'
  | 'retirement'
  | 'wedding'
  | 'custom';

export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled';

export interface SavingsGoal {
  id: string;
  name: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  /** 0-1 progress ratio */
  progress: number;
  monthlyContribution: number;
  deadline: string;
  status: GoalStatus;
  /** Linked portfolio for invested goals */
  portfolioId?: string;
  /** Auto-invest enabled */
  autoInvest: boolean;
  createdAt: string;
  /** Icon name for the goal type */
  icon: string;
  /** Color accent for the goal */
  color: string;
}

export interface CreateGoalRequest {
  name: string;
  type: GoalType;
  targetAmount: number;
  monthlyContribution: number;
  deadline: string;
  autoInvest?: boolean;
  /** Risk profile for auto-invested goals */
  riskProfile?: string;
}

export interface UpdateGoalRequest {
  name?: string;
  targetAmount?: number;
  monthlyContribution?: number;
  deadline?: string;
  autoInvest?: boolean;
  status?: GoalStatus;
}

export interface GoalContribution {
  id: string;
  goalId: string;
  amount: number;
  type: 'manual' | 'auto';
  createdAt: string;
}

/** API calls */

export async function getGoals(): Promise<ApiResponse<SavingsGoal[]>> {
  const response = await apiClient.get<ApiResponse<SavingsGoal[]>>('/savings/goals');
  return response.data;
}

export async function getGoal(id: string): Promise<ApiResponse<SavingsGoal>> {
  const response = await apiClient.get<ApiResponse<SavingsGoal>>(`/savings/goals/${id}`);
  return response.data;
}

export async function createGoal(data: CreateGoalRequest): Promise<ApiResponse<SavingsGoal>> {
  const response = await apiClient.post<ApiResponse<SavingsGoal>>('/savings/goals', data);
  return response.data;
}

export async function updateGoal(
  id: string,
  data: UpdateGoalRequest,
): Promise<ApiResponse<SavingsGoal>> {
  const response = await apiClient.patch<ApiResponse<SavingsGoal>>(`/savings/goals/${id}`, data);
  return response.data;
}

export async function contributeToGoal(
  id: string,
  amount: number,
): Promise<ApiResponse<GoalContribution>> {
  const response = await apiClient.post<ApiResponse<GoalContribution>>(
    `/savings/goals/${id}/contribute`,
    { amount },
  );
  return response.data;
}

export async function getGoalContributions(
  id: string,
): Promise<ApiResponse<GoalContribution[]>> {
  const response = await apiClient.get<ApiResponse<GoalContribution[]>>(
    `/savings/goals/${id}/contributions`,
  );
  return response.data;
}

export async function deleteGoal(id: string): Promise<void> {
  await apiClient.delete(`/savings/goals/${id}`);
}
