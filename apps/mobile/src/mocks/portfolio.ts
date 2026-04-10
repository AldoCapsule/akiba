import type { PortfolioSummary, PortfolioDetail, PortfolioHolding, AllocationBreakdown, PerformancePoint } from '../api/portfolios';

function generatePerformance(days: number, startValue: number, endValue: number): PerformancePoint[] {
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

const totalInvested = MOCK_HOLDINGS.reduce((s, h) => s + h.avgBuyPrice * h.quantity, 0);
const totalValue = MOCK_HOLDINGS.reduce((s, h) => s + h.currentValue, 0);

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
  performance: generatePerformance(30, totalInvested, totalValue),
};

export const MOCK_ALLOCATION: AllocationBreakdown = {
  equities: 37,
  bonds: 31,
  sukuk: 16,
  funds: 6,
  cash: 10,
};
