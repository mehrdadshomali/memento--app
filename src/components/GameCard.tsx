/**
 * GameCard — Memory card display
 * Shows a photo or audio card with image, play button, and hint.
 *
 * Features:
 *  - Skeleton shimmer while image loads
 *  - Pulsing audio play button
 *  - Slide-in hint reveal
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, ANIMATION } from '../constants/theme';
import { useLanguage } from '../i18n';
import { MemoryCard } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - SPACING.xl * 2;
const IMAGE_HEIGHT = CARD_WIDTH * 0.72;

interface GameCardProps {
  card: MemoryCard;
  onPlayAudio?: () => void;
  showHint?: boolean;
  isPlayingAudio?: boolean;
}

export function GameCard({
  card,
  onPlayAudio,
  showHint = false,
  isPlayingAudio = false,
}: GameCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const { t } = useLanguage();

  const entranceAnim = useRef(new Animated.Value(0)).current;
  const hintAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  // Card entrance
  useEffect(() => {
    entranceAnim.setValue(0);
    Animated.spring(entranceAnim, {
      toValue: 1,
      ...ANIMATION.spring.gentle,
      useNativeDriver: true,
    }).start();
  }, [card.id, entranceAnim]);

  // Hint slide-in
  useEffect(() => {
    Animated.timing(hintAnim, {
      toValue: showHint && card.hint ? 1 : 0,
      duration: ANIMATION.duration.normal,
      useNativeDriver: true,
    }).start();
  }, [showHint, card.hint, hintAnim]);

  // Pulse for audio play
  useEffect(() => {
    if (isPlayingAudio) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }
    pulseAnim.setValue(1);
  }, [isPlayingAudio, pulseAnim]);

  // Shimmer loop while loading
  useEffect(() => {
    if (imageLoading) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
          Animated.timing(shimmerAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }
  }, [imageLoading, shimmerAnim]);

  const isAudioCard = card.type === 'audio';

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  const hintTranslateY = hintAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
  });

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity: entranceAnim,
          transform: [{ scale: entranceAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }],
        },
      ]}
    >
      <View style={styles.card}>
        {/* Image Area */}
        <View style={styles.imageContainer}>
          {imageLoading && !imageError && (
            <Animated.View style={[styles.shimmer, { opacity: shimmerOpacity }]} />
          )}

          {imageError ? (
            <View style={styles.errorBox}>
              <Ionicons name="image-outline" size={44} color={COLORS.textLight} />
              <Text style={styles.errorText}>{t.imageNotAvailable}</Text>
            </View>
          ) : (
            <Image
              source={{ uri: card.imageUri }}
              style={styles.image}
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => { setImageError(true); setImageLoading(false); }}
              resizeMode="cover"
            />
          )}
        </View>

        {/* Action Area */}
        <View style={styles.contentArea}>
          {/* Audio Play Button */}
          {isAudioCard && (
            <TouchableOpacity
              style={[styles.audioRow, isPlayingAudio && styles.audioRowPlaying]}
              onPress={onPlayAudio}
              disabled={isPlayingAudio}
              activeOpacity={0.8}
              accessibilityLabel={isPlayingAudio ? t.soundPlaying : t.tapToHearSound}
            >
              <Animated.View
                style={[
                  styles.audioIcon,
                  isPlayingAudio && styles.audioIconPlaying,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                {isPlayingAudio ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <Ionicons name="volume-medium" size={20} color={COLORS.textOnPrimary} />
                )}
              </Animated.View>

              <View style={styles.audioText}>
                <Text style={[styles.audioTitle, isPlayingAudio && styles.audioTitleActive]}>
                  {isPlayingAudio ? t.soundPlaying : t.tapToHearSound}
                </Text>
                {!isPlayingAudio && (
                  <Text style={styles.audioSubtitle}>{t.tapToHearAgain}</Text>
                )}
              </View>

              {isPlayingAudio && (
                <View style={styles.waveform}>
                  {[10, 16, 8, 14, 12].map((h, i) => (
                    <View key={i} style={[styles.waveBar, { height: h }]} />
                  ))}
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* Hint */}
          {card.hint && (
            <Animated.View
              style={[
                styles.hintBox,
                { opacity: hintAnim, transform: [{ translateY: hintTranslateY }] },
              ]}
              pointerEvents={showHint ? 'auto' : 'none'}
            >
              <View style={styles.hintHeader}>
                <Ionicons name="bulb-outline" size={14} color={COLORS.primary} style={{ marginRight: 6 }} />
                <Text style={styles.hintLabel}>{t.hint}</Text>
              </View>
              <Text style={styles.hintText}>{card.hint}</Text>
            </Animated.View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.xxl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
    ...SHADOWS.md,
  },

  /* Image */
  imageContainer: {
    width: '100%',
    height: IMAGE_HEIGHT,
    backgroundColor: COLORS.backgroundMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.backgroundMuted,
  },
  errorBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: SPACING.sm,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
  },

  /* Content */
  contentArea: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },

  /* Audio */
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  audioRowPlaying: {
    backgroundColor: COLORS.primaryMuted,
  },
  audioIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  audioIconPlaying: {
    backgroundColor: COLORS.backgroundCard,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  audioText: {
    flex: 1,
  },
  audioTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
  },
  audioTitleActive: {
    color: COLORS.primaryDark,
  },
  audioSubtitle: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 20,
    marginLeft: SPACING.sm,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },

  /* Hint */
  hintBox: {
    margin: SPACING.md,
    marginTop: 0,
    padding: SPACING.md,
    backgroundColor: COLORS.primaryMuted,
    borderRadius: BORDER_RADIUS.lg,
  },
  hintHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  hintLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: FONTS.letterSpacing.wider,
  },
  hintText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textPrimary,
    lineHeight: FONTS.sizes.sm * FONTS.lineHeight.relaxed,
  },
});
