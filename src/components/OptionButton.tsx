/**
 * OptionButton — Answer choice button for memory games
 *
 * States: default → correct (green glow) | fadeOut (dimmed shake)
 *
 * Features:
 *  - Spring-scale on correct answer
 *  - Gentle shake + fade on wrong answer
 *  - Large touch target (72px min height)
 */

import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, ANIMATION, TOUCH_TARGET } from '../constants/theme';

type ButtonState = 'default' | 'correct' | 'fadeOut' | 'disabled';

interface OptionButtonProps {
  label: string;
  onPress: () => void;
  state?: ButtonState;
  disabled?: boolean;
}

export function OptionButton({
  label,
  onPress,
  state = 'default',
  disabled = false,
}: OptionButtonProps) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (state === 'fadeOut') {
      // Gentle shake then fade
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 8, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 4, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
      Animated.timing(fadeAnim, {
        toValue: 0.35,
        duration: ANIMATION.duration.normal,
        useNativeDriver: true,
        delay: 200,
      }).start();
    } else if (state === 'correct') {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.03,
          ...ANIMATION.spring.bouncy,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          ...ANIMATION.spring.gentle,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset all
      fadeAnim.setValue(1);
      scaleAnim.setValue(1);
      shakeAnim.setValue(0);
    }
  }, [state, fadeAnim, scaleAnim, shakeAnim]);

  const buttonStyle = stateStyles[state] ?? stateStyles.default;
  const textStyle = textStyles[state] ?? textStyles.default;
  const isDisabled = disabled || state === 'fadeOut' || state === 'disabled';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { translateX: shakeAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.button, buttonStyle]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`${label}. ${state === 'correct' ? 'Correct' : ''}`}
      >
        <Text style={[styles.label, textStyle]} numberOfLines={2}>
          {label}
        </Text>

        {state === 'correct' && (
          <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
        )}
        {state === 'fadeOut' && (
          <Ionicons name="close-circle" size={24} color={COLORS.textLight} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

/* ── State-dependent style maps ──────────────────────────────── */

const stateStyles: Record<ButtonState, ViewStyle> = {
  default: {
    borderColor: COLORS.border,
    backgroundColor: COLORS.backgroundCard,
  },
  correct: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.successLight,
    ...SHADOWS.sm,
  },
  fadeOut: {
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.backgroundMuted,
  },
  disabled: {
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.backgroundMuted,
  },
};

const textStyles: Record<ButtonState, { color: string }> = {
  default:  { color: COLORS.textPrimary },
  correct:  { color: COLORS.success },
  fadeOut:   { color: COLORS.textMuted },
  disabled: { color: COLORS.textLight },
};

/* ── Base styles ─────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.xs,
  },
  button: {
    minHeight: TOUCH_TARGET.largeButtonHeight,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    marginRight: SPACING.md,
  },
});
