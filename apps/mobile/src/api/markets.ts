import { apiClient, ApiResponse, PaginatedResponse } from './client';

export type AssetType = 'equity' | 'bond' | 'sukuk' | 'fund';

export interface Asset {
  id: string;
  name: string;
  ticker: string;
  type: AssetType;
  price: number;
  /** Daily change percent */
  changePercent: number;
  /** Daily change absolute */
  changeAbsolute: number;
  currency: 'XOF';
  isHalal: boolean;
  /** BRVM market for equities */
  market?: string;
  /** Issuer for bonds/sukuk */
  issuer?: string;
  /** Fund manager for funds */
  manager?: string;
}

export interface AssetDetail extends Asset {
  description: string;
  marketCap?: number;
  volume24h?: number;
  high52w?: number;
  low52w?: number;
  peRatio?: number;
  dividendYield?: number;
  /** Maturity date for bonds/sukuk */
  maturityDate?: string;
  /** Coupon rate for bonds/sukuk */
  couponRate?: number;
  /** NAV for funds */
  nav?: number;
  /** Expense ratio for funds */
  expenseRatio?: number;
  /** Price history for charting */
  priceHistory: PricePoint[];
  /** Halal certification details */
  halalCertifier?: string;
  halalRating?: string;
}

export interface PricePoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface MarketIndex {
  name: string;
  value: number;
  changePercent: number;
}

/** API calls */

export async function getAssets(params?: {
  type?: AssetType;
  search?: string;
  halalOnly?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'price' | 'change' | 'volume';
  sortOrder?: 'asc' | 'desc';
}): Promise<PaginatedResponse<Asset>> {
  const response = await apiClient.get<PaginatedResponse<Asset>>('/markets/assets', { params });
  return response.data;
}

export async function getAsset(
  id: string,
  period?: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL',
): Promise<ApiResponse<AssetDetail>> {
  const response = await apiClient.get<ApiResponse<AssetDetail>>(`/markets/assets/${id}`, {
    params: { period },
  });
  return response.data;
}

export async function getMarketIndices(): Promise<ApiResponse<MarketIndex[]>> {
  const response = await apiClient.get<ApiResponse<MarketIndex[]>>('/markets/indices');
  return response.data;
}

export async function searchAssets(query: string): Promise<ApiResponse<Asset[]>> {
  const response = await apiClient.get<ApiResponse<Asset[]>>('/markets/search', {
    params: { q: query },
  });
  return response.data;
}
