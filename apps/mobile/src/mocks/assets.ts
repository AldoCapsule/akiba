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
    const p = Math.round(price);
    const spread = Math.round(p * volatility * 0.02);
    points.push({
      date: date.toISOString(),
      open: p - spread,
      high: p + spread,
      low: p - spread * 2,
      close: p,
      volume: Math.round(Math.random() * 50000 + 5000),
    });
  }

  // Ensure last point matches current price
  points[points.length - 1].close = basePrice;
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
    description: "Sonatel est le principal opérateur de télécommunications au Sénégal, filiale du groupe Orange. Leader sur le marché mobile et internet fixe en Afrique de l'Ouest.",
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
    description: "Bank of Africa Sénégal, filiale du groupe BOA. Banque commerciale offrant des services aux particuliers et entreprises.",
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
    description: "TotalEnergies Marketing Côte d'Ivoire. Distribution de produits pétroliers et lubrifiants en Afrique de l'Ouest.",
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
    priceHistory: generatePriceHistory(10_150, 30, 0.01),
  },
  'ast-tsn26': {
    ...MOCK_ASSETS[5],
    description: 'Obligation du Trésor du Sénégal, taux fixe 5.8%, maturité mars 2026.',
    couponRate: 5.8,
    maturityDate: '2026-03-31',
    priceHistory: generatePriceHistory(10_050, 30, 0.01),
  },
  'ast-tsn27': {
    ...MOCK_ASSETS[6],
    description: 'Obligation du Trésor du Sénégal, taux fixe 6.0%, maturité juin 2027.',
    couponRate: 6.0,
    maturityDate: '2027-06-30',
    priceHistory: generatePriceHistory(9_980, 30, 0.01),
  },
  'ast-sksn26': {
    ...MOCK_ASSETS[7],
    description: 'Sukuk souverain du Sénégal, conforme à la Sharia, taux de profit 5.5%. Certifié par le Comité Sharia de la BCEAO.',
    couponRate: 5.5,
    maturityDate: '2026-09-30',
    priceHistory: generatePriceHistory(10_100, 30, 0.01),
  },
  'ast-skbd25': {
    ...MOCK_ASSETS[8],
    description: "Sukuk BOAD conforme à la Sharia, taux de profit 6.0%. Financement de projets de développement dans l'UEMOA.",
    couponRate: 6.0,
    maturityDate: '2025-06-30',
    priceHistory: generatePriceHistory(10_200, 30, 0.01),
  },
  'ast-fcpbr': {
    ...MOCK_ASSETS[9],
    description: 'Fonds commun de placement diversifié géré par BRAO Asset Management. Allocation équilibrée actions/obligations BRVM.',
    nav: 12_500,
    expenseRatio: 1.5,
    priceHistory: generatePriceHistory(12_500, 30, 0.04),
  },
  'ast-fcphc': {
    ...MOCK_ASSETS[10],
    description: 'Fonds de croissance géré par CGF Bourse. Orienté actions BRVM à forte capitalisation. Conforme à la Sharia.',
    nav: 15_200,
    expenseRatio: 1.8,
    priceHistory: generatePriceHistory(15_200, 30, 0.06),
  },
  'ast-vault': {
    ...MOCK_ASSETS[11],
    description: "Compte d'épargne Akiba avec rendement garanti de 3.5% annuel. Capital garanti, retraits à tout moment.",
    nav: 10_000,
    expenseRatio: 0,
    priceHistory: generatePriceHistory(10_000, 30, 0.001),
  },
};
