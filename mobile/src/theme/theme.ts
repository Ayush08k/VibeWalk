/**
 * StepCounterApp — OLED Dark Theme
 *
 * Designed for maximum contrast and battery efficiency on OLED screens.
 * Pure black background with vibrant neon accents.
 */

export const Colors = {
  // Backgrounds
  background: '#000000',
  surfaceElevated: '#0A0A0A',
  surfaceCard: '#141414',
  surfaceCardHover: '#1A1A1A',

  // Primary accent — Electric Green
  primary: '#00E676',
  primaryDim: '#00C853',
  primaryGlow: 'rgba(0, 230, 118, 0.35)',
  primaryMuted: 'rgba(0, 230, 118, 0.15)',

  // Secondary accent — Electric Blue
  secondary: '#448AFF',
  secondaryDim: '#2979FF',
  secondaryGlow: 'rgba(68, 138, 255, 0.35)',

  // Status colors
  success: '#00E676',
  warning: '#FF6D00',
  warningGlow: 'rgba(255, 109, 0, 0.35)',
  danger: '#FF1744',
  info: '#448AFF',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#666666',
  textDisabled: '#444444',

  // Chart
  chartBarActive: '#00E676',
  chartBarPast: '#2A2A2A',
  chartBarPastFill: '#333333',
  chartGridLine: '#1A1A1A',
  chartTooltipBg: '#1E1E1E',

  // Ring
  ringTrack: '#1A1A1A',
  ringProgress: '#00E676',
  ringExceeded: '#448AFF',
  ringLow: '#FF6D00',

  // Misc
  divider: '#1A1A1A',
  overlay: 'rgba(0, 0, 0, 0.7)',
  glassBg: 'rgba(20, 20, 20, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
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
  caption: 11,
  small: 13,
  body: 15,
  bodyLarge: 17,
  subtitle: 19,
  title: 22,
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
