/**
 * GameCompleteScreen — Celebration screen after finishing a game
 *
 * Replaces the plain Alert with a full-screen celebration:
 *  - Animated confetti burst (emoji particles)
 *  - Score summary
 *  - Motivational message
 *  - Play again / Go home actions
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, ANIMATION, TOUCH_TARGET } from '../constants/theme';
import { useLanguage } from '../i18n';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CONFETTI_COUNT = 12;

interface GameCompleteScreenProps {
  navigation: any;
  route: {
    params: {
      correctAnswers: number;
      totalCards: number;
      gameType: 'visual' | 'audio';
      onPlayAgain: () => void;
    };
  };
}

export function GameCompleteScreen({ navigation, route }: GameCompleteScreenProps) {
  const { correctAnswers, totalCards, gameType } = route.params;
  const { language } = useLanguage();

  const heroScale = useRef(new Animated.Value(0)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const buttonSlide = useRef(new Animated.Value(40)).current;
  const confettiAnims = useRef(
    Array.from({ length: CONFETTI_COUNT }, () => ({
      translateY: new Animated.Value(-40),
      translateX: new Animated.Value(0),
      opacity: new Animated.Value(1),
      rotate: new Animated.Value(0),
    })),
  ).current;

  useEffect(() => {
    // Stagger entrance
    Animated.sequence([
      // Hero emoji bounce
      Animated.spring(heroScale, {
        toValue: 1,
        ...ANIMATION.spring.bouncy,
        useNativeDriver: true,
      }),
      // Text fade in
      Animated.timing(textFade, {
        toValue: 1,
        duration: ANIMATION.duration.normal,
        useNativeDriver: true,
      }),
      // Buttons slide up
      Animated.spring(buttonSlide, {
        toValue: 0,
        ...ANIMATION.spring.gentle,
        useNativeDriver: true,
      }),
    ]).start();

    // Confetti burst
    confettiAnims.forEach((anim, i) => {
      const randomX = (Math.random() - 0.5) * SCREEN_WIDTH * 0.8;
      const randomDelay = Math.random() * 300;

      Animated.parallel([
        Animated.timing(anim.translateY, {
          toValue: SCREEN_HEIGHT * 0.6,
          duration: 2000 + Math.random() * 1000,
          delay: randomDelay,
          useNativeDriver: true,
        }),
        Animated.timing(anim.translateX, {
          toValue: randomX,
          duration: 2000 + Math.random() * 1000,
          delay: randomDelay,
          useNativeDriver: true,
        }),
        Animated.timing(anim.opacity, {
          toValue: 0,
          duration: 2500,
          delay: randomDelay + 500,
          useNativeDriver: true,
        }),
        Animated.timing(anim.rotate, {
          toValue: Math.random() * 4 - 2,
          duration: 2000,
          delay: randomDelay,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [heroScale, textFade, buttonSlide, confettiAnims]);

  const confettiEmojis = ['🎉', '⭐', '✨', '💛', '🌸', '🎊'];
  const scorePercent = totalCards > 0 ? Math.round((correctAnswers / totalCards) * 100) : 0;

  const getMessage = () => {
    if (scorePercent === 100) return language === 'tr' ? 'Mükemmel!' : 'Perfect!';
    if (scorePercent >= 75) return language === 'tr' ? 'Harika İş!' : 'Great Job!';
    return language === 'tr' ? 'İyi Gidiyorsunuz!' : 'Well Done!';
  };

  const getSubMessage = () => {
    if (language === 'tr') {
      return `${correctAnswers} karttan ${totalCards} tanesini doğru bildiniz.\nHer gün biraz daha güçlenirsiniz!`;
    }
    return `You got ${correctAnswers} out of ${totalCards} correct.\nYou get stronger every day!`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Confetti particles */}
      {confettiAnims.map((anim, i) => (
        <Animated.Text
          key={i}
          style={[
            styles.confetti,
            {
              left: SCREEN_WIDTH / 2 - 12,
              top: SCREEN_HEIGHT * 0.2,
              opacity: anim.opacity,
              transform: [
                { translateX: anim.translateX },
                { translateY: anim.translateY },
                { rotate: anim.rotate.interpolate({ inputRange: [-2, 2], outputRange: ['-120deg', '120deg'] }) },
              ],
            },
          ]}
        >
          {confettiEmojis[i % confettiEmojis.length]}
        </Animated.Text>
      ))}

      <View style={styles.content}>
        {/* Hero emoji */}
        <Animated.Text
          style={[styles.heroEmoji, { transform: [{ scale: heroScale }] }]}
        >
          🎉
        </Animated.Text>

        {/* Score */}
        <Animated.View style={[styles.textBlock, { opacity: textFade }]}>
          <Text style={styles.title}>{getMessage()}</Text>

          <View style={styles.scoreCard}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scorePercent}>{scorePercent}%</Text>
            </View>
            <View style={styles.scoreDetails}>
              <View style={styles.scoreRow}>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                <Text style={styles.scoreLabel}>
                  {language === 'tr' ? 'Doğru' : 'Correct'}: {correctAnswers}
                </Text>
              </View>
              <View style={styles.scoreRow}>
                <Ionicons name={gameType === 'visual' ? 'images-outline' : 'musical-notes-outline'} size={18} color={COLORS.textMuted} />
                <Text style={styles.scoreLabel}>
                  {language === 'tr' ? 'Toplam' : 'Total'}: {totalCards}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.subtitle}>{getSubMessage()}</Text>
        </Animated.View>

        {/* Actions */}
        <Animated.View
          style={[styles.actions, { transform: [{ translateY: buttonSlide }], opacity: textFade }]}
        >
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              navigation.goBack();
              route.params.onPlayAgain();
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="refresh" size={20} color={COLORS.textOnPrimary} style={{ marginRight: SPACING.sm }} />
            <Text style={styles.primaryButtonText}>
              {language === 'tr' ? 'Tekrar Oyna' : 'Play Again'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.8}
          >
            <Ionicons name="home-outline" size={20} color={COLORS.primary} style={{ marginRight: SPACING.sm }} />
            <Text style={styles.secondaryButtonText}>
              {language === 'tr' ? 'Ana Sayfa' : 'Go Home'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  confetti: {
    position: 'absolute',
    fontSize: 24,
    zIndex: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },

  heroEmoji: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },

  textBlock: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  scoreCircle: {
    width: 72,
    height: 72,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  scorePercent: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
  },
  scoreDetails: {
    gap: SPACING.sm,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  scoreLabel: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.medium,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: FONTS.sizes.md * FONTS.lineHeight.relaxed,
  },

  actions: {
    width: '100%',
    gap: SPACING.md,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    height: TOUCH_TARGET.buttonHeight,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.md,
  },
  primaryButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textOnPrimary,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundCard,
    height: TOUCH_TARGET.buttonHeight,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  secondaryButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.primary,
  },
});
