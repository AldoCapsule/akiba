/**
 * Formatting utilities for the Senegalese / UEMOA market.
 * Currency: West African CFA Franc (FCFA / XOF), no decimal subdivision.
 */

/**
 * Format an amount in CFA francs with thousands separator.
 * CFA uses spaces as thousands separator, no decimals.
 *
 * @example formatCFA(1500000) => "1 500 000 FCFA"
 * @example formatCFA(1500000, { showCurrency: false }) => "1 500 000"
 */
export function formatCFA(
  amount: number,
  options?: { showCurrency?: boolean; compact?: boolean },
): string {
  const { showCurrency = true, compact = false } = options ?? {};

  if (compact && Math.abs(amount) >= 1_000_000) {
    const millions = amount / 1_000_000;
    const formatted = millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1);
    return showCurrency ? `${formatted}M FCFA` : `${formatted}M`;
  }

  if (compact && Math.abs(amount) >= 1_000) {
    const thousands = amount / 1_000;
    const formatted = thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1);
    return showCurrency ? `${formatted}K FCFA` : `${formatted}K`;
  }

  // CFA franc has no decimals
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  return showCurrency ? `${formatted} FCFA` : formatted;
}

/**
 * Parse a formatted CFA string back to number.
 */
export function parseCFA(text: string): number {
  const cleaned = text.replace(/[^\d-]/g, '');
  return parseInt(cleaned, 10) || 0;
}

/**
 * Format a percentage with optional sign.
 *
 * @example formatPercent(5.23) => "+5.23%"
 * @example formatPercent(-2.1) => "-2.10%"
 */
export function formatPercent(
  value: number,
  options?: { decimals?: number; showSign?: boolean },
): string {
  const { decimals = 2, showSign = true } = options ?? {};
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format a date in French locale style.
 *
 * @example formatDate(new Date()) => "8 avr. 2026"
 */
export function formatDate(
  date: Date | string,
  style: 'short' | 'medium' | 'long' = 'medium',
): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    short: { day: 'numeric', month: 'numeric', year: '2-digit' } as const,
    medium: { day: 'numeric', month: 'short', year: 'numeric' } as const,
    long: { day: 'numeric', month: 'long', year: 'numeric' } as const,
  }[style];

  return d.toLocaleDateString('fr-SN', options);
}

/**
 * Format a relative time (e.g., "il y a 3 heures").
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHrs = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffHrs < 24) return `Il y a ${diffHrs}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return formatDate(d, 'short');
}

/**
 * Format phone number for display.
 * Senegalese numbers: +221 XX XXX XX XX
 */
export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('221') && digits.length === 12) {
    return `+221 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`;
  }
  if (digits.length === 9) {
    return `+221 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`;
  }
  return phone;
}
