import type { Transaction } from '../api/payments';

const now = new Date();
function daysAgo(days: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'tx-01', type: 'deposit', amount: 100_000, status: 'completed', provider: 'wave', description: 'Dépôt via Wave', createdAt: daysAgo(90), completedAt: daysAgo(90) },
  { id: 'tx-02', type: 'investment', amount: 80_000, status: 'completed', description: 'Achat Sonatel (SNTS) x4', createdAt: daysAgo(88), completedAt: daysAgo(88), reference: 'Sonatel' },
  { id: 'tx-03', type: 'investment', amount: 32_500, status: 'completed', description: 'Achat BOA Sénégal (BOAS) x5', createdAt: daysAgo(85), completedAt: daysAgo(85), reference: 'BOA Sénégal' },
  { id: 'tx-04', type: 'deposit', amount: 200_000, status: 'completed', provider: 'orange_money', description: 'Dépôt via Orange Money', createdAt: daysAgo(75), completedAt: daysAgo(75) },
  { id: 'tx-05', type: 'investment', amount: 100_000, status: 'completed', description: 'Achat BOAD 2025 (BOAD25) x10', createdAt: daysAgo(72), completedAt: daysAgo(72), reference: 'BOAD 2025' },
  { id: 'tx-06', type: 'investment', amount: 50_000, status: 'completed', description: 'Achat Trésor SN 2026 (TSN26) x5', createdAt: daysAgo(70), completedAt: daysAgo(70), reference: 'Trésor SN 2026' },
  { id: 'tx-07', type: 'dividend', amount: 4_800, status: 'completed', description: 'Dividende Sonatel Q1 2026', createdAt: daysAgo(60), completedAt: daysAgo(60), reference: 'Sonatel' },
  { id: 'tx-08', type: 'deposit', amount: 150_000, status: 'completed', provider: 'wave', description: 'Dépôt via Wave', createdAt: daysAgo(50), completedAt: daysAgo(50) },
  { id: 'tx-09', type: 'investment', amount: 50_000, status: 'completed', description: 'Achat Sukuk Sénégal (SKSN26) x5', createdAt: daysAgo(48), completedAt: daysAgo(48), reference: 'Sukuk Sénégal' },
  { id: 'tx-10', type: 'investment', amount: 30_150, status: 'completed', description: 'Achat Sukuk BOAD (SKBD25) x3', createdAt: daysAgo(45), completedAt: daysAgo(45), reference: 'Sukuk BOAD' },
  { id: 'tx-11', type: 'dividend', amount: 1_200, status: 'completed', description: 'Coupon BOAD 2025', createdAt: daysAgo(30), completedAt: daysAgo(30), reference: 'BOAD 2025' },
  { id: 'tx-12', type: 'investment', amount: 28_000, status: 'completed', description: 'Achat FCP Horizon Croissance x2', createdAt: daysAgo(25), completedAt: daysAgo(25), reference: 'FCP Horizon' },
  { id: 'tx-13', type: 'deposit', amount: 75_000, status: 'completed', provider: 'orange_money', description: 'Dépôt via Orange Money', createdAt: daysAgo(15), completedAt: daysAgo(15) },
  { id: 'tx-14', type: 'investment', amount: 40_000, status: 'completed', description: 'Achat Sonatel (SNTS) x2 + Akiba Vault x4', createdAt: daysAgo(10), completedAt: daysAgo(10), reference: 'Sonatel' },
  { id: 'tx-15', type: 'withdrawal', amount: 25_000, status: 'completed', provider: 'wave', description: 'Retrait vers Wave', createdAt: daysAgo(5), completedAt: daysAgo(5) },
];
