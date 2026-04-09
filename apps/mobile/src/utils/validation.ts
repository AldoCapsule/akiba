/**
 * Validation utilities for Akiba.
 * Covers Senegalese phone numbers, CFA amounts, and common fields.
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate a Senegalese phone number.
 * Format: +221 7X XXX XX XX (9 digits after country code).
 * Mobile prefixes: 70, 76, 77, 78 (main operators).
 */
export function validatePhoneNumber(phone: string): ValidationResult {
  const digits = phone.replace(/\D/g, '');

  // With country code
  if (digits.startsWith('221')) {
    if (digits.length !== 12) {
      return { valid: false, error: 'Le numéro doit contenir 9 chiffres après +221.' };
    }
    const local = digits.slice(3);
    if (!/^7[0678]/.test(local)) {
      return { valid: false, error: 'Le numéro doit commencer par 70, 76, 77 ou 78.' };
    }
    return { valid: true };
  }

  // Without country code
  if (digits.length === 9) {
    if (!/^7[0678]/.test(digits)) {
      return { valid: false, error: 'Le numéro doit commencer par 70, 76, 77 ou 78.' };
    }
    return { valid: true };
  }

  return { valid: false, error: 'Numéro de téléphone invalide.' };
}

/**
 * Normalize phone to E.164 format (+221XXXXXXXXX).
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('221')) return `+${digits}`;
  if (digits.length === 9) return `+221${digits}`;
  return phone;
}

/**
 * Validate a CFA amount.
 * Minimum investment/deposit is 1,000 FCFA.
 */
export function validateAmount(
  amount: number,
  options?: { min?: number; max?: number },
): ValidationResult {
  const { min = 1_000, max } = options ?? {};

  if (!Number.isFinite(amount) || amount <= 0) {
    return { valid: false, error: 'Le montant doit être supérieur à 0.' };
  }

  if (amount < min) {
    return {
      valid: false,
      error: `Le montant minimum est ${min.toLocaleString('fr-FR')} FCFA.`,
    };
  }

  if (max && amount > max) {
    return {
      valid: false,
      error: `Le montant maximum est ${max.toLocaleString('fr-FR')} FCFA.`,
    };
  }

  // CFA has no decimal subdivision
  if (amount !== Math.round(amount)) {
    return { valid: false, error: 'Le montant doit être un nombre entier.' };
  }

  return { valid: true };
}

/**
 * Validate OTP code (6 digits).
 */
export function validateOtp(otp: string): ValidationResult {
  const cleaned = otp.replace(/\D/g, '');
  if (cleaned.length !== 6) {
    return { valid: false, error: 'Le code doit contenir 6 chiffres.' };
  }
  return { valid: true };
}

/**
 * Validate a full name (at least first and last name).
 */
export function validateFullName(name: string): ValidationResult {
  const trimmed = name.trim();
  if (trimmed.length < 3) {
    return { valid: false, error: 'Le nom est trop court.' };
  }
  if (!trimmed.includes(' ')) {
    return { valid: false, error: 'Veuillez entrer votre nom complet (prénom et nom).' };
  }
  return { valid: true };
}

/**
 * Validate a national ID number (CNI Senegal: typically 13 digits).
 */
export function validateIdNumber(id: string): ValidationResult {
  const digits = id.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) {
    return { valid: false, error: 'Numéro de pièce d\'identité invalide.' };
  }
  return { valid: true };
}
