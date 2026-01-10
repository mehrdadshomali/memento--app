/**
 * Memento - HomeScreen
 * Bohem, sade ve profesyonel tasarım
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useLanguage } from '../i18n';
import { useProfile } from '../context/ProfileContext';

interface HomeScreenProps {
  navigation: any;
}

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { t, language, setLanguage } = useLanguage();
  const { currentProfile, logout } = useProfile();

  const visualCards = currentProfile?.cards.filter(c => c.type === 'visual') || [];
  const audioCards = currentProfile?.cards.filter(c => c.type === 'audio') || [];

  const handleVisualGame = () => {
    if (visualCards.length < 3) {
      Alert.alert(t.needMoreCards, t.minCardsRequired);
      return;
    }
    navigation.navigate('Game', { gameType: 'visual' });
  };

  const handleAudioGame = () => {
    if (audioCards.length < 3) {
      Alert.alert(t.needMoreCards, t.minCardsRequired);
      return;
    }
    navigation.navigate('Game', { gameType: 'audio' });
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'tr' : 'en');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.profileButton} onPress={logout}>
          <View style={styles.profileAvatar}>
            <Text style={styles.avatarText}>
              {currentProfile?.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.profileName}>{currentProfile?.name}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.languageButton} onPress={toggleLanguage}>
          <Text style={styles.languageText}>
            {language === 'en' ? 'EN' : 'TR'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t.appName}</Text>
        <View style={styles.divider} />
        <Text style={styles.subtitle}>{t.homeSubtitle}</Text>
      </View>

      {/* Game Mode Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.gameButton, visualCards.length < 3 && styles.gameButtonDisabled]}
          onPress={handleVisualGame}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.buttonIcon}>◐</Text>
          </View>
          <View style={styles.buttonTextContainer}>
            <Text style={styles.buttonTitle}>{t.whoIsThis}</Text>
            <Text style={styles.buttonDescription}>
              {t.familyAlbum} ({visualCards.length})
            </Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.gameButton, audioCards.length < 3 && styles.gameButtonDisabled]}
          onPress={handleAudioGame}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.buttonIcon}>◎</Text>
          </View>
          <View style={styles.buttonTextContainer}>
            <Text style={styles.buttonTitle}>{t.whatSound}</Text>
            <Text style={styles.buttonDescription}>
              {t.soundMatch} ({audioCards.length})
            </Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>

        {/* Caregiver Mode Button */}
        <TouchableOpacity
          style={styles.caregiverButton}
          onPress={() => navigation.navigate('Caregiver')}
        >
          <Text style={styles.caregiverButtonText}>{t.caregiverMode}</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLine} />
        <Text style={styles.footerText}>{t.takeYourTime}</Text>
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
    paddingTop: SPACING.md,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.sm,
  },
  profileAvatar: {
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  avatarText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textOnPrimary,
  },
  profileName: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  languageButton: {
    backgroundColor: COLORS.backgroundCard,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.sm,
  },
  languageText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
    letterSpacing: FONTS.letterSpacing.wider,
  },
  header: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.xl,
  },
  title: {
    fontSize: FONTS.sizes.title,
    fontWeight: FONTS.weights.light,
    color: COLORS.textPrimary,
    letterSpacing: FONTS.letterSpacing.widest,
    textTransform: 'uppercase',
  },
  divider: {
    width: 40,
    height: 1,
    backgroundColor: COLORS.primary,
    marginVertical: SPACING.lg,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.light,
    color: COLORS.textMuted,
    letterSpacing: FONTS.letterSpacing.wide,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  gameButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  gameButtonDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.backgroundMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  buttonIcon: {
    fontSize: 28,
    color: COLORS.primary,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    letterSpacing: FONTS.letterSpacing.normal,
  },
  buttonDescription: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.light,
    color: COLORS.textMuted,
    letterSpacing: FONTS.letterSpacing.wide,
  },
  arrow: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.textLight,
    fontWeight: FONTS.weights.light,
  },
  caregiverButton: {
    backgroundColor: COLORS.backgroundMuted,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  caregiverButtonText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    letterSpacing: FONTS.letterSpacing.wide,
  },
  footer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  footerLine: {
    width: 24,
    height: 1,
    backgroundColor: COLORS.borderDark,
    marginBottom: SPACING.md,
  },
  footerText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    fontWeight: FONTS.weights.light,
    letterSpacing: FONTS.letterSpacing.wide,
    fontStyle: 'italic',
  },
});
