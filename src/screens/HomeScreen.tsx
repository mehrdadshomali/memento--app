/**
 * HomeScreen — Main dashboard
 *
 * Features:
 *  - Time-of-day greeting
 *  - Routine progress ring
 *  - Activity cards with GradientCard
 *  - Settings access
 *  - Safety alert banner
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Animated,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GradientCard, ProgressRing } from '../components';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, ANIMATION, TOUCH_TARGET } from '../constants/theme';
import { useLanguage } from '../i18n';
import { useProfile } from '../context/ProfileContext';
import { useSafety } from '../context/SafetyContext';
import { useRoutine } from '../context/RoutineContext';

interface HomeScreenProps {
  navigation: any;
}

/** Returns a greeting based on current hour */
const getGreeting = (language: string): string => {
  const hour = new Date().getHours();
  if (language === 'tr') {
    if (hour < 6) return 'İyi geceler';
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi günler';
    return 'İyi akşamlar';
  }
  if (hour < 6) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { t, language, setLanguage } = useLanguage();
  const { currentProfile, logout } = useProfile();
  const { safetyProfile, isOutsideHome, distanceFromHome, getDirectionsToHome } = useSafety();
  const { todayRoutines, isCompletedToday } = useRoutine();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: ANIMATION.duration.slow,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const visualCards = currentProfile?.cards.filter(c => c.type === 'visual') || [];
  const audioCards = currentProfile?.cards.filter(c => c.type === 'audio') || [];

  const completedRoutines = todayRoutines.filter(r => isCompletedToday(r.id)).length;
  const totalRoutines = todayRoutines.length;
  const progressPercent = totalRoutines > 0 ? Math.round((completedRoutines / totalRoutines) * 100) : 0;
  const nextRoutine = todayRoutines.find(r => !isCompletedToday(r.id));

  const formatDistance = (meters: number | null): string => {
    if (meters === null) return '';
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const greeting = getGreeting(language);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.profilePill} onPress={logout} activeOpacity={0.8}>
            <View style={styles.profileAvatar}>
              <Text style={styles.avatarText}>{currentProfile?.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flexShrink: 1 }}>
              <Text style={styles.greetingLabel}>{greeting}</Text>
              <Text style={styles.profileName} numberOfLines={1}>{currentProfile?.name}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t.appName}</Text>
            <Text style={styles.headerSubtitle}>{t.homeSubtitle}</Text>
          </View>

          {/* Safety Alert */}
          {safetyProfile?.homeLocation && isOutsideHome && (
            <TouchableOpacity style={styles.alertBanner} onPress={getDirectionsToHome} activeOpacity={0.8}>
              <View style={styles.alertIconWrap}>
                <Ionicons name="warning-outline" size={22} color={COLORS.warning} />
              </View>
              <View style={styles.alertInfo}>
                <Text style={styles.alertTitle}>{t.awayFromHome}</Text>
                <Text style={styles.alertAddress} numberOfLines={1}>
                  {safetyProfile.homeLocation.address}
                </Text>
              </View>
              <View style={styles.alertRight}>
                <Text style={styles.alertDist}>{formatDistance(distanceFromHome)}</Text>
                <View style={styles.alertAction}>
                  <Text style={styles.alertActionText}>{t.getDirections}</Text>
                  <Ionicons name="arrow-forward" size={12} color={COLORS.primary} />
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* Routine Progress */}
          {totalRoutines > 0 && (
            <TouchableOpacity
              style={styles.routineCard}
              onPress={() => navigation.navigate('Routine')}
              activeOpacity={0.8}
            >
              <View style={styles.routineLeft}>
                <Text style={styles.routineTitle}>{t.dailyRoutine}</Text>
                {nextRoutine && (
                  <View style={styles.nextRow}>
                    <Ionicons name="time-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 4 }} />
                    <Text style={styles.nextLabel}>{t.nextRoutine}</Text>
                    <Text style={styles.nextValue}>{nextRoutine.title} ({nextRoutine.time})</Text>
                  </View>
                )}
                <Text style={styles.routineCount}>
                  {completedRoutines}/{totalRoutines} {language === 'tr' ? 'tamamlandı' : 'completed'}
                </Text>
              </View>
              <ProgressRing
                progress={progressPercent}
                size={64}
                strokeWidth={5}
                label={`${progressPercent}%`}
              />
            </TouchableOpacity>
          )}

          {/* Activities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {language === 'tr' ? 'AKTİVİTELER' : 'ACTIVITIES'}
            </Text>

            <GradientCard
              title={t.whoIsThis}
              subtitle={`${t.familyAlbum} • ${visualCards.length} ${language === 'tr' ? 'kart' : 'cards'}`}
              icon="images-outline"
              iconColor={COLORS.primary}
              iconBackground={COLORS.primaryMuted}
              onPress={() => navigation.navigate('FamilyAlbum')}
            />

            <GradientCard
              title={t.whatSound}
              subtitle={`${t.soundMatch} • ${audioCards.length} ${language === 'tr' ? 'kart' : 'cards'}`}
              icon="musical-notes-outline"
              iconColor={COLORS.accent}
              iconBackground={COLORS.accentMuted}
              onPress={() => navigation.navigate('VoiceMessages')}
            />
          </View>

          {/* Emergency SOS */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sosButton}
              activeOpacity={0.8}
              onPress={() => {
                Alert.alert(
                  language === 'tr' ? 'ACİL DURUM (SOS)' : 'EMERGENCY (SOS)',
                  language === 'tr' ? 'Acil durum kişisini aramak istediğinize emin misiniz?' : 'Are you sure you want to call your emergency contact?',
                  [
                    { text: language === 'tr' ? 'İptal' : 'Cancel', style: 'cancel' },
                    { text: language === 'tr' ? 'Ara' : 'Call', style: 'destructive', onPress: () => {
                        const phone = safetyProfile?.emergencyContact || '112';
                        Linking.openURL(`tel:${phone}`);
                    }}
                  ]
                );
              }}
            >
              <View style={styles.sosIconWrap}>
                <Ionicons name="call" size={28} color="#FFF" />
              </View>
              <View>
                <Text style={styles.sosTitle}>{language === 'tr' ? 'ACİL DURUM (SOS)' : 'EMERGENCY (SOS)'}</Text>
                <Text style={styles.sosSubtitle}>{language === 'tr' ? "Acil durum kişisini arayın" : 'Call emergency contact'}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Management */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {language === 'tr' ? 'YÖNETİM' : 'MANAGEMENT'}
            </Text>

            <View style={styles.gridRow}>
              <TouchableOpacity
                style={styles.gridTile}
                onPress={() => navigation.navigate('Routine')}
                activeOpacity={0.8}
              >
                <Ionicons name="calendar-outline" size={24} color={COLORS.primary} style={{ marginBottom: SPACING.sm }} />
                <Text style={styles.gridTileText}>{t.dailyRoutine}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.gridTile}
                onPress={() => navigation.navigate('Safety')}
                activeOpacity={0.8}
              >
                <Ionicons name="shield-checkmark-outline" size={24} color={COLORS.accent} style={{ marginBottom: SPACING.sm }} />
                <Text style={styles.gridTileText}>
                  {safetyProfile?.homeLocation ? t.safety : t.setHomeLocation}
                </Text>
                {safetyProfile?.isMonitoringEnabled && <View style={styles.activeDot} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.gridTile}
                onPress={() => navigation.navigate('Caregiver')}
                activeOpacity={0.8}
              >
                <Ionicons name="people-outline" size={24} color={COLORS.info} style={{ marginBottom: SPACING.sm }} />
                <Text style={styles.gridTileText}>{t.caregiverMode}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: SPACING.xxxl }} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },

  /* Top Bar */
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  profilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.md,
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  avatarText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textOnPrimary,
  },
  greetingLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: FONTS.letterSpacing.wide,
  },
  profileName: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  settingsButton: {
    width: TOUCH_TARGET.iconButton,
    height: TOUCH_TARGET.iconButton,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.backgroundMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Header */
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    letterSpacing: FONTS.letterSpacing.tight,
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  /* Alert */
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warningLight,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.warning + '40',
  },
  alertIconWrap: { marginRight: SPACING.md },
  alertInfo: { flex: 1 },
  alertTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.warning,
  },
  alertAddress: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  alertRight: { alignItems: 'flex-end' },
  alertDist: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  alertAction: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  alertActionText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.primary,
    fontWeight: FONTS.weights.semibold,
    marginRight: 2,
  },

  /* Routine */
  routineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  routineLeft: { flex: 1, marginRight: SPACING.md },
  routineTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  nextRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs },
  nextLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, marginRight: 4 },
  nextValue: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.medium, color: COLORS.textSecondary },
  routineCount: { fontSize: FONTS.sizes.xs, color: COLORS.textLight },

  /* Sections */
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textMuted,
    letterSpacing: FONTS.letterSpacing.widest,
    marginBottom: SPACING.md,
  },

  /* SOS Button */
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D32F2F',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.md,
  },
  sosIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  sosTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: '#FFF',
    letterSpacing: 1,
  },
  sosSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },

  /* Grid */
  gridRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  gridTile: {
    flex: 1,
    backgroundColor: COLORS.backgroundCard,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    position: 'relative',
    ...SHADOWS.sm,
  },
  gridTileText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  activeDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
});
