/**
 * FloatingActionButton — Animated FAB with optional sub-actions
 *
 * Usage:
 *   <FloatingActionButton
 *     icon="add"
 *     actions={[
 *       { icon: 'camera', label: 'Photo', onPress: pickPhoto },
 *       { icon: 'mic',    label: 'Sound', onPress: recordAudio },
 *     ]}
 *   />
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  ANIMATION,
  TOUCH_TARGET,
} from '../constants/theme';

interface FABAction {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
}

interface FloatingActionButtonProps {
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  actions?: FABAction[];
  color?: string;
}

export function FloatingActionButton({
  icon = 'add',
  onPress,
  actions,
  color = COLORS.primary,
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnims = useRef(
    (actions ?? []).map(() => new Animated.Value(0)),
  ).current;

  const toggle = () => {
    const willOpen = !isOpen;
    setIsOpen(willOpen);

    Animated.spring(rotateAnim, {
      toValue: willOpen ? 1 : 0,
      ...ANIMATION.spring.default,
      useNativeDriver: true,
    }).start();

    scaleAnims.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: willOpen ? 1 : 0,
        ...ANIMATION.spring.gentle,
        useNativeDriver: true,
        delay: willOpen ? index * 60 : 0,
      }).start();
    });
  };

  const handleMainPress = () => {
    if (actions && actions.length > 0) {
      toggle();
    } else if (onPress) {
      onPress();
    }
  };

  const handleActionPress = (action: FABAction) => {
    toggle();
    // Small delay so close animation starts visually before navigation
    setTimeout(action.onPress, 100);
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      {/* Overlay to close on tap-outside */}
      {isOpen && (
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={toggle}
        />
      )}

      {/* Sub-actions */}
      {actions?.map((action, index) => {
        const translateY = scaleAnims[index].interpolate({
          inputRange: [0, 1],
          outputRange: [0, -(64 * (index + 1))],
        });

        return (
          <Animated.View
            key={action.label}
            style={[
              styles.subActionRow,
              {
                opacity: scaleAnims[index],
                transform: [
                  { translateY },
                  { scale: scaleAnims[index] },
                ],
              },
            ]}
          >
            <View style={styles.subLabel}>
              <Text style={styles.subLabelText}>{action.label}</Text>
            </View>
            <TouchableOpacity
              style={[styles.subButton, { backgroundColor: action.color ?? color }]}
              onPress={() => handleActionPress(action)}
              activeOpacity={0.8}
            >
              <Ionicons name={action.icon} size={20} color={COLORS.textOnPrimary} />
            </TouchableOpacity>
          </Animated.View>
        );
      })}

      {/* Main FAB */}
      <TouchableOpacity
        style={[styles.mainButton, { backgroundColor: color }, SHADOWS.glow]}
        onPress={handleMainPress}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Action button"
      >
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Ionicons name={icon} size={28} color={COLORS.textOnPrimary} />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.lg,
    alignItems: 'center',
  },
  mainButton: {
    width: TOUCH_TARGET.largeButtonHeight,
    height: TOUCH_TARGET.largeButtonHeight,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subActionRow: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subButton: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  subLabel: {
    backgroundColor: COLORS.backgroundCard,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.sm,
    ...SHADOWS.sm,
  },
  subLabelText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
  },
});
