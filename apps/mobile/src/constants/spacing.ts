/**
 * Spacing scale based on 4px grid.
 * Consistent spacing creates visual rhythm.
 */
export const Spacing = {
  /** 2px — hairline borders, icon gaps */
  '0.5': 2,
  /** 4px — tight padding */
  '1': 4,
  /** 8px — small gaps */
  '2': 8,
  /** 12px — compact padding */
  '3': 12,
  /** 16px — standard padding */
  '4': 16,
  /** 20px — medium gaps */
  '5': 20,
  /** 24px — section padding */
  '6': 24,
  /** 32px — large gaps */
  '8': 32,
  /** 40px — extra-large gaps */
  '10': 40,
  /** 48px — section breaks */
  '12': 48,
  /** 64px — major section breaks */
  '16': 64,
  /** 80px — screen top/bottom padding */
  '20': 80,
} as const;

/** Standard screen horizontal padding */
export const SCREEN_PADDING = Spacing['4'];

/** Standard card internal padding */
export const CARD_PADDING = Spacing['4'];

/** Radius scale */
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

/** Shadow presets for elevated surfaces */
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;

/** Thumb-friendly minimum touch target (48px per Apple/Google guidelines) */
export const MIN_TOUCH_TARGET = 48;

/** Bottom 60% zone height ratio for primary actions */
export const ACTION_ZONE_RATIO = 0.6;
