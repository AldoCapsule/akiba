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
