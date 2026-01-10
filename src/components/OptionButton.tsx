/**
 * MemoBridge - OptionButton Component
 * Bohem tasarım - zarif ve minimal butonlar
 */

import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

type ButtonState = 'default' | 'correct' | 'fadeOut' | 'disabled';

interface OptionButtonProps {
  label: string;
  onPress: () => void;
  state?: ButtonState;
  disabled?: boolean;
  accessibilityHint?: string;
}

export function OptionButton({
  label,
  onPress,
  state = 'default',
  disabled = false,
  accessibilityHint,
}: OptionButtonProps) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (state === 'fadeOut') {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0.35,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.98,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (state === 'correct') {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.02,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(1);
      scaleAnim.setValue(1);
    }
  }, [state, fadeAnim, scaleAnim]);

  const getButtonStyle = (): ViewStyle => {
    switch (state) {
      case 'correct':
        return styles.buttonCorrect;
      case 'fadeOut':
        return styles.buttonFaded;
      case 'disabled':
        return styles.buttonDisabled;
      default:
        return styles.buttonDefault;
    }
  };

  const getTextStyle = () => {
    switch (state) {
      case 'correct':
        return styles.textCorrect;
      case 'fadeOut':
        return styles.textFaded;
      case 'disabled':
        return styles.textDisabled;
      default:
        return styles.textDefault;
    }
  };

  const isDisabled = disabled || state === 'fadeOut' || state === 'disabled';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.button, getButtonStyle()]}
        onPress={onPress}
        disabled={isDisabled}
        accessible={true}
        accessibilityLabel={label}
        accessibilityHint={accessibilityHint || `Select ${label} as your answer`}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
      >
        <Text style={[styles.text, getTextStyle()]} numberOfLines={2}>
          {label}
        </Text>
        {state === 'correct' && (
          <Text style={styles.checkmark}>✓</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.xs,
  },
  button: {
    minHeight: 64,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  buttonDefault: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
  },
  buttonCorrect: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  buttonFaded: {
    backgroundColor: COLORS.backgroundMuted,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonDisabled: {
    backgroundColor: COLORS.backgroundMuted,
    borderColor: COLORS.borderLight,
  },
  text: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    textAlign: 'center',
    flex: 1,
    letterSpacing: FONTS.letterSpacing.normal,
  },
  textDefault: {
    color: COLORS.textPrimary,
  },
  textCorrect: {
    color: COLORS.textOnPrimary,
  },
  textFaded: {
    color: COLORS.textLight,
  },
  textDisabled: {
    color: COLORS.textLight,
  },
  checkmark: {
    fontSize: 24,
    color: COLORS.textOnPrimary,
    marginLeft: SPACING.sm,
    fontWeight: FONTS.weights.light,
  },
});
