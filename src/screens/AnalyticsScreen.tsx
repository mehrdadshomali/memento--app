/**
 * AnalyticsScreen — Caregiver reports & metrics
 *
 * Features:
 *  - Count-up animated metric values
 *  - Gradient-accent metric cards
 *  - Informational tip card
 *  - Ionicons throughout (no emoji)
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedHeader } from '../components';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, ANIMATION } from '../constants/theme';
import { useLanguage } from '../i18n';
import { useRoutine } from '../context/RoutineContext';
import { useGame } from '../context/GameContext';

interface AnalyticsScreenProps {
  navigation: any;
}

/** Animated number that counts up from 0 */
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const displayValue = useRef(new Animated.Value(0)).current;
  const [displayText, setDisplayText] = React.useState('0');

  useEffect(() => {
    displayValue.setValue(0);
    Animated.timing(displayValue, {
      toValue: value,
      duration: ANIMATION.duration.slower,
      useNativeDriver: false,
    }).start();

    const listener = displayValue.addListener(({ value: v }) => {
      setDisplayText(Math.round(v).toString());
    });
    return () => displayValue.removeListener(listener);
  }, [value, displayValue]);

  return <Text style={styles.metricValue}>{displayText}{suffix}</Text>;
}

export function AnalyticsScreen({ navigation }: AnalyticsScreenProps) {
  const { language } = useLanguage();
  const { getCompletionRate, todayRoutines, isCompletedToday } = useRoutine();
  const { state } = useGame();

  const tr = language === 'tr';

  const completedToday = todayRoutines.filter(r => isCompletedToday(r.id)).length;
  const totalToday = todayRoutines.length;
  const todayPercent = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;
  const rate7 = getCompletionRate(7);
  const rate30 = getCompletionRate(30);

  const totalSessions = state.userProgress.totalSessions;
  const lastPlayed = state.userProgress.lastPlayedDate
    ? new Date(state.userProgress.lastPlayedDate).toLocaleDateString(
        tr ? 'tr-TR' : 'en-US',
        { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' },
      )
    : (tr ? 'Henüz Oynanmadı' : 'Not played yet');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: ANIMATION.duration.slow,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedHeader
        title={tr ? 'Analiz Raporları' : 'Analytics & Reports'}
        onBack={() => navigation.goBack()}
      />

      <Animated.ScrollView
        style={[styles.scroll, { opacity: fadeAnim }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Routine Completion */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {tr ? 'RUTİN TAMAMLAMA' : 'ROUTINE COMPLETION'}
          </Text>

          <View style={styles.metricsRow}>
            <View style={[styles.metricCard, { borderLeftColor: COLORS.primary }]}>
              <Text style={styles.metricLabel}>{tr ? 'Bugün' : 'Today'}</Text>
              <AnimatedNumber value={todayPercent} suffix="%" />
              <Text style={styles.metricSub}>{completedToday}/{totalToday}</Text>
            </View>
            <View style={[styles.metricCard, { borderLeftColor: COLORS.accent }]}>
              <Text style={styles.metricLabel}>{tr ? '7 Gün' : '7 Days'}</Text>
              <AnimatedNumber value={rate7} suffix="%" />
            </View>
            <View style={[styles.metricCard, { borderLeftColor: COLORS.info }]}>
              <Text style={styles.metricLabel}>{tr ? '30 Gün' : '30 Days'}</Text>
              <AnimatedNumber value={rate30} suffix="%" />
            </View>
          </View>
        </View>

        {/* Memory Exercises */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {tr ? 'HAFIZA EGZERSİZLERİ' : 'MEMORY EXERCISES'}
          </Text>

          <View style={styles.statsCard}>
            <View style={styles.statRow}>
              <View style={styles.statLeft}>
                <Ionicons name="game-controller-outline" size={18} color={COLORS.primary} style={{ marginRight: SPACING.sm }} />
                <Text style={styles.statLabel}>{tr ? 'Toplam Egzersiz' : 'Total Exercises'}</Text>
              </View>
              <Text style={styles.statValue}>{totalSessions}</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statRow}>
              <View style={styles.statLeft}>
                <Ionicons name="time-outline" size={18} color={COLORS.accent} style={{ marginRight: SPACING.sm }} />
                <Text style={styles.statLabel}>{tr ? 'Son Egzersiz' : 'Last Exercise'}</Text>
              </View>
              <Text style={styles.statValueSmall}>{lastPlayed}</Text>
            </View>
          </View>
        </View>

        {/* Tip */}
        <View style={styles.section}>
          <View style={styles.tipCard}>
            <Ionicons name="bulb-outline" size={22} color={COLORS.primary} style={{ marginRight: SPACING.md }} />
            <Text style={styles.tipText}>
              {tr
                ? 'Hastanızın rutinlerini düzenli olarak yapması ve hafıza egzersizlerini günlük olarak tekrarlaması, bilişsel sağlığını koruması için önemlidir.'
                : 'It is important for the patient to follow routines regularly and repeat memory exercises daily to maintain cognitive health.'}
            </Text>
          </View>
        </View>

        <View style={{ height: SPACING.xxxl }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },

  section: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textMuted,
    letterSpacing: FONTS.letterSpacing.widest,
    marginBottom: SPACING.md,
  },

  /* Metrics */
  metricsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    alignItems: 'center',
    borderLeftWidth: 3,
    ...SHADOWS.sm,
  },
  metricLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  metricValue: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  metricSub: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
    marginTop: 2,
  },

  /* Stats */
  statsCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  statLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  statValue: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  statValueSmall: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
    maxWidth: 160,
    textAlign: 'right',
  },
  statDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.xs,
  },

  /* Tip */
  tipCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryMuted,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  tipText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: FONTS.sizes.sm * FONTS.lineHeight.relaxed,
  },
});
