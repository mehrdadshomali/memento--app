/**
 * ProgressRing — Circular progress indicator
 * Built with Animated API and View-based arcs (no react-native-svg).
 *
 * Renders a ring using a clever two-half technique.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, FONTS, ANIMATION } from '../constants/theme';

interface ProgressRingProps {
  /** 0–100 */
  progress: number;
  /** Outer diameter in dp */
  size?: number;
  /** Ring thickness in dp */
  strokeWidth?: number;
  /** Track (background ring) color */
  trackColor?: string;
  /** Fill color */
  fillColor?: string;
  /** Center label (e.g. "75%") */
  label?: string;
  /** Smaller text below the label */
  sublabel?: string;
}

export function ProgressRing({
  progress,
  size = 100,
  strokeWidth = 8,
  trackColor = COLORS.backgroundMuted,
  fillColor = COLORS.primary,
  label,
  sublabel,
}: ProgressRingProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const clampedProgress = Math.min(100, Math.max(0, progress));

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: clampedProgress,
      duration: ANIMATION.duration.slow,
      useNativeDriver: false, // rotation interpolation needs JS driver
    }).start();
  }, [clampedProgress, animatedValue]);

  const radius = size / 2;
  const innerSize = size - strokeWidth * 2;

  // Rotation for the first half (0–180°)
  const firstHalfRotation = animatedValue.interpolate({
    inputRange: [0, 50, 100],
    outputRange: ['0deg', '180deg', '180deg'],
    extrapolate: 'clamp',
  });

  // Rotation for the second half (180–360°)
  const secondHalfRotation = animatedValue.interpolate({
    inputRange: [0, 50, 100],
    outputRange: ['0deg', '0deg', '180deg'],
    extrapolate: 'clamp',
  });

  // Second half opacity (hidden until >50%)
  const secondHalfOpacity = animatedValue.interpolate({
    inputRange: [0, 49.9, 50, 100],
    outputRange: [0, 0, 1, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background track */}
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: radius,
            borderWidth: strokeWidth,
            borderColor: trackColor,
          },
        ]}
      />

      {/* First half (0–50%) */}
      <View style={[styles.halfClip, { width: radius, height: size, left: radius }]}>
        <Animated.View
          style={[
            styles.halfRing,
            {
              width: size,
              height: size,
              borderRadius: radius,
              borderWidth: strokeWidth,
              borderColor: fillColor,
              left: -radius,
              transform: [{ rotate: firstHalfRotation }],
            },
          ]}
        />
      </View>

      {/* Second half (50–100%) */}
      <Animated.View
        style={[
          styles.halfClip,
          { width: radius, height: size, left: 0, opacity: secondHalfOpacity },
        ]}
      >
        <Animated.View
          style={[
            styles.halfRing,
            {
              width: size,
              height: size,
              borderRadius: radius,
              borderWidth: strokeWidth,
              borderColor: fillColor,
              left: radius,
              transform: [{ rotate: secondHalfRotation }],
            },
          ]}
        />
      </Animated.View>

      {/* Center label */}
      <View style={[styles.center, { width: innerSize, height: innerSize, borderRadius: innerSize / 2 }]}>
        {label !== undefined && (
          <Text style={styles.label}>{label}</Text>
        )}
        {sublabel !== undefined && (
          <Text style={styles.sublabel}>{sublabel}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
  },
  halfClip: {
    position: 'absolute',
    top: 0,
    overflow: 'hidden',
  },
  halfRing: {
    position: 'absolute',
    top: 0,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  center: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
  },
  label: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  sublabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginTop: 1,
  },
});
