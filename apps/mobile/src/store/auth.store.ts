import { create } from 'zustand';
import { Platform } from 'react-native';
import { Locale, getDeviceLocale, createTranslator } from '../i18n';
import type { UserData } from '../api/auth';

// MMKV is native-only; use localStorage on web
const storage = Platform.OS === 'web'
  ? {
      getString: (key: string) => localStorage.getItem(`akiba-auth:${key}`) ?? undefined,
      getBoolean: (key: string) => {
        const v = localStorage.getItem(`akiba-auth:${key}`);
        return v === null ? undefined : v === 'true';
      },
      set: (key: string, value: string | boolean) =>
        localStorage.setItem(`akiba-auth:${key}`, String(value)),
    }
  : new (require('react-native-mmkv').MMKV)({ id: 'akiba-auth' });

export interface AuthState {
  isAuthenticated: boolean;
  isReady: boolean;
  user: UserData | null;
  pendingPhone: string | null;
  locale: Locale;
  t: ReturnType<typeof createTranslator>;
  hasSeenOnboarding: boolean;
  biometricsEnabled: boolean;
  needsPin: boolean; // User verified OTP but hasn't set PIN yet

  setAuthenticated: (authenticated: boolean) => void;
  setReady: (ready: boolean) => void;
  setUser: (user: UserData | null) => void;
  setPendingPhone: (phone: string | null) => void;
  setLocale: (locale: Locale) => void;
  setHasSeenOnboarding: (seen: boolean) => void;
  setBiometricsEnabled: (enabled: boolean) => void;
  setNeedsPin: (needs: boolean) => void;
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
    needsPin: false,

    setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
    setReady: (ready) => set({ isReady: ready }),
    setUser: (user) => set({ user }),
    setPendingPhone: (phone) => set({ pendingPhone: phone }),
    setNeedsPin: (needs) => set({ needsPin: needs }),

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
      set({ isAuthenticated: false, user: null, pendingPhone: null, needsPin: false });
    },
  };
});
