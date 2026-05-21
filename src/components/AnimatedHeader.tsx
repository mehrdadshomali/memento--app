/**
 * AnimatedHeader — Consistent top navigation bar
 * Used across all screens for unified look & feel.
 *
 * Features:
 *  - Fade-in on mount
 *  - Optional back button, title, right action
 *  - Glass-tinted background option
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, ANIMATION, TOUCH_TARGET } from '../constants/theme';

interface AnimatedHeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
  transparent?: boolean;
}

export function AnimatedHeader({
  title,
  onBack,
  rightAction,
  style,
  transparent = false,
}: AnimatedHeaderProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: ANIMATION.duration.normal,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: ANIMATION.duration.normal,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        transparent && styles.containerTransparent,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        style,
      ]}
    >
      {/* Left — Back button or spacer */}
      {onBack ? (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}

      {/* Center — Title */}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {/* Right — Custom action or spacer */}
      {rightAction ?? <View style={styles.spacer} />}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: COLORS.background,
  },
  containerTransparent: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  iconButton: {
    width: TOUCH_TARGET.iconButton,
    height: TOUCH_TARGET.iconButton,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.backgroundMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
    letterSpacing: FONTS.letterSpacing.wide,
    marginHorizontal: SPACING.sm,
  },
  spacer: {
    width: TOUCH_TARGET.iconButton,
  },
});
