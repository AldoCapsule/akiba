import type { UserData } from '../api/auth';

export const MOCK_USER: UserData = {
  id: 'usr-demo-001',
  phoneNumber: '+221770001234',
  fullName: 'Aminata Diallo',
  kycStatus: 'verified',
  kycTier: 'tier_1',
  riskProfile: 'balanced',
  isHalalOnly: false,
  preferredLanguage: 'fr',
};
