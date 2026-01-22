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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useLanguage } from '../i18n';
import { useProfile } from '../context/ProfileContext';
import { useSafety } from '../context/SafetyContext';
import { useRoutine } from '../context/RoutineContext';

interface HomeScreenProps {
  navigation: any;
}

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { t, language, setLanguage } = useLanguage();
  const { currentProfile, logout } = useProfile();
  const { safetyProfile, isOutsideHome, distanceFromHome, getDirectionsToHome } = useSafety();
  const { todayRoutines, isCompletedToday } = useRoutine();

  const visualCards = currentProfile?.cards.filter(c => c.type === 'visual') || [];
  const audioCards = currentProfile?.cards.filter(c => c.type === 'audio') || [];

  // Rutin istatistikleri
  const completedRoutines = todayRoutines.filter(r => isCompletedToday(r.id)).length;
  const totalRoutines = todayRoutines.length;
  const nextRoutine = todayRoutines.find(r => !isCompletedToday(r.id));

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

  const formatDistance = (meters: number | null) => {
    if (meters === null) return '';
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
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

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Safety Alert Banner */}
        {safetyProfile?.homeLocation && isOutsideHome && (
          <TouchableOpacity 
            style={styles.safetyBanner}
            onPress={getDirectionsToHome}
          >
            <Ionicons name="home" size={28} color="#FF9800" style={{ marginRight: SPACING.md }} />
            <View style={styles.safetyInfo}>
              <Text style={styles.safetyTitle}>Evden Uzaktasınız</Text>
              <Text style={styles.safetySubtitle}>
                {safetyProfile.homeLocation.address}
              </Text>
            </View>
            <View style={styles.safetyAction}>
              <Text style={styles.safetyDistance}>{formatDistance(distanceFromHome)}</Text>
              <Text style={styles.safetyActionText}>Yol Tarifi →</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Routine Summary Card */}
        {totalRoutines > 0 && (
          <TouchableOpacity 
            style={styles.routineSummary}
            onPress={() => navigation.navigate('Routine')}
          >
            <View style={styles.routineHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="list" size={20} color={COLORS.primary} style={{ marginRight: SPACING.sm }} />
                <Text style={styles.routineTitle}>Bugünün Rutinleri</Text>
              </View>
              <Text style={styles.routineCount}>{completedRoutines}/{totalRoutines}</Text>
            </View>
            <View style={styles.routineProgressBar}>
              <View 
                style={[
                  styles.routineProgress, 
                  { width: `${totalRoutines > 0 ? (completedRoutines / totalRoutines) * 100 : 0}%` }
                ]} 
              />
            </View>
            {nextRoutine && (
              <View style={styles.nextRoutine}>
                <Text style={styles.nextRoutineLabel}>Sıradaki:</Text>
                <Text style={styles.nextRoutineText}>
                  {nextRoutine.title} - {nextRoutine.time}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}

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
              <Ionicons name="images-outline" size={32} color={COLORS.primary} />
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonTitle}>{t.whoIsThis}</Text>
              <Text style={styles.buttonDescription}>
                {t.familyAlbum} ({visualCards.length})
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gameButton, audioCards.length < 3 && styles.gameButtonDisabled]}
            onPress={handleAudioGame}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="volume-high-outline" size={32} color={COLORS.primary} />
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonTitle}>{t.whatSound}</Text>
              <Text style={styles.buttonDescription}>
                {t.soundMatch} ({audioCards.length})
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.textLight} />
          </TouchableOpacity>

          {/* Routine Button */}
          <TouchableOpacity
            style={styles.featureButton}
            onPress={() => navigation.navigate('Routine')}
          >
            <Ionicons name="time-outline" size={20} color={COLORS.textSecondary} style={{ marginRight: SPACING.sm }} />
            <Text style={styles.featureButtonText}>Günlük Rutin</Text>
            {totalRoutines > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalRoutines - completedRoutines}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Safety Button */}
          <TouchableOpacity
            style={styles.featureButton}
            onPress={() => navigation.navigate('Safety')}
          >
            <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.textSecondary} style={{ marginRight: SPACING.sm }} />
            <Text style={styles.featureButtonText}>
              {safetyProfile?.homeLocation ? 'Güvenlik' : 'Ev Konumu Ayarla'}
            </Text>
            {safetyProfile?.isMonitoringEnabled && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>Aktif</Text>
              </View>
            )}
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
      </ScrollView>
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
  scrollContent: {
    flex: 1,
  },
  safetyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#FFCC80',
  },
  safetyInfo: {
    flex: 1,
  },
  safetyTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
  },
  safetySubtitle: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  safetyAction: {
    alignItems: 'flex-end',
  },
  safetyDistance: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.primary,
  },
  safetyActionText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.primary,
  },
  routineSummary: {
    backgroundColor: COLORS.backgroundCard,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  routineTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
  },
  routineCount: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
  },
  routineProgressBar: {
    height: 6,
    backgroundColor: COLORS.backgroundMuted,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  routineProgress: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.full,
  },
  nextRoutine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  nextRoutineLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginRight: SPACING.xs,
  },
  nextRoutineText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  header: {
    alignItems: 'center',
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
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
    marginVertical: SPACING.md,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.light,
    color: COLORS.textMuted,
    letterSpacing: FONTS.letterSpacing.wide,
  },
  buttonContainer: {
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
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  buttonDescription: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.light,
    color: COLORS.textMuted,
  },
  featureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundCard,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  featureButtonText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
  },
  badge: {
    backgroundColor: COLORS.primary,
    paddingVertical: 2,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    marginLeft: SPACING.sm,
  },
  badgeText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textOnPrimary,
    fontWeight: FONTS.weights.bold,
  },
  activeBadge: {
    backgroundColor: '#4CAF50',
    paddingVertical: 2,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    marginLeft: SPACING.sm,
  },
  activeBadgeText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textOnPrimary,
    fontWeight: FONTS.weights.medium,
  },
  caregiverButton: {
    backgroundColor: COLORS.backgroundMuted,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  caregiverButtonText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
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
    fontStyle: 'italic',
  },
});
