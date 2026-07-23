/**
 * StepCounterApp — OLED Dark Theme
 *
 * Designed for maximum contrast and battery efficiency on OLED screens.
 * Pure black background with vibrant neon accents.
 */

export const Colors = {
  // Backgrounds
  background: '#09090F',
  surfaceElevated: '#12121A',
  surfaceCard: '#181824',
  surfaceCardHover: '#202030',

  // Primary accent — Electric Neon Cyan
  primary: '#00F5FF',
  primaryDim: '#00C8D6',
  primaryGlow: 'rgba(0, 245, 255, 0.35)',
  primaryMuted: 'rgba(0, 245, 255, 0.15)',

  // Secondary accent — Cyber Violet
  secondary: '#9D00FF',
  secondaryDim: '#7A00CC',
  secondaryGlow: 'rgba(157, 0, 255, 0.35)',

  // Tertiary accent — Neon Magenta
  accent: '#FF007A',
  accentGlow: 'rgba(255, 0, 122, 0.35)',

  // Status colors
  success: '#00F5FF',
  warning: '#FF9900',
  warningGlow: 'rgba(255, 153, 0, 0.35)',
  danger: '#FF0055',
  info: '#9D00FF',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textTertiary: '#606080',
  textDisabled: '#404055',

  // Chart
  chartBarActive: '#00F5FF',
  chartBarPast: '#1A1A28',
  chartBarPastFill: '#242436',
  chartGridLine: '#1A1A28',
  chartTooltipBg: '#1A1A28',

  // Ring
  ringTrack: '#161622',
  ringProgress: '#00F5FF',
  ringExceeded: '#9D00FF',
  ringLow: '#FF9900',

  // Misc
  divider: '#1A1A28',
  overlay: 'rgba(9, 9, 15, 0.85)',
  glassBg: 'rgba(18, 18, 26, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
} as const;

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  massive: 64,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 9999,
} as const;

export const FontSize = {
  xs: 10,
  sm: 12,
  caption: 11,
  small: 13,
  md: 14,
  body: 15,
  lg: 18,
  bodyLarge: 17,
  subtitle: 19,
  title: 22,
  xl: 24,
  xxl: 32,
  heading: 28,
  hero: 48,
  mega: 64,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
  black: '900' as const,
};

export const Shadows = {
  glowPrimary: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  glowSecondary: {
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  glowWarning: {
    shadowColor: Colors.warning,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  cardShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  subtleShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
} as const;

export const Animation = {
  springConfig: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  timingFast: 200,
  timingNormal: 350,
  timingSlow: 600,
  timingRing: 1200,
} as const;

/** Default daily step goal */
export const DEFAULT_STEP_GOAL = 10_000;

/** Backend API base URL — override via environment */
export const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:8000'   // Android emulator → host machine
  : 'https://your-production-api.com';

export type ThemeColors = typeof Colors;
