import { create } from 'zustand';
import { MMKV } from 'react-native-mmkv';
import { Locale, getDeviceLocale, createTranslator } from '../i18n';
import type { UserProfile } from '../api/auth';

const storage = new MMKV({ id: 'akiba-auth' });

export interface AuthState {
  /** Whether the user is authenticated (has valid tokens) */
  isAuthenticated: boolean;
  /** Whether initial auth check is complete */
  isReady: boolean;
  /** Current user profile */
  user: UserProfile | null;
  /** Phone number during registration flow */
  pendingPhone: string | null;
  /** Current locale */
  locale: Locale;
  /** Translation function */
  t: ReturnType<typeof createTranslator>;
  /** Whether user has completed onboarding */
  hasSeenOnboarding: boolean;
  /** Whether biometric auth is enabled */
  biometricsEnabled: boolean;

  /** Actions */
  setAuthenticated: (authenticated: boolean) => void;
  setReady: (ready: boolean) => void;
  setUser: (user: UserProfile | null) => void;
  setPendingPhone: (phone: string | null) => void;
  setLocale: (locale: Locale) => void;
  setHasSeenOnboarding: (seen: boolean) => void;
  setBiometricsEnabled: (enabled: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const savedLocale = (storage.getString('locale') as Locale) || getDeviceLocale();
  const hasSeenOnboarding = storage.getBoolean('hasSeenOnboarding') ?? false;
  const biometricsEnabled = storage.getBoolean('biometricsEnabled') ?? false;

  return {
    isAuthenticated: false,
    isReady: false,
    user: null,
    pendingPhone: null,
    locale: savedLocale,
    t: createTranslator(savedLocale),
    hasSeenOnboarding,
    biometricsEnabled,

    setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),

    setReady: (ready) => set({ isReady: ready }),

    setUser: (user) => set({ user }),

    setPendingPhone: (phone) => set({ pendingPhone: phone }),

    setLocale: (locale) => {
      storage.set('locale', locale);
      set({ locale, t: createTranslator(locale) });
    },

    setHasSeenOnboarding: (seen) => {
      storage.set('hasSeenOnboarding', seen);
      set({ hasSeenOnboarding: seen });
    },

    setBiometricsEnabled: (enabled) => {
      storage.set('biometricsEnabled', enabled);
      set({ biometricsEnabled: enabled });
    },

    logout: () => {
      set({
        isAuthenticated: false,
        user: null,
        pendingPhone: null,
      });
    },
  };
});
