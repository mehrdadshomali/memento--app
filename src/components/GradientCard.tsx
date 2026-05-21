/**
 * GradientCard — Premium card with subtle gradient tint
 * Supports press animation, icon, title, subtitle, and chevron.
 *
 * Variants: compact | default | large
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, ANIMATION } from '../constants/theme';

type CardVariant = 'compact' | 'default' | 'large';

interface GradientCardProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBackground?: string;
  onPress?: () => void;
  variant?: CardVariant;
  showChevron?: boolean;
  badge?: React.ReactNode;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export function GradientCard({
  title,
  subtitle,
  icon,
  iconColor = COLORS.primary,
  iconBackground = COLORS.primaryMuted,
  onPress,
  variant = 'default',
  showChevron = true,
  badge,
  style,
  children,
}: GradientCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.975,
      ...ANIMATION.spring.gentle,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      ...ANIMATION.spring.default,
      useNativeDriver: true,
    }).start();
  };

  const iconSizes: Record<CardVariant, number> = {
    compact: 40,
    default: 52,
    large: 64,
  };

  const iconFontSizes: Record<CardVariant, number> = {
    compact: 20,
    default: 26,
    large: 30,
  };

  const content = (
    <>
      {/* Icon */}
      {icon && (
        <View
          style={[
            styles.iconContainer,
            {
              width: iconSizes[variant],
              height: iconSizes[variant],
              borderRadius: BORDER_RADIUS.lg,
              backgroundColor: iconBackground,
            },
          ]}
        >
          <Ionicons name={icon} size={iconFontSizes[variant]} color={iconColor} />
        </View>
      )}

      {/* Text */}
      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, variant === 'large' && styles.titleLarge]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {badge}
        </View>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        )}
        {children}
      </View>

      {/* Chevron */}
      {showChevron && onPress && (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={COLORS.textLight}
          style={styles.chevron}
        />
      )}
    </>
  );

  if (!onPress) {
    return (
      <View style={[styles.card, variantStyles[variant], style]}>
        {content}
      </View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.card, variantStyles[variant], style]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessibilityRole="button"
      >
        {content}
      </TouchableOpacity>
    </Animated.View>
  );
}

const variantStyles: Record<CardVariant, ViewStyle> = {
  compact: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md },
  default: { padding: SPACING.md },
  large:   { padding: SPACING.lg },
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  titleLarge: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
  },
  subtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: FONTS.sizes.sm * FONTS.lineHeight.normal,
  },
  chevron: {
    marginLeft: SPACING.sm,
  },
});
