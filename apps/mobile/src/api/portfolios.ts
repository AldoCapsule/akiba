import { apiClient, ApiResponse } from './client';

export interface PortfolioSummary {
  id: string;
  name: string;
  totalValue: number;
  totalInvested: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  /** ISO date of creation */
  createdAt: string;
}

export interface PortfolioHolding {
  assetId: string;
  assetName: string;
  assetType: 'equity' | 'bond' | 'sukuk' | 'fund';
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  /** Allocation weight in the portfolio (0-1) */
  weight: number;
  isHalal: boolean;
}

export interface PortfolioDetail extends PortfolioSummary {
  holdings: PortfolioHolding[];
  /** Daily performance history (last 30/90/365 days) */
  performance: PerformancePoint[];
}

export interface PerformancePoint {
  date: string;
  value: number;
}

export interface AllocationBreakdown {
  equities: number;
  bonds: number;
  sukuk: number;
  funds: number;
  cash: number;
}

export interface InvestRequest {
  assetId: string;
  amount: number;
  /** 'amount' = invest a CFA amount; 'quantity' = buy specific units */
  orderType: 'amount' | 'quantity';
}

export interface InvestResponse {
  orderId: string;
  status: 'pending' | 'executed' | 'failed';
  executedPrice?: number;
  executedQuantity?: number;
}

/** API calls */

export async function getPortfolios(): Promise<ApiResponse<PortfolioSummary[]>> {
  const response = await apiClient.get<ApiResponse<PortfolioSummary[]>>('/portfolios');
  return response.data;
}

export async function getPortfolio(
  id: string,
  period?: '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL',
): Promise<ApiResponse<PortfolioDetail>> {
  const response = await apiClient.get<ApiResponse<PortfolioDetail>>(`/portfolios/${id}`, {
    params: { period },
  });
  return response.data;
}

export async function getAllocation(): Promise<ApiResponse<AllocationBreakdown>> {
  const response = await apiClient.get<ApiResponse<AllocationBreakdown>>(
    '/portfolios/allocation',
  );
  return response.data;
}

export async function invest(data: InvestRequest): Promise<ApiResponse<InvestResponse>> {
  const response = await apiClient.post<ApiResponse<InvestResponse>>('/portfolios/invest', data);
  return response.data;
}

export async function redeemHolding(
  assetId: string,
  amount: number,
): Promise<ApiResponse<{ orderId: string; status: string }>> {
  const response = await apiClient.post<ApiResponse<{ orderId: string; status: string }>>(
    '/portfolios/redeem',
    { assetId, amount },
  );
  return response.data;
}
