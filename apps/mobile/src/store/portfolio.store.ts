import { create } from 'zustand';
import type { PortfolioSummary, AllocationBreakdown } from '../api/portfolios';
import type { WalletBalance } from '../api/payments';
import type { SavingsGoal } from '../api/savings';

export interface PortfolioState {
  /** Aggregated wallet balance */
  walletBalance: WalletBalance | null;
  /** All user portfolios */
  portfolios: PortfolioSummary[];
  /** Portfolio allocation breakdown */
  allocation: AllocationBreakdown | null;
  /** Savings goals */
  goals: SavingsGoal[];
  /** Aggregate total across portfolios */
  totalInvested: number;
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;

  /** Actions */
  setWalletBalance: (balance: WalletBalance) => void;
  setPortfolios: (portfolios: PortfolioSummary[]) => void;
  setAllocation: (allocation: AllocationBreakdown) => void;
  setGoals: (goals: SavingsGoal[]) => void;
  recalculateTotals: () => void;
  reset: () => void;
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  walletBalance: null,
  portfolios: [],
  allocation: null,
  goals: [],
  totalInvested: 0,
  totalValue: 0,
  totalGainLoss: 0,
  totalGainLossPercent: 0,

  setWalletBalance: (balance) => set({ walletBalance: balance }),

  setPortfolios: (portfolios) => {
    set({ portfolios });
    get().recalculateTotals();
  },

  setAllocation: (allocation) => set({ allocation }),

  setGoals: (goals) => set({ goals }),

  recalculateTotals: () => {
    const { portfolios } = get();
    const totalInvested = portfolios.reduce((sum, p) => sum + p.totalInvested, 0);
    const totalValue = portfolios.reduce((sum, p) => sum + p.totalValue, 0);
    const totalGainLoss = totalValue - totalInvested;
    const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

    set({ totalInvested, totalValue, totalGainLoss, totalGainLossPercent });
  },

  reset: () =>
    set({
      walletBalance: null,
      portfolios: [],
      allocation: null,
      goals: [],
      totalInvested: 0,
      totalValue: 0,
      totalGainLoss: 0,
      totalGainLossPercent: 0,
    }),
}));
