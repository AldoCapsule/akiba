import { apiClient, ApiResponse, setTokens, clearTokens } from './client';

// ─── Types matching our NestJS backend ───────────────────────────

export interface RegisterRequest {
  phone: string;
  fullName: string;
  email?: string;
  language?: 'fr' | 'wo' | 'en';
  referralCode?: string;
}

export interface RegisterResponse {
  message: string;
  userId: string;
  expiresIn: number;
}

export interface VerifyOtpRequest {
  phone: string;
  code: string;
}

export interface LoginRequest {
  phone: string;
  pin: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserData {
  id: string;
  phoneNumber: string;
  fullName: string;
  kycStatus: 'pending' | 'submitted' | 'verified' | 'rejected';
  kycTier: 'tier_0' | 'tier_1' | 'tier_2' | 'tier_3';
  riskProfile?: 'conservative' | 'balanced' | 'aggressive';
  isHalalOnly: boolean;
  preferredLanguage: 'fr' | 'wo' | 'en';
}

export interface AuthResponse extends AuthTokens {
  user: UserData;
}

export interface SetPinRequest {
  pin: string;
  pinConfirmation: string;
}

export interface KycSubmitRequest {
  documentFrontKey: string;
  documentBackKey?: string;
  selfieKey: string;
  nationalIdNumber?: string;
}

export interface RiskAssessmentRequest {
  incomeRange: 'BELOW_100K' | 'FROM_100K_TO_300K' | 'FROM_300K_TO_1M' | 'ABOVE_1M';
  investmentHorizon: 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM';
  investmentExperience: 'NONE' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  riskTolerance: number;
  maxAcceptableLoss: number;
}

export interface RiskAssessmentResult {
  score: number;
  riskProfile: string;
  description: string;
}

// ─── API Calls ───────────────────────────────────────────────────

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const res = await apiClient.post<ApiResponse<RegisterResponse>>('/auth/register', data);
  return res.data.data;
}

export async function verifyOtp(data: VerifyOtpRequest): Promise<AuthResponse> {
  const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/verify-otp', data);
  const { accessToken, refreshToken } = res.data.data;
  await setTokens(accessToken, refreshToken);
  return res.data.data;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
  const { accessToken, refreshToken } = res.data.data;
  await setTokens(accessToken, refreshToken);
  return res.data.data;
}

export async function requestOtp(phone: string): Promise<{ message: string; expiresIn: number }> {
  const res = await apiClient.post<ApiResponse<{ message: string; expiresIn: number }>>(
    '/auth/request-otp',
    { phone },
  );
  return res.data.data;
}

export async function setPin(data: SetPinRequest): Promise<{ message: string }> {
  const res = await apiClient.post<ApiResponse<{ message: string }>>('/auth/set-pin', data);
  return res.data.data;
}

// ─── User / KYC / Risk ──────────────────────────────────────────

export async function getProfile(): Promise<UserData & { wallets: any[] }> {
  const res = await apiClient.get<ApiResponse<UserData & { wallets: any[] }>>('/users/me');
  return res.data.data;
}

export async function updateProfile(
  data: Partial<{ fullName: string; email: string; preferredLanguage: string; isHalalOnly: boolean }>,
) {
  const res = await apiClient.patch('/users/me', data);
  return res.data.data;
}

export async function submitKyc(data: KycSubmitRequest) {
  const res = await apiClient.post('/users/me/kyc', data);
  return res.data.data;
}

export async function getKycStatus() {
  const res = await apiClient.get('/users/me/kyc');
  return res.data.data;
}

export async function submitRiskAssessment(
  data: RiskAssessmentRequest,
): Promise<RiskAssessmentResult> {
  const res = await apiClient.post<ApiResponse<RiskAssessmentResult>>(
    '/users/me/risk-assessment',
    data,
  );
  return res.data.data;
}

export async function getRiskProfile() {
  const res = await apiClient.get('/users/me/risk-assessment');
  return res.data.data;
}

export async function logout(): Promise<void> {
  await clearTokens();
}
