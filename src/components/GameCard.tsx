/**
 * MemoBridge - GameCard Component
 * Bohem tasarım - minimal ve zarif
 */

import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useLanguage } from '../i18n';
import { MemoryCard } from '../types';

const { width } = Dimensions.get('window');
const CARD_SIZE = width - SPACING.xl * 2;

interface GameCardProps {
  card: MemoryCard;
  onPlayAudio?: () => void;
  showHint?: boolean;
}

export function GameCard({ card, onPlayAudio, showHint = false }: GameCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const { t } = useLanguage();

  const isAudioCard = card.type === 'audio';

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Image Display */}
        <View style={styles.imageContainer}>
          {imageLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>{t.loading}</Text>
            </View>
          )}
          
          {imageError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>○</Text>
              <Text style={styles.errorText}>{t.imageNotAvailable}</Text>
            </View>
          ) : (
            <Image
              source={{ uri: card.imageUri }}
              style={styles.image}
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
              resizeMode="cover"
              accessible={true}
              accessibilityLabel={`Image for ${card.correctLabel}`}
            />
          )}
        </View>

        {/* Audio Play Button */}
        {isAudioCard && (
          <TouchableOpacity
            style={styles.audioButton}
            onPress={onPlayAudio}
            accessible={true}
            accessibilityLabel={t.playSound}
            accessibilityHint={t.tapToHearAgain}
            accessibilityRole="button"
          >
            <View style={styles.audioIconContainer}>
              <Text style={styles.audioIcon}>◉</Text>
            </View>
            <Text style={styles.audioText}>{t.tapToHearSound}</Text>
          </TouchableOpacity>
        )}

        {/* Hint Display */}
        {showHint && card.hint && (
          <View style={styles.hintContainer}>
            <Text style={styles.hintLabel}>{t.hint}</Text>
            <Text style={styles.hintText}>{card.hint}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  card: {
    width: CARD_SIZE,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.md,
  },
  imageContainer: {
    width: '100%',
    height: CARD_SIZE * 0.7,
    backgroundColor: COLORS.backgroundMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundMuted,
  },
  loadingText: {
    marginTop: SPACING.sm,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    fontWeight: FONTS.weights.light,
    letterSpacing: FONTS.letterSpacing.wide,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorIcon: {
    fontSize: 48,
    color: COLORS.textLight,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontWeight: FONTS.weights.light,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundMuted,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  audioIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  audioIcon: {
    fontSize: 20,
    color: COLORS.textOnPrimary,
  },
  audioText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
    letterSpacing: FONTS.letterSpacing.normal,
  },
  hintContainer: {
    backgroundColor: COLORS.warmLight,
    padding: SPACING.md,
    margin: SPACING.md,
    marginTop: 0,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warm,
  },
  hintLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: FONTS.letterSpacing.wider,
  },
  hintText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weights.light,
  },
});
