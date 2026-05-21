/**
 * Memento — Premium Design System
 * Warm, accessible, and elegant UI tokens.
 *
 * Design principles:
 *  - Warm earth tones with golden accents (premium feel)
 *  - High contrast for WCAG AA (Alzheimer-friendly readability)
 *  - Large touch targets (min 48 × 48)
 *  - Calm, non-distracting motion
 */

// ─── Colors ──────────────────────────────────────────────────────────

export const COLORS = {
  /* ── Brand ─────────────────────────────────────────── */
  primary:         '#B07D4F',   // Warm amber-brown
  primaryLight:    '#CBAA7E',
  primaryDark:     '#8A6038',
  primaryMuted:    '#F5ECE2',   // Very light amber tint

  /* ── Accent (Sage Green) ───────────────────────────── */
  accent:          '#7B9E6F',
  accentLight:     '#A3BF98',
  accentDark:      '#567A4A',
  accentMuted:     '#EAF1E6',

  /* ── Backgrounds ───────────────────────────────────── */
  background:      '#FAF8F5',   // Warm off-white
  backgroundCard:  '#FFFFFF',
  backgroundMuted: '#F0ECE6',   // Subtle warm gray
  backgroundDark:  '#2D2825',   // Dark mode surface (future)

  /* ── Typography ────────────────────────────────────── */
  textPrimary:     '#2D2825',
  textSecondary:   '#59524C',
  textMuted:       '#8C847D',
  textLight:       '#BFB8B2',
  textOnPrimary:   '#FFFFFF',
  textOnAccent:    '#FFFFFF',

  /* ── Borders ───────────────────────────────────────── */
  border:          '#E6E2DC',
  borderLight:     '#F0ECE6',
  borderDark:      '#CCC5BE',

  /* ── Semantic ──────────────────────────────────────── */
  success:         '#6B8E6B',
  successLight:    '#E8F2E8',
  warning:         '#D4A373',
  warningLight:    '#FDF4EB',
  danger:          '#C45A5A',
  dangerLight:     '#FAECEC',
  info:            '#6B8EB0',
  infoLight:       '#E8EFF5',

  /* ── Overlays & Shadows ────────────────────────────── */
  overlay:         'rgba(45, 40, 37, 0.55)',
  shadow:          'rgba(89, 82, 76, 0.08)',
  shadowStrong:    'rgba(89, 82, 76, 0.18)',

  /* ── Glass ─────────────────────────────────────────── */
  glass:           'rgba(255, 255, 255, 0.72)',
  glassBorder:     'rgba(255, 255, 255, 0.35)',

  /* ── Gradient pairs ────────────────────────────────── */
  gradientWarm:    ['#B07D4F', '#D4A76A'] as const,
  gradientSage:    ['#7B9E6F', '#A3BF98'] as const,
  gradientGold:    ['#C9A96E', '#E2C98A'] as const,
  gradientCream:   ['#FAF8F5', '#F0ECE6'] as const,
} as const;

// ─── Typography ──────────────────────────────────────────────────────

export const FONTS = {
  sizes: {
    xs:    12,
    sm:    14,
    md:    16,
    lg:    20,
    xl:    26,
    xxl:   34,
    title: 42,
    hero:  52,
  },
  weights: {
    light:    '300' as const,
    regular:  '400' as const,
    medium:   '500' as const,
    semibold: '600' as const,
    bold:     '700' as const,
  },
  letterSpacing: {
    tighter: -0.8,
    tight:   -0.4,
    normal:   0,
    wide:     0.4,
    wider:    0.8,
    widest:   1.6,
  },
  lineHeight: {
    tight:   1.2,
    normal:  1.5,
    relaxed: 1.75,
  },
} as const;

// ─── Spacing ─────────────────────────────────────────────────────────

export const SPACING = {
  xxs:  2,
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  xxl:  48,
  xxxl: 64,
} as const;

// ─── Border Radius ───────────────────────────────────────────────────

export const BORDER_RADIUS = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  xxl:  32,
  full: 9999,
} as const;

// ─── Touch Targets (Accessibility) ──────────────────────────────────

export const TOUCH_TARGET = {
  minSize:           48,
  buttonHeight:      56,
  largeButtonHeight: 72,
  iconButton:        44,
} as const;

// ─── Shadows ─────────────────────────────────────────────────────────

export const SHADOWS = {
  sm: {
    shadowColor:   COLORS.shadow,
    shadowOffset:  { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius:  3,
    elevation:     2,
  },
  md: {
    shadowColor:   COLORS.shadow,
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius:  10,
    elevation:     4,
  },
  lg: {
    shadowColor:   COLORS.shadowStrong,
    shadowOffset:  { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius:  20,
    elevation:     8,
  },
  glow: {
    shadowColor:   COLORS.primary,
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius:  12,
    elevation:     6,
  },
} as const;

// ─── Animation ───────────────────────────────────────────────────────

export const ANIMATION = {
  duration: {
    fast:    150,
    normal:  300,
    slow:    500,
    slower:  800,
  },
  spring: {
    gentle:  { tension: 60,  friction: 10 },
    default: { tension: 100, friction: 12 },
    bouncy:  { tension: 150, friction: 8  },
  },
} as const;
