import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/auth.store';
import * as authApi from '../api/auth';
import { getAccessToken, clearTokens } from '../api/client';
import { normalizePhone } from '../utils/validation';

export function useAuth() {
  const queryClient = useQueryClient();
  const store = useAuthStore();

  // Check for existing session on app load
  const sessionCheck = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) {
        store.setAuthenticated(false);
        store.setReady(true);
        return null;
      }
      try {
        const user = await authApi.getProfile();
        store.setUser(user);
        store.setAuthenticated(true);
        return user;
      } catch {
        await clearTokens();
        store.setAuthenticated(false);
        return null;
      } finally {
        store.setReady(true);
      }
    },
    retry: false,
    staleTime: Infinity,
  });

  // Register → sends OTP
  const registerMutation = useMutation({
    mutationFn: (data: { phone: string; fullName: string; language?: 'fr' | 'wo' | 'en'; referralCode?: string }) =>
      authApi.register({
        phone: normalizePhone(data.phone),
        fullName: data.fullName,
        language: data.language || (store.locale as any),
        referralCode: data.referralCode,
      }),
    onSuccess: (_data, variables) => {
      store.setPendingPhone(normalizePhone(variables.phone));
    },
  });

  // Verify OTP → get tokens + user
  const verifyOtpMutation = useMutation({
    mutationFn: (code: string) => {
      if (!store.pendingPhone) throw new Error('No pending phone');
      return authApi.verifyOtp({ phone: store.pendingPhone, code });
    },
    onSuccess: (data) => {
      store.setUser(data.user);
      store.setAuthenticated(true);
      store.setPendingPhone(null);
      // New users need to set PIN
      store.setNeedsPin(true);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  // Login with PIN
  const loginMutation = useMutation({
    mutationFn: (data: { phone: string; pin: string }) =>
      authApi.login({ phone: normalizePhone(data.phone), pin: data.pin }),
    onSuccess: (data) => {
      store.setUser(data.user);
      store.setAuthenticated(true);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  // Set PIN
  const setPinMutation = useMutation({
    mutationFn: (pin: string) => authApi.setPin({ pin, pinConfirmation: pin }),
    onSuccess: () => {
      store.setNeedsPin(false);
    },
  });

  // Request new OTP (for login)
  const requestOtpMutation = useMutation({
    mutationFn: (phone: string) => authApi.requestOtp(normalizePhone(phone)),
  });

  // Submit KYC documents
  const submitKycMutation = useMutation({
    mutationFn: authApi.submitKyc,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'session'] });
    },
  });

  // Submit risk assessment
  const submitRiskMutation = useMutation({
    mutationFn: authApi.submitRiskAssessment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'session'] });
    },
  });

  // Logout
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      store.logout();
      queryClient.clear();
    },
  });

  return {
    // State
    isAuthenticated: store.isAuthenticated,
    isReady: store.isReady,
    user: store.user,
    pendingPhone: store.pendingPhone,
    locale: store.locale,
    t: store.t,
    hasSeenOnboarding: store.hasSeenOnboarding,
    needsPin: store.needsPin,
    isLoadingSession: sessionCheck.isLoading,

    // Auth actions
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,

    verifyOtp: verifyOtpMutation.mutateAsync,
    isVerifyingOtp: verifyOtpMutation.isPending,
    verifyOtpError: verifyOtpMutation.error,

    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,

    setPin: setPinMutation.mutateAsync,
    isSettingPin: setPinMutation.isPending,

    requestOtp: requestOtpMutation.mutateAsync,
    isRequestingOtp: requestOtpMutation.isPending,

    submitKyc: submitKycMutation.mutateAsync,
    isSubmittingKyc: submitKycMutation.isPending,

    submitRiskAssessment: submitRiskMutation.mutateAsync,
    isSubmittingRisk: submitRiskMutation.isPending,

    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,

    setLocale: store.setLocale,
    setHasSeenOnboarding: store.setHasSeenOnboarding,
  };
}
