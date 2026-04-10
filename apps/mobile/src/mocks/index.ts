import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import { usePortfolioStore } from '../store/portfolio.store';
import { MOCK_USER } from './user';
import { MOCK_PORTFOLIO_SUMMARY, MOCK_ALLOCATION } from './portfolio';
import { MOCK_GOALS } from './goals';

export { MOCK_ASSETS, MOCK_ASSET_DETAILS } from './assets';
export { MOCK_PORTFOLIO_DETAIL, MOCK_HOLDINGS, MOCK_PORTFOLIO_SUMMARY, MOCK_ALLOCATION } from './portfolio';
export { MOCK_TRANSACTIONS } from './transactions';
export { MOCK_GOALS } from './goals';
export { MOCK_USER } from './user';

/**
 * Injects mock data into Zustand stores on mount.
 * Call in root layout to populate all screens for demo.
 */
export function useMockData() {
  const { setUser, setAuthenticated, setReady } = useAuthStore();
  const { setWalletBalance, setPortfolios, setAllocation, setGoals } = usePortfolioStore();

  useEffect(() => {
    if (!__DEV__) return;

    setUser(MOCK_USER);
    setAuthenticated(true);
    setReady(true);

    setWalletBalance({
      available: 75_000,
      pending: 0,
      total: 75_000,
      currency: 'XOF',
    });

    setPortfolios([MOCK_PORTFOLIO_SUMMARY]);
    setAllocation(MOCK_ALLOCATION);
    setGoals(MOCK_GOALS);
  }, []);
}
