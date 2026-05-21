/**
 * AnimatedSplashScreen — Custom intro screen for Memento
 * Ultra-minimalist, premium design with a breathing logo and cinematic layout.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';

const { width, height } = Dimensions.get('window');

interface AnimatedSplashScreenProps {
  onFinish: () => void;
}

export function AnimatedSplashScreen({ onFinish }: AnimatedSplashScreenProps) {
  // Ultra-minimalist animation values
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Logo breathing and fading in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 3000, // Slow cinematic zoom
        useNativeDriver: true,
      })
    ]).start();

    // 2. Text fades in after a short delay
    Animated.sequence([
      Animated.delay(1000),
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.delay(1500), // Hold
      // 3. Fade everything out smoothly
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        Animated.timing(textFadeAnim, { toValue: 0, duration: 800, useNativeDriver: true })
      ])
    ]).start(() => onFinish());
  }, []);

  return (
    <View style={styles.container}>
      {/* TOP: Brand Name */}
      <Animated.View style={[styles.header, { opacity: textFadeAnim }]}>
        <Text style={styles.brandText}>M E M E N T O</Text>
      </Animated.View>

      {/* CENTER: Breathing Logo */}
      <Animated.View 
        style={[
          styles.logoWrapper, 
          { 
            opacity: fadeAnim, 
            transform: [{ scale: scaleAnim }] 
          }
        ]}
      >
        <Image 
          source={require('../../assets/icon_transparent.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />
      </Animated.View>

      {/* BOTTOM: Elegant Quote */}
      <Animated.View style={[styles.footer, { opacity: textFadeAnim }]}>
        <View style={styles.divider} />
        <Text style={styles.quote}>
          SEVGİYLE HATIRLANAN{"\n"}HER ŞEY ÖLÜMSÜZDÜR
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // Solid, clean, warm background
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: height * 0.1,
  },
  header: {
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  brandText: {
    fontSize: 16,
    color: COLORS.primary,
    letterSpacing: 8,
    fontWeight: '600',
  },
  logoWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 220,
    height: 220,
  },
  footer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  divider: {
    width: 30,
    height: 1,
    backgroundColor: COLORS.primaryLight,
    marginBottom: SPACING.lg,
  },
  quote: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    letterSpacing: 4,
    lineHeight: 24,
    fontWeight: '500',
  },
});
