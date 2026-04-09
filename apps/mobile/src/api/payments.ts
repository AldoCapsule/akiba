import { apiClient, ApiResponse, PaginatedResponse } from './client';

/** Payment provider IDs matching Senegalese PI-SPI ecosystem */
export type PaymentProvider = 'orange_money' | 'wave' | 'free_money' | 'bank_transfer';

export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type TransactionType = 'deposit' | 'withdrawal' | 'investment' | 'redemption' | 'dividend';

export interface DepositRequest {
  amount: number;
  provider: PaymentProvider;
  /** Provider-specific payment reference, e.g. Orange Money phone */
  providerReference?: string;
}

export interface DepositResponse {
  transactionId: string;
  status: TransactionStatus;
  /** Redirect URL for provider payment page, if applicable */
  paymentUrl?: string;
  /** For USSD-based flows, the USSD code to dial */
  ussdCode?: string;
}

export interface WithdrawRequest {
  amount: number;
  provider: PaymentProvider;
  providerReference: string;
}

export interface WithdrawResponse {
  transactionId: string;
  status: TransactionStatus;
  estimatedCompletionAt: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  provider?: PaymentProvider;
  description: string;
  createdAt: string;
  completedAt?: string;
  /** Related asset or portfolio name */
  reference?: string;
}

export interface WalletBalance {
  available: number;
  pending: number;
  total: number;
  currency: 'XOF';
}

/** API calls */

export async function getWalletBalance(): Promise<ApiResponse<WalletBalance>> {
  const response = await apiClient.get<ApiResponse<WalletBalance>>('/payments/balance');
  return response.data;
}

export async function deposit(data: DepositRequest): Promise<ApiResponse<DepositResponse>> {
  const response = await apiClient.post<ApiResponse<DepositResponse>>('/payments/deposit', data);
  return response.data;
}

export async function withdraw(data: WithdrawRequest): Promise<ApiResponse<WithdrawResponse>> {
  const response = await apiClient.post<ApiResponse<WithdrawResponse>>('/payments/withdraw', data);
  return response.data;
}

export async function getTransactionHistory(
  params?: { page?: number; pageSize?: number; type?: TransactionType },
): Promise<PaginatedResponse<Transaction>> {
  const response = await apiClient.get<PaginatedResponse<Transaction>>('/payments/transactions', {
    params,
  });
  return response.data;
}

export async function getTransaction(id: string): Promise<ApiResponse<Transaction>> {
  const response = await apiClient.get<ApiResponse<Transaction>>(`/payments/transactions/${id}`);
  return response.data;
}
