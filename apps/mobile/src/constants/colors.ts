export const Colors = {
  /** Primary brand green — trust, growth, prosperity */
  primary: '#00A86B',
  primaryLight: '#33BB89',
  primaryDark: '#008755',

  /** Deep navy — sophistication, security */
  navy: '#1A1A2E',
  navyLight: '#2D2D44',

  /** Warm gold — premium, achievement */
  gold: '#F5A623',
  goldLight: '#F7B84E',

  /** Backgrounds */
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  /** Grays */
  gray100: '#F8F9FA',
  gray200: '#E9ECEF',
  gray300: '#DEE2E6',
  gray400: '#CED4DA',
  gray500: '#ADB5BD',
  gray600: '#6C757D',
  gray700: '#495057',
  gray800: '#343A40',
  gray900: '#212529',

  /** Semantic */
  success: '#00A86B',
  warning: '#F5A623',
  error: '#E74C3C',
  info: '#3498DB',

  /** Text */
  textPrimary: '#1A1A2E',
  textSecondary: '#6C757D',
  textTertiary: '#ADB5BD',
  textInverse: '#FFFFFF',
  textLink: '#3498DB',

  /** Borders */
  border: '#E9ECEF',
  borderFocused: '#00A86B',

  /** Overlays */
  overlay: 'rgba(26, 26, 46, 0.5)',
  shimmer: 'rgba(255, 255, 255, 0.1)',

  /** Halal badge */
  halalGreen: '#00A86B',
  halalBadgeBg: 'rgba(0, 168, 107, 0.1)',

  /** Chart palette */
  chartEquities: '#00A86B',
  chartBonds: '#3498DB',
  chartSukuk: '#F5A623',
  chartFunds: '#9B59B6',
  chartCash: '#95A5A6',
} as const;

export type ColorKey = keyof typeof Colors;
