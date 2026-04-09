import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/auth.store';
import * as authApi from '../api/auth';
import { getAccessToken, clearTokens } from '../api/client';
import { normalizePhone } from '../utils/validation';

/**
 * Auth hook that bridges Zustand store with React Query mutations.
 * Provides auth actions and current auth state.
 */
export function useAuth() {
  const queryClient = useQueryClient();
  const store = useAuthStore();

  /** Check if user has a valid session on app load */
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
        const { data: user } = await authApi.getProfile();
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

  /** Register with phone number */
  const registerMutation = useMutation({
    mutationFn: (phone: string) =>
      authApi.register({ phone: normalizePhone(phone), locale: store.locale }),
    onSuccess: (_data, phone) => {
      store.setPendingPhone(normalizePhone(phone));
    },
  });

  /** Verify OTP */
  const verifyOtpMutation = useMutation({
    mutationFn: (otp: string) => {
      if (!store.pendingPhone) throw new Error('No pending phone');
      return authApi.verifyOtp({ phone: store.pendingPhone, otp });
    },
    onSuccess: async () => {
      const { data: user } = await authApi.getProfile();
      store.setUser(user);
      store.setAuthenticated(true);
      store.setPendingPhone(null);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  /** Resend OTP */
  const resendOtpMutation = useMutation({
    mutationFn: () => {
      if (!store.pendingPhone) throw new Error('No pending phone');
      return authApi.resendOtp(store.pendingPhone);
    },
  });

  /** Submit KYC documents */
  const submitKycMutation = useMutation({
    mutationFn: authApi.submitKyc,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'session'] });
    },
  });

  /** Submit risk assessment */
  const submitRiskMutation = useMutation({
    mutationFn: authApi.submitRiskAssessment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'session'] });
    },
  });

  /** Logout */
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      store.logout();
      queryClient.clear();
    },
  });

  return {
    /** State */
    isAuthenticated: store.isAuthenticated,
    isReady: store.isReady,
    user: store.user,
    pendingPhone: store.pendingPhone,
    locale: store.locale,
    t: store.t,
    hasSeenOnboarding: store.hasSeenOnboarding,

    /** Session */
    isLoadingSession: sessionCheck.isLoading,

    /** Actions */
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,

    verifyOtp: verifyOtpMutation.mutateAsync,
    isVerifyingOtp: verifyOtpMutation.isPending,
    verifyOtpError: verifyOtpMutation.error,

    resendOtp: resendOtpMutation.mutateAsync,
    isResendingOtp: resendOtpMutation.isPending,

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
