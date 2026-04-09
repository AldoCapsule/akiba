import { apiClient, ApiResponse, setTokens, clearTokens } from './client';

/** Request / response types */
export interface RegisterRequest {
  phone: string;
  locale?: string;
}

export interface RegisterResponse {
  userId: string;
  otpSent: boolean;
  /** OTP expiry in seconds */
  expiresIn: number;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserProfile {
  id: string;
  phone: string;
  fullName?: string;
  email?: string;
  kycTier: 0 | 1 | 2 | 3;
  kycStatus: 'none' | 'pending' | 'verified' | 'rejected';
  riskProfile?: 'conservative' | 'moderate' | 'balanced' | 'growth' | 'aggressive';
  locale: string;
  createdAt: string;
}

export interface KycSubmission {
  fullName: string;
  dateOfBirth: string;
  idNumber?: string;
  /** Base64-encoded ID photo, or presigned URL */
  idPhotoUri?: string;
  incomeProofUri?: string;
  tier: 1 | 2 | 3;
}

export interface RiskAnswer {
  questionId: number;
  answerId: number;
}

export interface RiskAssessmentResult {
  profile: 'conservative' | 'moderate' | 'balanced' | 'growth' | 'aggressive';
  score: number;
}

/** API calls */

export async function register(data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
  const response = await apiClient.post<ApiResponse<RegisterResponse>>('/auth/register', data);
  return response.data;
}

export async function verifyOtp(data: VerifyOtpRequest): Promise<ApiResponse<AuthTokens>> {
  const response = await apiClient.post<ApiResponse<AuthTokens>>('/auth/verify-otp', data);
  const { accessToken, refreshToken } = response.data.data;
  await setTokens(accessToken, refreshToken);
  return response.data;
}

export async function resendOtp(phone: string): Promise<ApiResponse<{ expiresIn: number }>> {
  const response = await apiClient.post<ApiResponse<{ expiresIn: number }>>('/auth/resend-otp', {
    phone,
  });
  return response.data;
}

export async function loginWithBiometrics(): Promise<ApiResponse<AuthTokens>> {
  const response = await apiClient.post<ApiResponse<AuthTokens>>('/auth/biometric-login');
  const { accessToken, refreshToken } = response.data.data;
  await setTokens(accessToken, refreshToken);
  return response.data;
}

export async function getProfile(): Promise<ApiResponse<UserProfile>> {
  const response = await apiClient.get<ApiResponse<UserProfile>>('/auth/profile');
  return response.data;
}

export async function updateProfile(
  data: Partial<Pick<UserProfile, 'fullName' | 'email' | 'locale'>>,
): Promise<ApiResponse<UserProfile>> {
  const response = await apiClient.patch<ApiResponse<UserProfile>>('/auth/profile', data);
  return response.data;
}

export async function submitKyc(data: KycSubmission): Promise<ApiResponse<{ kycStatus: string }>> {
  const response = await apiClient.post<ApiResponse<{ kycStatus: string }>>('/auth/kyc', data);
  return response.data;
}

export async function submitRiskAssessment(
  answers: RiskAnswer[],
): Promise<ApiResponse<RiskAssessmentResult>> {
  const response = await apiClient.post<ApiResponse<RiskAssessmentResult>>(
    '/auth/risk-assessment',
    { answers },
  );
  return response.data;
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } finally {
    await clearTokens();
  }
}
