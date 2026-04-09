import { getLocales } from 'expo-localization';
import { fr, TranslationKey } from './fr';
import { wo } from './wo';
import { en } from './en';

export type Locale = 'fr' | 'wo' | 'en';

const translations: Record<Locale, TranslationKey> = { fr, wo, en };

/**
 * Get the user's preferred locale, falling back to French (Senegal default).
 */
export function getDeviceLocale(): Locale {
  try {
    const locales = getLocales();
    const deviceLang = locales[0]?.languageCode ?? 'fr';
    if (deviceLang === 'wo') return 'wo';
    if (deviceLang === 'en') return 'en';
    return 'fr';
  } catch {
    return 'fr';
  }
}

/**
 * Simple nested key access for translations.
 * Usage: t('home.greeting') => 'Bonjour'
 */
export function createTranslator(locale: Locale) {
  const strings = translations[locale] ?? translations.fr;

  function t(key: string, params?: Record<string, string | number>): string {
    const keys = key.split('.');
    let result: unknown = strings;

    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = (result as Record<string, unknown>)[k];
      } else {
        // Fallback to French
        let fallback: unknown = translations.fr;
        for (const fk of keys) {
          if (fallback && typeof fallback === 'object' && fk in fallback) {
            fallback = (fallback as Record<string, unknown>)[fk];
          } else {
            return key; // Key not found anywhere
          }
        }
        result = fallback;
        break;
      }
    }

    if (typeof result !== 'string') return key;

    // Replace {param} placeholders
    if (params) {
      return Object.entries(params).reduce(
        (str, [paramKey, paramValue]) =>
          str.replace(`{${paramKey}}`, String(paramValue)),
        result,
      );
    }

    return result;
  }

  return t;
}

export { fr, wo, en };
export type { TranslationKey };
