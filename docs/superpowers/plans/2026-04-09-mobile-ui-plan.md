# Mobile UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add mock data layer, missing screens (set-pin, login), and new reusable components so the Akiba mobile app is fully demo-ready with populated data on every screen.

**Architecture:** The 17 existing screens already have full implementations wired to Zustand stores and React Query hooks. We need to: (1) create mock data that feeds the stores, (2) add 2 missing auth screens, (3) build new UI components referenced by existing screens but not yet created, (4) wire mock data injection into the root layout.

**Tech Stack:** React Native 0.76, Expo 52, Expo Router 4, Zustand 5, TypeScript

---

## File Structure

### New Files
- `apps/mobile/src/mocks/user.ts` — Demo user profile data
- `apps/mobile/src/mocks/assets.ts` — 12 sample BRVM/bond/sukuk/fund assets
- `apps/mobile/src/mocks/portfolio.ts` — Portfolio with holdings and performance history
- `apps/mobile/src/mocks/transactions.ts` — 15 sample transactions
- `apps/mobile/src/mocks/goals.ts` — 3 savings goals
- `apps/mobile/src/mocks/index.ts` — useMockData() hook
- `apps/mobile/app/(auth)/set-pin.tsx` — PIN creation screen
- `apps/mobile/app/(auth)/login.tsx` — Login screen
- `apps/mobile/src/components/ui/PinInput.tsx` — 6-digit PIN input component
- `apps/mobile/src/components/ui/SectionHeader.tsx` — Section title + "See all" link
- `apps/mobile/src/components/ui/TransactionItem.tsx` — Transaction row
- `apps/mobile/src/components/ui/AllocationBar.tsx` — Horizontal stacked allocation bar

### Modified Files
- `apps/mobile/app/_layout.tsx` — Add mock data injection
- `apps/mobile/app/(auth)/_layout.tsx` — Add set-pin and login routes

### Deferred (not blocking demo)
The design spec lists BalanceCard, HoldingRow, GoalCard, AssetCard, OnboardingSlide, and EmptyState as new components. However, the existing screens already implement this UI inline with StyleSheet. Extracting them into reusable components is a refactor for consistency, not a functional gap. The app will look and work the same either way. These can be extracted in a follow-up iteration.

---

### Task 1: Mock Data — Assets

**Files:**
- Create: `apps/mobile/src/mocks/assets.ts`

- [ ] **Step 1: Create the assets mock file**

```typescript
// apps/mobile/src/mocks/assets.ts
import type { Asset, AssetDetail, PricePoint } from '../api/markets';

function generatePriceHistory(basePrice: number, days: number, volatility: number): PricePoint[] {
  const points: PricePoint[] = [];
  let price = basePrice * (1 - volatility * 0.5);
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    price = price + (Math.random() - 0.45) * basePrice * volatility * 0.1;
    price = Math.max(price, basePrice * 0.7);
    points.push({ date: date.toISOString(), price: Math.round(price) });
  }

  // Ensure last point matches current price
  points[points.length - 1].price = basePrice;
  return points;
}

export const MOCK_ASSETS: Asset[] = [
  // Equities
  { id: 'ast-snts', name: 'Sonatel', ticker: 'SNTS', type: 'equity', price: 18_950, changePercent: 1.2, changeAbsolute: 225, currency: 'XOF', isHalal: true, market: 'BRVM' },
  { id: 'ast-boas', name: 'BOA Sénégal', ticker: 'BOAS', type: 'equity', price: 6_200, changePercent: -0.8, changeAbsolute: -50, currency: 'XOF', isHalal: false, market: 'BRVM' },
  { id: 'ast-ttlc', name: 'TotalEnergies CI', ticker: 'TTLC', type: 'equity', price: 2_450, changePercent: 0.4, changeAbsolute: 10, currency: 'XOF', isHalal: false, market: 'BRVM' },
  { id: 'ast-ntlc', name: 'Nestlé CI', ticker: 'NTLC', type: 'equity', price: 8_700, changePercent: -0.3, changeAbsolute: -25, currency: 'XOF', isHalal: true, market: 'BRVM' },

  // Government Bonds
  { id: 'ast-boad25', name: 'BOAD 2025 6.5%', ticker: 'BOAD25', type: 'bond', price: 10_150, changePercent: 0.05, changeAbsolute: 5, currency: 'XOF', isHalal: false, issuer: 'BOAD' },
  { id: 'ast-tsn26', name: 'Trésor SN 2026 5.8%', ticker: 'TSN26', type: 'bond', price: 10_050, changePercent: 0.02, changeAbsolute: 2, currency: 'XOF', isHalal: false, issuer: 'Trésor du Sénégal' },
  { id: 'ast-tsn27', name: 'Trésor SN 2027 6.0%', ticker: 'TSN27', type: 'bond', price: 9_980, changePercent: -0.1, changeAbsolute: -10, currency: 'XOF', isHalal: false, issuer: 'Trésor du Sénégal' },

  // Sukuk
  { id: 'ast-sksn26', name: 'Sukuk Sénégal 2026', ticker: 'SKSN26', type: 'sukuk', price: 10_100, changePercent: 0.03, changeAbsolute: 3, currency: 'XOF', isHalal: true, issuer: 'État du Sénégal' },
  { id: 'ast-skbd25', name: 'Sukuk BOAD 2025', ticker: 'SKBD25', type: 'sukuk', price: 10_200, changePercent: 0.08, changeAbsolute: 8, currency: 'XOF', isHalal: true, issuer: 'BOAD' },

  // Mutual Funds
  { id: 'ast-fcpbr', name: 'FCP BRAO Équilibre', ticker: 'FCPBR', type: 'fund', price: 12_500, changePercent: 0.6, changeAbsolute: 75, currency: 'XOF', isHalal: false, manager: 'BRAO Asset Management' },
  { id: 'ast-fcphc', name: 'FCP Horizon Croissance', ticker: 'FCPHC', type: 'fund', price: 15_200, changePercent: 1.1, changeAbsolute: 165, currency: 'XOF', isHalal: true, manager: 'CGF Bourse' },

  // Savings Vault
  { id: 'ast-vault', name: 'Akiba Vault 3.5%', ticker: 'VAULT', type: 'fund', price: 10_000, changePercent: 0.01, changeAbsolute: 1, currency: 'XOF', isHalal: true, manager: 'Akiba' },
];

export const MOCK_ASSET_DETAILS: Record<string, AssetDetail> = {
  'ast-snts': {
    ...MOCK_ASSETS[0],
    description: 'Sonatel est le principal opérateur de télécommunications au Sénégal, filiale du groupe Orange. Leader sur le marché mobile et internet fixe en Afrique de l\'Ouest.',
    marketCap: 2_150_000_000_000,
    volume24h: 45_000_000,
    high52w: 21_000,
    low52w: 15_500,
    dividendYield: 5.2,
    peRatio: 12.4,
    priceHistory: generatePriceHistory(18_950, 30, 0.08),
  },
  'ast-boas': {
    ...MOCK_ASSETS[1],
    description: 'Bank of Africa Sénégal, filiale du groupe BOA. Banque commerciale offrant des services aux particuliers et entreprises.',
    marketCap: 186_000_000_000,
    volume24h: 12_000_000,
    high52w: 7_100,
    low52w: 5_400,
    dividendYield: 3.8,
    peRatio: 8.6,
    priceHistory: generatePriceHistory(6_200, 30, 0.12),
  },
  'ast-ttlc': {
    ...MOCK_ASSETS[2],
    description: 'TotalEnergies Marketing Côte d\'Ivoire. Distribution de produits pétroliers et lubrifiants en Afrique de l\'Ouest.',
    marketCap: 98_000_000_000,
    volume24h: 8_500_000,
    high52w: 2_800,
    low52w: 2_100,
    dividendYield: 4.1,
    peRatio: 10.2,
    priceHistory: generatePriceHistory(2_450, 30, 0.10),
  },
  'ast-ntlc': {
    ...MOCK_ASSETS[3],
    description: 'Nestlé Côte d\'Ivoire. Production et distribution de produits alimentaires : Maggi, Nescafé, Nido.',
    marketCap: 310_000_000_000,
    volume24h: 15_000_000,
    high52w: 9_500,
    low52w: 7_800,
    dividendYield: 2.9,
    peRatio: 15.1,
    priceHistory: generatePriceHistory(8_700, 30, 0.06),
  },
  'ast-boad25': {
    ...MOCK_ASSETS[4],
    description: 'Obligation BOAD à taux fixe 6.5%, maturité 2025. Émise par la Banque Ouest Africaine de Développement.',
    couponRate: 6.5,
    maturityDate: '2025-12-15',
    yieldToMaturity: 6.3,
    priceHistory: generatePriceHistory(10_150, 30, 0.01),
  },
  'ast-tsn26': {
    ...MOCK_ASSETS[5],
    description: 'Obligation du Trésor du Sénégal, taux fixe 5.8%, maturité mars 2026.',
    couponRate: 5.8,
    maturityDate: '2026-03-31',
    yieldToMaturity: 5.7,
    priceHistory: generatePriceHistory(10_050, 30, 0.01),
  },
  'ast-tsn27': {
    ...MOCK_ASSETS[6],
    description: 'Obligation du Trésor du Sénégal, taux fixe 6.0%, maturité juin 2027.',
    couponRate: 6.0,
    maturityDate: '2027-06-30',
    yieldToMaturity: 6.1,
    priceHistory: generatePriceHistory(9_980, 30, 0.01),
  },
  'ast-sksn26': {
    ...MOCK_ASSETS[7],
    description: 'Sukuk souverain du Sénégal, conforme à la Sharia, taux de profit 5.5%. Certifié par le Comité Sharia de la BCEAO.',
    couponRate: 5.5,
    maturityDate: '2026-09-30',
    yieldToMaturity: 5.4,
    priceHistory: generatePriceHistory(10_100, 30, 0.01),
  },
  'ast-skbd25': {
    ...MOCK_ASSETS[8],
    description: 'Sukuk BOAD conforme à la Sharia, taux de profit 6.0%. Financement de projets de développement dans l\'UEMOA.',
    couponRate: 6.0,
    maturityDate: '2025-06-30',
    yieldToMaturity: 5.8,
    priceHistory: generatePriceHistory(10_200, 30, 0.01),
  },
  'ast-fcpbr': {
    ...MOCK_ASSETS[9],
    description: 'Fonds commun de placement diversifié géré par BRAO Asset Management. Allocation équilibrée actions/obligations BRVM.',
    nav: 12_500,
    expenseRatio: 1.5,
    returnYtd: 7.2,
    priceHistory: generatePriceHistory(12_500, 30, 0.04),
  },
  'ast-fcphc': {
    ...MOCK_ASSETS[10],
    description: 'Fonds de croissance géré par CGF Bourse. Orienté actions BRVM à forte capitalisation. Conforme à la Sharia.',
    nav: 15_200,
    expenseRatio: 1.8,
    returnYtd: 11.5,
    priceHistory: generatePriceHistory(15_200, 30, 0.06),
  },
  'ast-vault': {
    ...MOCK_ASSETS[11],
    description: 'Compte d\'épargne Akiba avec rendement garanti de 3.5% annuel. Capital garanti, retraits à tout moment.',
    nav: 10_000,
    expenseRatio: 0,
    returnYtd: 3.5,
    priceHistory: generatePriceHistory(10_000, 30, 0.001),
  },
};
```

- [ ] **Step 2: Commit**

```bash
cd /c/Users/bibac/akiba/.worktrees/mobile-ui
git add apps/mobile/src/mocks/assets.ts
git commit -m "feat(mobile): add mock assets data — 12 BRVM/bond/sukuk/fund samples"
```

---

### Task 2: Mock Data — Portfolio, Transactions, Goals, User

**Files:**
- Create: `apps/mobile/src/mocks/portfolio.ts`
- Create: `apps/mobile/src/mocks/transactions.ts`
- Create: `apps/mobile/src/mocks/goals.ts`
- Create: `apps/mobile/src/mocks/user.ts`

- [ ] **Step 1: Create portfolio mock**

```typescript
// apps/mobile/src/mocks/portfolio.ts
import type { PortfolioSummary, PortfolioDetail, PortfolioHolding, AllocationBreakdown, PerformancePoint } from '../api/portfolios';

function generatePerformanceHistory(days: number, startValue: number, endValue: number): PerformancePoint[] {
  const points: PerformancePoint[] = [];
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const progress = (days - i) / days;
    const value = startValue + (endValue - startValue) * progress + (Math.random() - 0.4) * endValue * 0.02;
    points.push({ date: date.toISOString(), value: Math.round(value) });
  }
  points[points.length - 1].value = endValue;
  return points;
}

export const MOCK_HOLDINGS: PortfolioHolding[] = [
  { assetId: 'ast-snts', assetName: 'Sonatel', assetType: 'equity', quantity: 8, avgBuyPrice: 17_500, currentPrice: 18_950, currentValue: 151_600, gainLoss: 11_600, gainLossPercent: 8.3, weight: 0.31, isHalal: true },
  { assetId: 'ast-boas', assetName: 'BOA Sénégal', assetType: 'equity', quantity: 5, avgBuyPrice: 6_500, currentPrice: 6_200, currentValue: 31_000, gainLoss: -1_500, gainLossPercent: -4.6, weight: 0.06, isHalal: false },
  { assetId: 'ast-boad25', assetName: 'BOAD 2025 6.5%', assetType: 'bond', quantity: 10, avgBuyPrice: 10_000, currentPrice: 10_150, currentValue: 101_500, gainLoss: 1_500, gainLossPercent: 1.5, weight: 0.21, isHalal: false },
  { assetId: 'ast-tsn26', assetName: 'Trésor SN 2026', assetType: 'bond', quantity: 5, avgBuyPrice: 10_000, currentPrice: 10_050, currentValue: 50_250, gainLoss: 250, gainLossPercent: 0.5, weight: 0.10, isHalal: false },
  { assetId: 'ast-sksn26', assetName: 'Sukuk Sénégal 2026', assetType: 'sukuk', quantity: 5, avgBuyPrice: 10_000, currentPrice: 10_100, currentValue: 50_500, gainLoss: 500, gainLossPercent: 1.0, weight: 0.10, isHalal: true },
  { assetId: 'ast-skbd25', assetName: 'Sukuk BOAD 2025', assetType: 'sukuk', quantity: 3, avgBuyPrice: 10_050, currentPrice: 10_200, currentValue: 30_600, gainLoss: 450, gainLossPercent: 1.5, weight: 0.06, isHalal: true },
  { assetId: 'ast-fcphc', assetName: 'FCP Horizon Croissance', assetType: 'fund', quantity: 2, avgBuyPrice: 14_000, currentPrice: 15_200, currentValue: 30_400, gainLoss: 2_400, gainLossPercent: 8.6, weight: 0.06, isHalal: true },
  { assetId: 'ast-vault', assetName: 'Akiba Vault 3.5%', assetType: 'fund', quantity: 4, avgBuyPrice: 10_000, currentPrice: 10_000, currentValue: 40_000, gainLoss: 700, gainLossPercent: 1.8, weight: 0.08, isHalal: true },
];

const totalInvested = MOCK_HOLDINGS.reduce((s, h) => s + h.avgBuyPrice * h.quantity, 0); // ~447,750
const totalValue = MOCK_HOLDINGS.reduce((s, h) => s + h.currentValue, 0); // ~485,850

export const MOCK_PORTFOLIO_SUMMARY: PortfolioSummary = {
  id: 'ptf-main',
  name: 'Mon Portefeuille',
  totalValue,
  totalInvested,
  totalGainLoss: totalValue - totalInvested,
  totalGainLossPercent: ((totalValue - totalInvested) / totalInvested) * 100,
  createdAt: '2026-01-15T10:00:00Z',
};

export const MOCK_PORTFOLIO_DETAIL: PortfolioDetail = {
  ...MOCK_PORTFOLIO_SUMMARY,
  holdings: MOCK_HOLDINGS,
  performanceHistory: generatePerformanceHistory(30, totalInvested, totalValue),
};

export const MOCK_ALLOCATION: AllocationBreakdown = {
  equities: 37,
  bonds: 31,
  sukuk: 16,
  funds: 6,
  cash: 10,
};
```

- [ ] **Step 2: Create transactions mock**

```typescript
// apps/mobile/src/mocks/transactions.ts
import type { Transaction } from '../api/payments';

const now = new Date();
function daysAgo(days: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'tx-01', type: 'deposit', amount: 100_000, fee: 0, status: 'completed', provider: 'wave', description: 'Dépôt via Wave', createdAt: daysAgo(90), completedAt: daysAgo(90) },
  { id: 'tx-02', type: 'investment', amount: 80_000, fee: 400, status: 'completed', description: 'Achat Sonatel (SNTS) x4', createdAt: daysAgo(88), completedAt: daysAgo(88) },
  { id: 'tx-03', type: 'investment', amount: 32_500, fee: 162, status: 'completed', description: 'Achat BOA Sénégal (BOAS) x5', createdAt: daysAgo(85), completedAt: daysAgo(85) },
  { id: 'tx-04', type: 'deposit', amount: 200_000, fee: 0, status: 'completed', provider: 'orange_money', description: 'Dépôt via Orange Money', createdAt: daysAgo(75), completedAt: daysAgo(75) },
  { id: 'tx-05', type: 'investment', amount: 100_000, fee: 500, status: 'completed', description: 'Achat BOAD 2025 (BOAD25) x10', createdAt: daysAgo(72), completedAt: daysAgo(72) },
  { id: 'tx-06', type: 'investment', amount: 50_000, fee: 250, status: 'completed', description: 'Achat Trésor SN 2026 (TSN26) x5', createdAt: daysAgo(70), completedAt: daysAgo(70) },
  { id: 'tx-07', type: 'dividend', amount: 4_800, fee: 0, status: 'completed', description: 'Dividende Sonatel Q1 2026', createdAt: daysAgo(60), completedAt: daysAgo(60) },
  { id: 'tx-08', type: 'deposit', amount: 150_000, fee: 0, status: 'completed', provider: 'wave', description: 'Dépôt via Wave', createdAt: daysAgo(50), completedAt: daysAgo(50) },
  { id: 'tx-09', type: 'investment', amount: 50_000, fee: 250, status: 'completed', description: 'Achat Sukuk Sénégal (SKSN26) x5', createdAt: daysAgo(48), completedAt: daysAgo(48) },
  { id: 'tx-10', type: 'investment', amount: 30_150, fee: 150, status: 'completed', description: 'Achat Sukuk BOAD (SKBD25) x3', createdAt: daysAgo(45), completedAt: daysAgo(45) },
  { id: 'tx-11', type: 'dividend', amount: 1_200, fee: 0, status: 'completed', description: 'Coupon BOAD 2025', createdAt: daysAgo(30), completedAt: daysAgo(30) },
  { id: 'tx-12', type: 'investment', amount: 28_000, fee: 140, status: 'completed', description: 'Achat FCP Horizon Croissance x2', createdAt: daysAgo(25), completedAt: daysAgo(25) },
  { id: 'tx-13', type: 'deposit', amount: 75_000, fee: 0, status: 'completed', provider: 'orange_money', description: 'Dépôt via Orange Money', createdAt: daysAgo(15), completedAt: daysAgo(15) },
  { id: 'tx-14', type: 'investment', amount: 40_000, fee: 200, status: 'completed', description: 'Achat Sonatel (SNTS) x2 + Akiba Vault x4', createdAt: daysAgo(10), completedAt: daysAgo(10) },
  { id: 'tx-15', type: 'withdrawal', amount: 25_000, fee: 500, status: 'completed', provider: 'wave', description: 'Retrait vers Wave', createdAt: daysAgo(5), completedAt: daysAgo(5) },
];
```

- [ ] **Step 3: Create goals mock**

```typescript
// apps/mobile/src/mocks/goals.ts
import type { SavingsGoal } from '../api/savings';

export const MOCK_GOALS: SavingsGoal[] = [
  {
    id: 'goal-emergency',
    name: 'Fonds d\'urgence',
    type: 'emergency',
    targetAmount: 200_000,
    currentAmount: 120_000,
    progress: 0.6,
    monthlyContribution: 20_000,
    deadline: '2026-12-31',
    status: 'active',
    autoInvest: false,
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'goal-hajj',
    name: 'Hajj 2027',
    type: 'hajj',
    targetAmount: 1_000_000,
    currentAmount: 250_000,
    progress: 0.25,
    monthlyContribution: 50_000,
    deadline: '2027-05-01',
    status: 'active',
    autoInvest: true,
    portfolioId: 'ptf-main',
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'goal-edu',
    name: 'Études enfant',
    type: 'education',
    targetAmount: 150_000,
    currentAmount: 15_000,
    progress: 0.1,
    monthlyContribution: 10_000,
    deadline: '2027-09-01',
    status: 'active',
    autoInvest: false,
    createdAt: '2026-03-10T10:00:00Z',
  },
];
```

- [ ] **Step 4: Create user mock**

```typescript
// apps/mobile/src/mocks/user.ts
import type { UserData } from '../api/auth';

export const MOCK_USER: UserData = {
  id: 'usr-demo-001',
  phoneNumber: '+221770001234',
  fullName: 'Aminata Diallo',
  email: 'aminata.diallo@example.com',
  kycStatus: 'verified',
  kycTier: 'tier_1',
  riskProfile: 'balanced',
  isHalalOnly: false,
  preferredLanguage: 'fr',
  referralCode: 'AMINATA2026',
  createdAt: '2026-01-10T08:00:00Z',
  updatedAt: '2026-04-01T12:00:00Z',
};
```

- [ ] **Step 5: Commit**

```bash
cd /c/Users/bibac/akiba/.worktrees/mobile-ui
git add apps/mobile/src/mocks/
git commit -m "feat(mobile): add mock data — portfolio, transactions, goals, user"
```

---

### Task 3: Mock Data — useMockData Hook

**Files:**
- Create: `apps/mobile/src/mocks/index.ts`
- Modify: `apps/mobile/app/_layout.tsx` — inject mock data on app load

- [ ] **Step 1: Create the useMockData hook**

```typescript
// apps/mobile/src/mocks/index.ts
import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import { usePortfolioStore } from '../store/portfolio.store';
import { MOCK_USER } from './user';
import { MOCK_PORTFOLIO_SUMMARY, MOCK_ALLOCATION } from './portfolio';
import { MOCK_GOALS } from './goals';
import { MOCK_TRANSACTIONS } from './transactions';

export { MOCK_ASSETS, MOCK_ASSET_DETAILS } from './assets';
export { MOCK_PORTFOLIO_DETAIL, MOCK_HOLDINGS } from './portfolio';
export { MOCK_TRANSACTIONS } from './transactions';
export { MOCK_GOALS } from './goals';
export { MOCK_USER } from './user';

/**
 * Injects mock data into Zustand stores on mount.
 * Call this in the root layout to populate all screens for demo.
 * Guarded by __DEV__ — no-op in production builds.
 */
export function useMockData() {
  const { setUser, setAuthenticated, setReady } = useAuthStore();
  const { setWalletBalance, setPortfolios, setAllocation, setGoals } = usePortfolioStore();

  useEffect(() => {
    if (!__DEV__) return;

    // Populate auth store
    setUser(MOCK_USER);
    setAuthenticated(true);
    setReady(true);

    // Populate portfolio store
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
```

- [ ] **Step 2: Add useMockData() call to root layout**

Read `apps/mobile/app/_layout.tsx` and add the hook call inside the root component, after the existing provider setup. Add `import { useMockData } from '../src/mocks';` at the top, and call `useMockData();` inside the component body before the return statement.

- [ ] **Step 3: Commit**

```bash
cd /c/Users/bibac/akiba/.worktrees/mobile-ui
git add apps/mobile/src/mocks/index.ts apps/mobile/app/_layout.tsx
git commit -m "feat(mobile): wire useMockData hook into root layout"
```

---

### Task 4: PinInput Component

**Files:**
- Create: `apps/mobile/src/components/ui/PinInput.tsx`

- [ ] **Step 1: Create PinInput component**

```typescript
// apps/mobile/src/components/ui/PinInput.tsx
import React, { useRef, useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Animated, Easing } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography, FontSize, FontWeight } from '../../constants/fonts';
import { Spacing, BorderRadius, MIN_TOUCH_TARGET } from '../../constants/spacing';

interface PinInputProps {
  length?: number;
  secure?: boolean;
  onComplete: (code: string) => void;
  onChangeCode?: (code: string) => void;
  error?: boolean;
  autoFocus?: boolean;
}

export function PinInput({
  length = 6,
  secure = false,
  onComplete,
  onChangeCode,
  error = false,
  autoFocus = true,
}: PinInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, easing: Easing.linear, useNativeDriver: true }),
      ]).start(() => {
        setDigits(Array(length).fill(''));
        inputRefs.current[0]?.focus();
      });
    }
  }, [error]);

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, []);

  const handleChange = (text: string, index: number) => {
    // Handle paste (multi-digit input)
    if (text.length > 1) {
      const pasted = text.replace(/\D/g, '').slice(0, length);
      const newDigits = Array(length).fill('');
      pasted.split('').forEach((d, i) => { newDigits[i] = d; });
      setDigits(newDigits);
      onChangeCode?.(newDigits.join(''));
      if (pasted.length === length) {
        onComplete(pasted);
      } else {
        inputRefs.current[pasted.length]?.focus();
      }
      return;
    }

    const digit = text.replace(/\D/g, '');
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    const code = newDigits.join('');
    onChangeCode?.(code);

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (code.length === length && !code.includes('')) {
      onComplete(code);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      const newDigits = [...digits];
      newDigits[index - 1] = '';
      setDigits(newDigits);
      onChangeCode?.(newDigits.join(''));
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ translateX: shakeAnim }] }]}>
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => { inputRefs.current[index] = ref; }}
          style={[
            styles.box,
            digit ? styles.boxFilled : null,
            error ? styles.boxError : null,
          ]}
          value={secure && digit ? '●' : digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={index === 0 ? length : 1}
          selectTextOnFocus
          accessibilityLabel={`Digit ${index + 1} of ${length}`}
        />
      ))}
    </Animated.View>
  );
}

const BOX_SIZE = MIN_TOUCH_TARGET;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing['2'],
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE + 8,
    borderWidth: 2,
    borderColor: Colors.gray200,
    borderRadius: BorderRadius.lg,
    textAlign: 'center',
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
  },
  boxFilled: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}08`,
  },
  boxError: {
    borderColor: Colors.error,
    backgroundColor: `${Colors.error}08`,
  },
});
```

- [ ] **Step 2: Commit**

```bash
cd /c/Users/bibac/akiba/.worktrees/mobile-ui
git add apps/mobile/src/components/ui/PinInput.tsx
git commit -m "feat(mobile): add PinInput component — 6-digit input with shake animation"
```

---

### Task 5: SectionHeader, TransactionItem, AllocationBar Components

**Files:**
- Create: `apps/mobile/src/components/ui/SectionHeader.tsx`
- Create: `apps/mobile/src/components/ui/TransactionItem.tsx`
- Create: `apps/mobile/src/components/ui/AllocationBar.tsx`

- [ ] **Step 1: Create SectionHeader**

```typescript
// apps/mobile/src/components/ui/SectionHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight } from '../../constants/fonts';
import { Spacing } from '../../constants/spacing';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing['3'],
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  action: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.primary,
  },
});
```

- [ ] **Step 2: Create TransactionItem**

```typescript
// apps/mobile/src/components/ui/TransactionItem.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight } from '../../constants/fonts';
import { Spacing, BorderRadius, MIN_TOUCH_TARGET } from '../../constants/spacing';
import { formatCFA } from '../../utils/format';
import type { TransactionType } from '../../api/payments';

interface TransactionItemProps {
  type: TransactionType;
  description: string;
  amount: number;
  date: string;
}

const TYPE_CONFIG: Record<TransactionType, { icon: keyof typeof Ionicons.glyphMap; color: string; sign: '+' | '-' }> = {
  deposit: { icon: 'arrow-down-circle', color: Colors.success, sign: '+' },
  withdrawal: { icon: 'arrow-up-circle', color: Colors.error, sign: '-' },
  investment: { icon: 'trending-up', color: Colors.primary, sign: '-' },
  redemption: { icon: 'arrow-undo-circle', color: Colors.info, sign: '+' },
  dividend: { icon: 'gift', color: Colors.gold, sign: '+' },
};

export function TransactionItem({ type, description, amount, date }: TransactionItemProps) {
  const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.deposit;
  const formattedDate = new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: `${config.color}15` }]}>
        <Ionicons name={config.icon} size={20} color={config.color} />
      </View>
      <View style={styles.info}>
        <Text style={styles.description} numberOfLines={1}>{description}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
      <Text style={[styles.amount, { color: config.sign === '+' ? Colors.success : Colors.textPrimary }]}>
        {config.sign}{formatCFA(amount)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing['3'],
    minHeight: MIN_TOUCH_TARGET,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing['3'],
  },
  info: {
    flex: 1,
    marginRight: Spacing['2'],
  },
  description: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  date: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  amount: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
});
```

- [ ] **Step 3: Create AllocationBar**

```typescript
// apps/mobile/src/components/ui/AllocationBar.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight } from '../../constants/fonts';
import { Spacing, BorderRadius } from '../../constants/spacing';

interface Segment {
  label: string;
  value: number;
  color: string;
}

interface AllocationBarProps {
  segments: Segment[];
  height?: number;
}

const DEFAULT_SEGMENTS: Segment[] = [
  { label: 'Actions', value: 0, color: Colors.chartEquities },
  { label: 'Obligations', value: 0, color: Colors.chartBonds },
  { label: 'Sukuk', value: 0, color: Colors.chartSukuk },
  { label: 'Fonds', value: 0, color: Colors.chartFunds },
  { label: 'Espèces', value: 0, color: Colors.chartCash },
];

export function AllocationBar({ segments = DEFAULT_SEGMENTS, height = 12 }: AllocationBarProps) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return null;

  const active = segments.filter((s) => s.value > 0);

  return (
    <View>
      <View style={[styles.bar, { height, borderRadius: height / 2 }]}>
        {active.map((segment, i) => (
          <View
            key={segment.label}
            style={{
              flex: segment.value,
              backgroundColor: segment.color,
              borderTopLeftRadius: i === 0 ? height / 2 : 0,
              borderBottomLeftRadius: i === 0 ? height / 2 : 0,
              borderTopRightRadius: i === active.length - 1 ? height / 2 : 0,
              borderBottomRightRadius: i === active.length - 1 ? height / 2 : 0,
            }}
          />
        ))}
      </View>
      <View style={styles.legend}>
        {active.map((segment) => (
          <View key={segment.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
            <Text style={styles.legendLabel}>{segment.label}</Text>
            <Text style={styles.legendValue}>{Math.round((segment.value / total) * 100)}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: Colors.gray100,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing['3'],
    gap: Spacing['3'],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['1'],
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  legendValue: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
});
```

- [ ] **Step 4: Commit**

```bash
cd /c/Users/bibac/akiba/.worktrees/mobile-ui
git add apps/mobile/src/components/ui/SectionHeader.tsx apps/mobile/src/components/ui/TransactionItem.tsx apps/mobile/src/components/ui/AllocationBar.tsx
git commit -m "feat(mobile): add SectionHeader, TransactionItem, AllocationBar components"
```

---

### Task 6: Set PIN Screen

**Files:**
- Create: `apps/mobile/app/(auth)/set-pin.tsx`
- Modify: `apps/mobile/app/(auth)/_layout.tsx` — add set-pin route

- [ ] **Step 1: Create set-pin screen**

```typescript
// apps/mobile/app/(auth)/set-pin.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PinInput } from '../../src/components/ui/PinInput';
import { Button } from '../../src/components/ui/Button';
import { useAuth } from '../../src/hooks/useAuth';
import { useAuthStore } from '../../src/store/auth.store';
import { Colors } from '../../src/constants/colors';
import { Typography, FontSize, FontWeight } from '../../src/constants/fonts';
import { Spacing } from '../../src/constants/spacing';

type Step = 'create' | 'confirm' | 'success';

export default function SetPinScreen() {
  const router = useRouter();
  const { t } = useAuthStore();
  const { setPin } = useAuth();
  const [step, setStep] = useState<Step>('create');
  const [pin, setPin_] = useState('');
  const [error, setError] = useState(false);

  const handleCreate = (code: string) => {
    setPin_(code);
    setStep('confirm');
  };

  const handleConfirm = async (code: string) => {
    if (code !== pin) {
      setError(true);
      setTimeout(() => setError(false), 500);
      return;
    }

    try {
      await setPin.mutateAsync({ pin: code, pinConfirmation: code });
      setStep('success');
    } catch {
      setError(true);
      setTimeout(() => setError(false), 500);
    }
  };

  const handleContinue = () => {
    router.replace('/(tabs)');
  };

  if (step === 'success') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContent}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color={Colors.success} />
          </View>
          <Text style={styles.successTitle}>PIN créé avec succès</Text>
          <Text style={styles.successSubtitle}>
            Votre compte est sécurisé. Vous pouvez maintenant accéder à Akiba.
          </Text>
        </View>
        <View style={styles.bottomAction}>
          <Button title="Continuer" onPress={handleContinue} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons
              name={step === 'create' ? 'lock-closed' : 'shield-checkmark'}
              size={32}
              color={Colors.primary}
            />
          </View>
          <Text style={styles.title}>
            {step === 'create' ? 'Créez votre PIN' : 'Confirmez votre PIN'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'create'
              ? 'Choisissez un code à 6 chiffres pour sécuriser votre compte.'
              : 'Saisissez à nouveau votre code PIN.'}
          </Text>
        </View>

        <PinInput
          key={step}
          length={6}
          secure
          onComplete={step === 'create' ? handleCreate : handleConfirm}
          error={error}
          autoFocus
        />

        {error && (
          <Text style={styles.errorText}>
            Les codes ne correspondent pas. Réessayez.
          </Text>
        )}
      </View>

      {step === 'confirm' && (
        <View style={styles.bottomAction}>
          <Button
            title="Retour"
            variant="ghost"
            onPress={() => { setStep('create'); setError(false); }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing['6'],
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['10'],
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing['4'],
  },
  title: {
    ...Typography.h2,
    color: Colors.navy,
    textAlign: 'center',
    marginBottom: Spacing['2'],
  },
  subtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorText: {
    fontSize: FontSize.sm,
    color: Colors.error,
    textAlign: 'center',
    marginTop: Spacing['4'],
  },
  bottomAction: {
    paddingHorizontal: Spacing['6'],
    paddingBottom: Spacing['4'],
  },
  successContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing['6'],
  },
  successIcon: {
    marginBottom: Spacing['6'],
  },
  successTitle: {
    ...Typography.h2,
    color: Colors.navy,
    textAlign: 'center',
    marginBottom: Spacing['2'],
  },
  successSubtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
```

- [ ] **Step 2: Add set-pin and login routes to auth layout**

Read `apps/mobile/app/(auth)/_layout.tsx`. Add two new `<Stack.Screen>` entries for `set-pin` and `login` alongside the existing screens.

- [ ] **Step 3: Commit**

```bash
cd /c/Users/bibac/akiba/.worktrees/mobile-ui
git add "apps/mobile/app/(auth)/set-pin.tsx" "apps/mobile/app/(auth)/_layout.tsx"
git commit -m "feat(mobile): add set-pin screen with PinInput and confirmation flow"
```

---

### Task 7: Login Screen

**Files:**
- Create: `apps/mobile/app/(auth)/login.tsx`

- [ ] **Step 1: Create login screen**

```typescript
// apps/mobile/app/(auth)/login.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../../src/components/ui/Input';
import { PinInput } from '../../src/components/ui/PinInput';
import { Button } from '../../src/components/ui/Button';
import { useAuth } from '../../src/hooks/useAuth';
import { useAuthStore } from '../../src/store/auth.store';
import { Colors } from '../../src/constants/colors';
import { Typography, FontSize, FontWeight } from '../../src/constants/fonts';
import { Spacing, BorderRadius } from '../../src/constants/spacing';
import { normalizePhone } from '../../src/utils/validation';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useAuthStore();
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState(false);

  const formattedPhone = phone.startsWith('+221') ? phone : `+221${phone}`;
  const isPhoneValid = phone.replace(/\D/g, '').length >= 9;

  const handlePhoneNext = () => {
    if (isPhoneValid) setShowPin(true);
  };

  const handleLogin = async (pin: string) => {
    try {
      await login.mutateAsync({ phone: normalizePhone(formattedPhone), pin });
      router.replace('/(tabs)');
    } catch {
      setPinError(true);
      setTimeout(() => setPinError(false), 500);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoArea}>
          <Text style={styles.logo}>Akiba</Text>
        </View>

        <Text style={styles.title}>Bon retour !</Text>
        <Text style={styles.subtitle}>
          Connectez-vous avec votre numéro de téléphone et PIN.
        </Text>

        {/* Phone */}
        <View style={styles.phoneRow}>
          <View style={styles.prefix}>
            <Text style={styles.flag}>🇸🇳</Text>
            <Text style={styles.prefixText}>+221</Text>
          </View>
          <Input
            placeholder="77 000 00 00"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={(text) => { setPhone(text); setShowPin(false); }}
            style={styles.phoneInput}
          />
        </View>

        {/* PIN (shows after phone validated) */}
        {showPin && (
          <View style={styles.pinSection}>
            <Text style={styles.pinLabel}>Votre PIN à 6 chiffres</Text>
            <PinInput
              length={6}
              secure
              onComplete={handleLogin}
              error={pinError}
              autoFocus
            />
            {pinError && (
              <Text style={styles.errorText}>PIN incorrect. Réessayez.</Text>
            )}
          </View>
        )}

        {!showPin && (
          <Button
            title="Continuer"
            onPress={handlePhoneNext}
            disabled={!isPhoneValid}
            loading={login.isPending}
          />
        )}

        {/* Forgot PIN */}
        <TouchableOpacity
          style={styles.forgotLink}
          onPress={() => Alert.alert('PIN oublié', 'Contactez le support Akiba pour réinitialiser votre PIN.\n\nSupport: +221 33 800 00 00')}
        >
          <Text style={styles.forgotText}>PIN oublié ?</Text>
        </TouchableOpacity>
      </View>

      {/* Register link */}
      <View style={styles.bottomLink}>
        <Text style={styles.bottomText}>Pas encore de compte ? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.bottomAction}>S'inscrire</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing['6'],
    paddingTop: Spacing['10'],
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: Spacing['8'],
  },
  logo: {
    fontSize: 32,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    letterSpacing: 1,
  },
  title: {
    ...Typography.h2,
    color: Colors.navy,
    marginBottom: Spacing['2'],
  },
  subtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    marginBottom: Spacing['6'],
    lineHeight: 24,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['2'],
    marginBottom: Spacing['4'],
  },
  prefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['1'],
    paddingHorizontal: Spacing['3'],
    height: 56,
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.lg,
  },
  flag: {
    fontSize: 20,
  },
  prefixText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  phoneInput: {
    flex: 1,
  },
  pinSection: {
    marginTop: Spacing['4'],
    marginBottom: Spacing['6'],
  },
  pinLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing['4'],
  },
  errorText: {
    fontSize: FontSize.sm,
    color: Colors.error,
    textAlign: 'center',
    marginTop: Spacing['3'],
  },
  forgotLink: {
    alignItems: 'center',
    marginTop: Spacing['4'],
    padding: Spacing['2'],
  },
  forgotText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
  bottomLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: Spacing['6'],
  },
  bottomText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  bottomAction: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
});
```

- [ ] **Step 2: Commit**

```bash
cd /c/Users/bibac/akiba/.worktrees/mobile-ui
git add "apps/mobile/app/(auth)/login.tsx"
git commit -m "feat(mobile): add login screen with phone + PIN flow"
```

---

### Task 8: Verify Expo Build & Fix TypeScript Errors

**Files:**
- Potentially modify any file with type errors

- [ ] **Step 1: Run TypeScript check**

```bash
cd /c/Users/bibac/akiba/.worktrees/mobile-ui/apps/mobile
npx tsc --noEmit 2>&1 | head -60
```

- [ ] **Step 2: Fix any TypeScript errors found**

Read each erroring file, understand the issue, and fix it. Common issues:
- Missing type exports in API modules (PricePoint, PerformancePoint)
- Property mismatches between mock data and API types
- Missing imports for new components

- [ ] **Step 3: Verify fix**

```bash
cd /c/Users/bibac/akiba/.worktrees/mobile-ui/apps/mobile
npx tsc --noEmit
```

Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
cd /c/Users/bibac/akiba/.worktrees/mobile-ui
git add -A
git commit -m "fix(mobile): resolve TypeScript errors across screens and mocks"
```

---

### Task 9: Verify Expo Starts Successfully

**Files:**
- Potentially modify any file causing runtime errors

- [ ] **Step 1: Start Expo dev server**

```bash
cd /c/Users/bibac/akiba/.worktrees/mobile-ui/apps/mobile
npx expo start --web 2>&1
```

Check that the dev server starts without errors. If web bundling fails, read the error and fix the offending file.

- [ ] **Step 2: Fix any runtime issues**

Common issues:
- Missing native module stubs for web (SecureStore, MMKV)
- Import path errors
- Missing peer dependencies

- [ ] **Step 3: Commit any fixes**

```bash
cd /c/Users/bibac/akiba/.worktrees/mobile-ui
git add -A
git commit -m "fix(mobile): resolve Expo startup issues"
```
