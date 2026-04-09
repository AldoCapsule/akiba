import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePortfolioStore } from '../store/portfolio.store';
import * as portfoliosApi from '../api/portfolios';
import * as paymentsApi from '../api/payments';
import * as savingsApi from '../api/savings';
import { useEffect } from 'react';

/**
 * Portfolio data hook that syncs React Query with Zustand store.
 * Provides dashboard-level aggregated data.
 */
export function usePortfolio() {
  const queryClient = useQueryClient();
  const store = usePortfolioStore();

  /** Fetch wallet balance */
  const balanceQuery = useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: async () => {
      const { data } = await paymentsApi.getWalletBalance();
      return data;
    },
    staleTime: 30_000, // 30 seconds
  });

  /** Fetch portfolios */
  const portfoliosQuery = useQuery({
    queryKey: ['portfolios'],
    queryFn: async () => {
      const { data } = await portfoliosApi.getPortfolios();
      return data;
    },
    staleTime: 60_000,
  });

  /** Fetch allocation */
  const allocationQuery = useQuery({
    queryKey: ['portfolios', 'allocation'],
    queryFn: async () => {
      const { data } = await portfoliosApi.getAllocation();
      return data;
    },
    staleTime: 60_000,
  });

  /** Fetch savings goals */
  const goalsQuery = useQuery({
    queryKey: ['savings', 'goals'],
    queryFn: async () => {
      const { data } = await savingsApi.getGoals();
      return data;
    },
    staleTime: 60_000,
  });

  /** Sync query results into Zustand store */
  useEffect(() => {
    if (balanceQuery.data) store.setWalletBalance(balanceQuery.data);
  }, [balanceQuery.data]);

  useEffect(() => {
    if (portfoliosQuery.data) store.setPortfolios(portfoliosQuery.data);
  }, [portfoliosQuery.data]);

  useEffect(() => {
    if (allocationQuery.data) store.setAllocation(allocationQuery.data);
  }, [allocationQuery.data]);

  useEffect(() => {
    if (goalsQuery.data) store.setGoals(goalsQuery.data);
  }, [goalsQuery.data]);

  /** Invest in an asset */
  const investMutation = useMutation({
    mutationFn: portfoliosApi.invest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });

  /** Refresh all portfolio data */
  function refreshAll() {
    queryClient.invalidateQueries({ queryKey: ['wallet'] });
    queryClient.invalidateQueries({ queryKey: ['portfolios'] });
    queryClient.invalidateQueries({ queryKey: ['savings'] });
  }

  return {
    /** Wallet */
    walletBalance: store.walletBalance,
    isLoadingBalance: balanceQuery.isLoading,

    /** Portfolios */
    portfolios: store.portfolios,
    isLoadingPortfolios: portfoliosQuery.isLoading,
    totalValue: store.totalValue,
    totalInvested: store.totalInvested,
    totalGainLoss: store.totalGainLoss,
    totalGainLossPercent: store.totalGainLossPercent,

    /** Allocation */
    allocation: store.allocation,
    isLoadingAllocation: allocationQuery.isLoading,

    /** Goals */
    goals: store.goals,
    isLoadingGoals: goalsQuery.isLoading,

    /** Invest */
    invest: investMutation.mutateAsync,
    isInvesting: investMutation.isPending,

    /** Aggregate loading */
    isLoading:
      balanceQuery.isLoading || portfoliosQuery.isLoading,

    /** Refresh */
    refreshAll,
  };
}

/**
 * Hook for a single portfolio's detail view.
 */
export function usePortfolioDetail(
  id: string,
  period: '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL' = '1M',
) {
  return useQuery({
    queryKey: ['portfolios', id, period],
    queryFn: async () => {
      const { data } = await portfoliosApi.getPortfolio(id, period);
      return data;
    },
    staleTime: 60_000,
    enabled: !!id,
  });
}
