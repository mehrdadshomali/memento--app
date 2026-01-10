/**
 * MemoBridge - Bohem Theme
 * Sade, huzurlu, beyaz-gri-açık kahve tonları
 * Profesyonel ve minimal tasarım
 */

export const COLORS = {
  // Primary - Sıcak kahve tonları
  primary: '#8B7355',        // Warm taupe
  primaryLight: '#A89078',   // Light taupe
  primaryDark: '#6B5344',    // Dark taupe
  
  // Accent - Soft sage/olive
  accent: '#9CAF88',         // Sage green
  accentLight: '#B8C9A3',    // Light sage
  
  // Success - Yumuşak yeşil
  success: '#8FA87A',
  successLight: '#A8BF96',
  
  // Warm tones
  warm: '#C4A77D',           // Warm sand
  warmLight: '#D4BC9A',      // Light sand
  
  // Backgrounds - Krem ve beyaz tonları
  background: '#FDFCFA',     // Off-white cream
  backgroundSecondary: '#F7F5F2', // Light cream
  backgroundCard: '#F2EDE7',     // Warm gray cream
  backgroundMuted: '#EBE6DF',    // Muted cream
  
  // Text - Yumuşak kontrastlar
  textPrimary: '#3D3630',    // Warm dark brown
  textSecondary: '#6B635A',  // Medium brown gray
  textMuted: '#9A928A',      // Muted brown
  textLight: '#B8B0A8',      // Light brown gray
  textOnPrimary: '#FDFCFA',  // Cream white
  
  // Borders - Soft lines
  border: '#D9D2C9',         // Warm gray border
  borderLight: '#E8E3DC',    // Light warm border
  borderDark: '#C4BAB0',     // Darker border
  
  // Overlay
  overlay: 'rgba(61, 54, 48, 0.4)',
  
  // Shadows
  shadow: 'rgba(107, 83, 68, 0.08)',
};

export const FONTS = {
  // Extra large fonts for elderly users
  sizes: {
    xs: 14,
    sm: 16,
    md: 20,
    lg: 26,
    xl: 34,
    xxl: 44,
    title: 52,
  },
  weights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  // Letter spacing for elegance
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
  full: 9999,
};

// Minimum touch target size for accessibility
export const TOUCH_TARGET = {
  minHeight: 56,
  minWidth: 56,
  buttonHeight: 72,
  largeButtonHeight: 100,
};

// Shadows for depth
export const SHADOWS = {
  sm: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
};
