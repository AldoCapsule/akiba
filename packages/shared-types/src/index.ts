// ============================================================================
// Akiba — Shared Domain Types
// All enums and interfaces used across backend services and frontend apps
// ============================================================================

// --- User Domain ---

export enum KycStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export enum KycTier {
  TIER_0 = 'tier_0', // Phone only — can browse, no transactions
  TIER_1 = 'tier_1', // Basic KYC — ID photo + selfie — 200,000 FCFA/day
  TIER_2 = 'tier_2', // Full KYC — ID verification + address — 2,000,000 FCFA/day
  TIER_3 = 'tier_3', // Enhanced — video call — no limit
}

export enum RiskProfile {
  CONSERVATIVE = 'conservative',
  BALANCED = 'balanced',
  AGGRESSIVE = 'aggressive',
}

export enum Language {
  FRENCH = 'fr',
  WOLOF = 'wo',
  ENGLISH = 'en',
}

export interface User {
  id: string;
  phoneNumber: string;
  email?: string;
  fullName: string;
  dateOfBirth?: string;
  nationalIdNumber?: string;
  kycStatus: KycStatus;
  kycTier: KycTier;
  riskProfile?: RiskProfile;
  isHalalOnly: boolean;
  preferredLanguage: Language;
  referralCode: string;
  referredBy?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Wallet Domain ---

export enum WalletType {
  CASH = 'cash',
  INVESTMENT = 'investment',
  SAVINGS = 'savings',
}

export interface Wallet {
  id: string;
  userId: string;
  walletType: WalletType;
  balanceFcfa: number;
  piSpiAlias?: string;
  currency: string;
  createdAt: string;
}

// --- Transaction Domain ---

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  INVESTMENT = 'investment',
  DIVIDEND = 'dividend',
  FEE = 'fee',
  TRANSFER = 'transfer',
  REFUND = 'refund',
}

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REVERSED = 'reversed',
}

export interface Transaction {
  id: string;
  userId: string;
  walletId: string;
  type: TransactionType;
  amountFcfa: number;
  feeFcfa: number;
  status: TransactionStatus;
  piSpiReference?: string;
  externalReference?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  completedAt?: string;
}

// --- Asset Domain ---

export enum AssetType {
  EQUITY = 'equity',
  GOVERNMENT_BOND = 'government_bond',
  TREASURY_BILL = 'treasury_bill',
  MUTUAL_FUND = 'mutual_fund',
  SUKUK = 'sukuk',
  SAVINGS_VAULT = 'savings_vault',
}

export enum RiskLevel {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export interface Asset {
  id: string;
  ticker: string;
  name: string;
  assetType: AssetType;
  market: string;
  isShareCompliant: boolean;
  currentPriceFcfa?: number;
  currency: string;
  riskLevel: RiskLevel;
  description?: string;
  isActive: boolean;
  lastPriceUpdate?: string;
  createdAt: string;
}

// --- Portfolio Domain ---

export enum PortfolioType {
  ROBO_MANAGED = 'robo_managed',
  SELF_DIRECTED = 'self_directed',
  HALAL = 'halal',
  SAVINGS_GOAL = 'savings_goal',
}

export interface TargetAllocation {
  equity: number;
  governmentBonds: number;
  treasuryBills: number;
  sukuk: number;
  savingsVault: number;
}

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  portfolioType: PortfolioType;
  targetAllocation?: TargetAllocation;
  totalValueFcfa: number;
  isActive: boolean;
  createdAt: string;
}

export interface Holding {
  id: string;
  portfolioId: string;
  assetId: string;
  quantity: number;
  averageCostFcfa: number;
  currentValueFcfa: number;
  createdAt: string;
  updatedAt: string;
}

// --- Savings Goal Domain ---

export enum GoalType {
  EMERGENCY_FUND = 'emergency_fund',
  HOUSE = 'house',
  EDUCATION = 'education',
  HAJJ = 'hajj',
  WEDDING = 'wedding',
  BUSINESS = 'business',
  CUSTOM = 'custom',
}

export enum Frequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
}

export interface SavingsGoal {
  id: string;
  userId: string;
  portfolioId?: string;
  name: string;
  goalType: GoalType;
  targetAmountFcfa: number;
  currentAmountFcfa: number;
  targetDate?: string;
  autoDepositAmountFcfa?: number;
  autoDepositFrequency?: Frequency;
  isActive: boolean;
  createdAt: string;
}

// --- PI-SPI Payment Domain ---

export enum PaymentSource {
  WAVE = 'wave',
  ORANGE_MONEY = 'orange_money',
  FREE_MONEY = 'free_money',
  BANK_TRANSFER = 'bank_transfer',
}

export enum PiSpiWebhookEvent {
  PAYMENT_COMPLETED = 'payment.completed',
  PAYMENT_FAILED = 'payment.failed',
  PAYMENT_REQUEST_ACCEPTED = 'payment_request.accepted',
  PAYMENT_REQUEST_REJECTED = 'payment_request.rejected',
  REFUND_COMPLETED = 'refund.completed',
}

export interface PiSpiPaymentRequest {
  amount: number;
  currency: string;
  payerAlias: string;
  payeeAlias: string;
  description: string;
  externalReference: string;
}

export interface PiSpiWebhookPayload {
  event: PiSpiWebhookEvent;
  transactionId: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// --- Robo-Advisor Domain ---

export interface AllocationProfile {
  name: string;
  riskProfile: RiskProfile;
  isHalal: boolean;
  allocation: TargetAllocation;
}

export const ALLOCATION_PROFILES: AllocationProfile[] = [
  {
    name: 'Conservative',
    riskProfile: RiskProfile.CONSERVATIVE,
    isHalal: false,
    allocation: { equity: 10, governmentBonds: 30, treasuryBills: 30, sukuk: 20, savingsVault: 10 },
  },
  {
    name: 'Balanced',
    riskProfile: RiskProfile.BALANCED,
    isHalal: false,
    allocation: { equity: 30, governmentBonds: 25, treasuryBills: 15, sukuk: 20, savingsVault: 10 },
  },
  {
    name: 'Aggressive',
    riskProfile: RiskProfile.AGGRESSIVE,
    isHalal: false,
    allocation: { equity: 50, governmentBonds: 20, treasuryBills: 5, sukuk: 15, savingsVault: 10 },
  },
  {
    name: 'Halal Conservative',
    riskProfile: RiskProfile.CONSERVATIVE,
    isHalal: true,
    allocation: { equity: 10, governmentBonds: 0, treasuryBills: 0, sukuk: 60, savingsVault: 30 },
  },
  {
    name: 'Halal Balanced',
    riskProfile: RiskProfile.BALANCED,
    isHalal: true,
    allocation: { equity: 30, governmentBonds: 0, treasuryBills: 0, sukuk: 50, savingsVault: 20 },
  },
  {
    name: 'Halal Aggressive',
    riskProfile: RiskProfile.AGGRESSIVE,
    isHalal: true,
    allocation: { equity: 50, governmentBonds: 0, treasuryBills: 0, sukuk: 40, savingsVault: 10 },
  },
];

// --- KYC Tier Limits ---

export const KYC_TIER_LIMITS: Record<KycTier, { dailyLimitFcfa: number; description: string }> = {
  [KycTier.TIER_0]: { dailyLimitFcfa: 0, description: 'Browse only — no transactions' },
  [KycTier.TIER_1]: { dailyLimitFcfa: 200_000, description: 'Basic KYC — savings & bonds' },
  [KycTier.TIER_2]: { dailyLimitFcfa: 2_000_000, description: 'Full KYC — all products' },
  [KycTier.TIER_3]: { dailyLimitFcfa: Infinity, description: 'Enhanced — no limits' },
};

// --- API Response Types ---

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// --- Currency Constants ---

export const XOF_EUR_RATE = 655.957; // Fixed peg: 1 EUR = 655.957 XOF
export const MINIMUM_INVESTMENT_FCFA = 500;
export const MINIMUM_SAVINGS_FCFA = 500;
export const REBALANCE_DRIFT_THRESHOLD = 5; // Percentage points
