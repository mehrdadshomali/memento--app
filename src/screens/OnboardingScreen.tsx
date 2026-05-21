/**
 * OnboardingScreen — First-launch welcome flow
 *
 * Three pages with swipeable FlatList:
 *  1. Welcome — app introduction
 *  2. How it works — 3-step explanation
 *  3. Get started — CTA to create a profile
 *
 * Sets `onboardingCompleted` in AsyncStorage to skip on future launches.
 */

import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, TOUCH_TARGET } from '../constants/theme';
import { useLanguage } from '../i18n';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ONBOARDING_KEY = '@memento_onboarding_completed';

interface OnboardingScreenProps {
  onComplete: () => void;
}

interface OnboardingPage {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const pages: OnboardingPage[] = [
    { id: '1', icon: 'heart-outline', iconColor: COLORS.primary, iconBg: COLORS.primaryMuted },
    { id: '2', icon: 'bulb-outline', iconColor: COLORS.accent, iconBg: COLORS.accentMuted },
    { id: '3', icon: 'rocket-outline', iconColor: COLORS.primary, iconBg: COLORS.primaryMuted },
  ];

  const content = {
    tr: [
      {
        title: 'Memento\'ya\nHoş Geldiniz',
        subtitle: 'Sevdiklerinizle bağlantılarınızı güçlendiren, şefkatli bir hafıza egzersiz uygulaması.',
      },
      {
        title: 'Nasıl Çalışır?',
        subtitle: 'Bakıcılar fotoğraf ve ses ekler → Hasta tanıdık yüzleri ve sesleri eşleştirir → İlerleme takip edilir.',
      },
      {
        title: 'Hadi Başlayalım',
        subtitle: 'Bir profil oluşturarak sevdiklerinizin hafıza yolculuğuna destek olmaya başlayın.',
      },
    ],
    en: [
      {
        title: 'Welcome to\nMemento',
        subtitle: 'A compassionate memory exercise app that strengthens connections with loved ones.',
      },
      {
        title: 'How It Works',
        subtitle: 'Caregivers add photos & sounds → Patient matches familiar faces & voices → Progress is tracked.',
      },
      {
        title: "Let's Get Started",
        subtitle: 'Create a profile to begin supporting your loved one on their memory journey.',
      },
    ],
  };

  const texts = content[language] ?? content.en;

  const handleComplete = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch {
      // Non-critical — proceed anyway
    }
    onComplete();
  }, [onComplete]);

  const goToNext = () => {
    if (currentIndex < pages.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleComplete();
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false },
  );

  const handleMomentumEnd = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const renderPage = ({ item, index }: { item: OnboardingPage; index: number }) => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const iconScale = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: 'clamp',
    });

    const textOpacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
      extrapolate: 'clamp',
    });

    const textTranslateY = scrollX.interpolate({
      inputRange,
      outputRange: [30, 0, 30],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.page}>
        {/* Icon */}
        <Animated.View
          style={[
            styles.iconCircle,
            { backgroundColor: item.iconBg, transform: [{ scale: iconScale }] },
          ]}
        >
          <Ionicons name={item.icon} size={56} color={item.iconColor} />
        </Animated.View>

        {/* Text */}
        <Animated.View
          style={[
            styles.textBlock,
            { opacity: textOpacity, transform: [{ translateY: textTranslateY }] },
          ]}
        >
          <Text style={styles.pageTitle}>{texts[index].title}</Text>
          <Text style={styles.pageSubtitle}>{texts[index].subtitle}</Text>
        </Animated.View>

        {/* Step indicators for page 2 */}
        {index === 1 && (
          <Animated.View style={[styles.stepsContainer, { opacity: textOpacity }]}>
            {[
              { icon: 'camera-outline' as const, label: language === 'tr' ? 'Ekle' : 'Add' },
              { icon: 'game-controller-outline' as const, label: language === 'tr' ? 'Oyna' : 'Play' },
              { icon: 'analytics-outline' as const, label: language === 'tr' ? 'Takip' : 'Track' },
            ].map((step, i) => (
              <View key={step.label} style={styles.step}>
                <View style={styles.stepIcon}>
                  <Ionicons name={step.icon} size={22} color={COLORS.primary} />
                </View>
                <Text style={styles.stepLabel}>{step.label}</Text>
                {i < 2 && <View style={styles.stepConnector} />}
              </View>
            ))}
          </Animated.View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Skip */}
      <View style={styles.topBar}>
        <View style={styles.spacer} />
        {currentIndex < pages.length - 1 && (
          <TouchableOpacity onPress={handleComplete} activeOpacity={0.7}>
            <Text style={styles.skipText}>
              {language === 'tr' ? 'Atla' : 'Skip'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Pages */}
      <FlatList
        ref={flatListRef}
        data={pages}
        renderItem={renderPage}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumEnd}
        scrollEventThrottle={16}
      />

      {/* Bottom */}
      <View style={styles.bottom}>
        {/* Dots */}
        <View style={styles.dots}>
          {pages.map((_, index) => {
            const dotWidth = scrollX.interpolate({
              inputRange: [
                (index - 1) * SCREEN_WIDTH,
                index * SCREEN_WIDTH,
                (index + 1) * SCREEN_WIDTH,
              ],
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });

            const dotOpacity = scrollX.interpolate({
              inputRange: [
                (index - 1) * SCREEN_WIDTH,
                index * SCREEN_WIDTH,
                (index + 1) * SCREEN_WIDTH,
              ],
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  { width: dotWidth, opacity: dotOpacity },
                ]}
              />
            );
          })}
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={goToNext}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>
            {currentIndex === pages.length - 1
              ? (language === 'tr' ? 'Başla' : 'Get Started')
              : (language === 'tr' ? 'Devam' : 'Continue')}
          </Text>
          <Ionicons
            name={currentIndex === pages.length - 1 ? 'arrow-forward' : 'chevron-forward'}
            size={20}
            color={COLORS.textOnPrimary}
            style={{ marginLeft: SPACING.sm }}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  spacer: { width: 40 },
  skipText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textMuted,
    fontWeight: FONTS.weights.medium,
  },

  /* Page */
  page: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  textBlock: {
    alignItems: 'center',
    maxWidth: 320,
  },
  pageTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    letterSpacing: FONTS.letterSpacing.tight,
    marginBottom: SPACING.md,
    lineHeight: FONTS.sizes.xxl * FONTS.lineHeight.tight,
  },
  pageSubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: FONTS.sizes.md * FONTS.lineHeight.relaxed,
  },

  /* Steps */
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  step: {
    alignItems: 'center',
    position: 'relative',
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  stepLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
  },
  stepConnector: {
    position: 'absolute',
    top: 24,
    left: 48,
    width: 32,
    height: 2,
    backgroundColor: COLORS.borderLight,
  },

  /* Bottom */
  bottom: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.xs,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    width: '100%',
    height: TOUCH_TARGET.buttonHeight,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.md,
  },
  ctaText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textOnPrimary,
  },
});
