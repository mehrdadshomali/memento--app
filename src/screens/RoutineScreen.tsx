/**
 * RoutineScreen — Daily routine view and management
 *
 * Features:
 *  - AnimatedHeader
 *  - ProgressRing for today's summary
 *  - Segmented control for Today/All view
 *  - FloatingActionButton for adding new routines
 *  - Completion celebration animation
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Image,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedHeader, FloatingActionButton, ProgressRing } from '../components';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, ANIMATION } from '../constants/theme';
import { useLanguage } from '../i18n';
import { useRoutine, ROUTINE_CATEGORIES, DAY_NAMES, DAY_NAMES_EN, Routine } from '../context/RoutineContext';

interface RoutineScreenProps {
  navigation: any;
}

export function RoutineScreen({ navigation }: RoutineScreenProps) {
  const { t, language } = useLanguage();
  const { todayRoutines, routines, completeRoutine, isCompletedToday } = useRoutine();
  const [viewMode, setViewMode] = useState<'today' | 'all'>('today');

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;

  const getTimeStatus = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const routineMinutes = hours * 60 + minutes;
    const diff = routineMinutes - currentTimeMinutes;

    if (diff < -30) return 'past';
    if (diff < 0) return 'now';
    if (diff < 30) return 'soon';
    return 'upcoming';
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  const handleComplete = (routine: Routine) => {
    if (isCompletedToday(routine.id)) return;

    Alert.alert(
      t.completeRoutine,
      `"${routine.title}" ${t.completeRoutineConfirm}`,
      [
        { text: t.no, style: 'cancel' },
        {
          text: t.yes,
          onPress: () => completeRoutine(routine.id),
        },
      ]
    );
  };

  const dayNames = language === 'tr' ? DAY_NAMES : DAY_NAMES_EN;

  const renderRoutineCard = (routine: Routine, showTime: boolean = true) => {
    const category = ROUTINE_CATEGORIES[routine.category];
    const completed = isCompletedToday(routine.id);
    const timeStatus = getTimeStatus(routine.time);

    return (
      <TouchableOpacity
        key={routine.id}
        style={[
          styles.routineCard,
          completed && styles.routineCardCompleted,
          timeStatus === 'now' && !completed && styles.routineCardNow,
        ]}
        onPress={() => handleComplete(routine)}
        disabled={completed}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                 <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
                    <Text style={styles.icon}>{category.icon}</Text>
                </View>
                <View>
                    <Text style={[styles.routineTitle, completed && styles.routineTitleCompleted]}>
                        {routine.title}
                    </Text>
                    <Text style={[styles.categoryLabel, { color: category.color }]}>
                        {language === 'tr' ? category.labelTr : category.label}
                    </Text>
                </View>
            </View>

            {/* Status Indicator */}
             <View style={styles.statusContainer}>
                {completed ? (
                    <View style={styles.completedBadge}>
                        <Ionicons name="checkmark" size={16} color={COLORS.textOnPrimary} />
                    </View>
                ) : timeStatus === 'now' ? (
                    <View style={styles.nowBadge}>
                        <Text style={styles.nowText}>{t.now}</Text>
                    </View>
                ) : timeStatus === 'soon' ? (
                    <View style={styles.soonBadge}>
                        <Text style={styles.soonText}>{t.soon}</Text>
                    </View>
                ) : (
                    <Text style={styles.tapHint}>{t.tap}</Text>
                )}
            </View>
        </View>

        {routine.description && (
             <Text style={styles.routineDescription} numberOfLines={2}>{routine.description}</Text>
        )}
        
        {showTime && (
            <View style={styles.cardFooter}>
                 <View style={styles.timeBadge}>
                    <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} style={{marginRight: 4}}/>
                    <Text style={styles.timeText}>
                        {formatTime(routine.time)}
                    </Text>
                </View>
            </View>
        )}
      </TouchableOpacity>
    );
  };

  const completedCount = todayRoutines.filter(r => isCompletedToday(r.id)).length;
  const totalCount = todayRoutines.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const getProgressMessage = () => {
    if (completedCount === totalCount && totalCount > 0) {
      return `${t.allDone} ${t.allDoneMsg}`;
    }
    if (completedCount > 0) {
      return `${t.keepGoing} ${totalCount - completedCount} ${t.keepGoingMsg}`;
    }
    if (totalCount > 0) {
      return t.letsStart;
    }
    return t.noRoutines;
  };

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedHeader
        title={t.dailyRoutine}
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Today's Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressLeft}>
             <Text style={styles.progressTitle}>{t.todayProgress}</Text>
             <Text style={styles.progressMessage}>{getProgressMessage()}</Text>
          </View>
          <ProgressRing 
             progress={progressPercent} 
             size={80} 
             strokeWidth={6} 
             label={`${completedCount}/${totalCount}`} 
             sublabel={language === 'tr' ? 'Tamamlandı' : 'Done'}
          />
        </View>

        {/* View Toggle (Segmented Control style) */}
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[styles.segment, viewMode === 'today' && styles.segmentActive]}
            onPress={() => setViewMode('today')}
            activeOpacity={1}
          >
            <Text style={[styles.segmentText, viewMode === 'today' && styles.segmentTextActive]}>
              {t.today} ({todayRoutines.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segment, viewMode === 'all' && styles.segmentActive]}
            onPress={() => setViewMode('all')}
            activeOpacity={1}
          >
            <Text style={[styles.segmentText, viewMode === 'all' && styles.segmentTextActive]}>
              {t.allRoutines} ({routines.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Routines List */}
        {viewMode === 'today' ? (
          todayRoutines.length > 0 ? (
            <View style={styles.routinesList}>
              {todayRoutines.map(routine => renderRoutineCard(routine))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-clear-outline" size={64} color={COLORS.textLight} />
              <Text style={styles.emptyTitle}>{t.noRoutineToday}</Text>
              <Text style={styles.emptySubtitle}>{t.noRoutineTodayDesc}</Text>
            </View>
          )
        ) : routines.length > 0 ? (
          <View style={styles.routinesList}>
            {routines.map(routine => (
              <TouchableOpacity
                key={routine.id}
                style={styles.allRoutineCard}
                onPress={() => navigation.navigate('AddRoutine', { routine })}
                activeOpacity={0.8}
              >
                 <View style={[styles.iconContainerSmall, { backgroundColor: ROUTINE_CATEGORIES[routine.category].color + '20' }]}>
                    <Text style={styles.iconSmall}>{ROUTINE_CATEGORIES[routine.category].icon}</Text>
                 </View>
                <View style={styles.allRoutineContent}>
                  <Text style={styles.allRoutineTitle}>{routine.title}</Text>
                  <Text style={styles.allRoutineTime}>
                    {formatTime(routine.time)} • {routine.days.map(d => dayNames[d].slice(0,3)).join(', ')}
                  </Text>
                </View>
                <View style={[styles.statusDot, { backgroundColor: routine.isEnabled ? COLORS.success : COLORS.textLight }]} />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
             <Ionicons name="list-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>{t.noRoutines}</Text>
            <Text style={styles.emptySubtitle}>{t.noRoutinesDesc}</Text>
          </View>
        )}

        {/* Quick Add Suggestions */}
        {routines.length === 0 && (
          <View style={styles.suggestionsCard}>
            <Text style={styles.suggestionsTitle}>{t.quickAdd}</Text>
            <View style={styles.suggestionsList}>
              {[
                { title: language === 'tr' ? 'Sabah İlacı' : 'Morning Meds', category: 'medication' as const, time: '08:00' },
                { title: language === 'tr' ? 'Kahvaltı' : 'Breakfast', category: 'meal' as const, time: '09:00' },
                { title: language === 'tr' ? 'Yürüyüş' : 'Walk', category: 'exercise' as const, time: '10:00' },
                { title: language === 'tr' ? 'Öğle Yemeği' : 'Lunch', category: 'meal' as const, time: '12:30' },
                { title: language === 'tr' ? 'Akşam İlacı' : 'Evening Meds', category: 'medication' as const, time: '20:00' },
              ].map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionChip}
                  onPress={() => navigation.navigate('AddRoutine', { suggestion })}
                >
                  <Text style={styles.suggestionIcon}>
                    {ROUTINE_CATEGORIES[suggestion.category].icon}
                  </Text>
                  <Text style={styles.suggestionText}>{suggestion.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

       <FloatingActionButton 
           icon="add"
           onPress={() => navigation.navigate('AddRoutine')}
       />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  progressLeft: {
      flex: 1,
      marginRight: SPACING.md,
  },
  progressTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  progressMessage: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: FONTS.sizes.sm * FONTS.lineHeight.relaxed,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundMuted,
    borderRadius: BORDER_RADIUS.lg,
    padding: 4,
    marginBottom: SPACING.lg,
  },
  segment: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
  },
  segmentActive: {
    backgroundColor: COLORS.backgroundCard,
    ...SHADOWS.sm,
  },
  segmentText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textMuted,
  },
  segmentTextActive: {
    color: COLORS.textPrimary,
    fontWeight: FONTS.weights.bold,
  },
  routinesList: {
    gap: SPACING.sm,
  },
  routineCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  routineCardCompleted: {
    backgroundColor: COLORS.successLight,
    borderColor: COLORS.success + '40',
    opacity: 0.8,
  },
  routineCardNow: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  icon: {
    fontSize: 24,
  },
  routineTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  routineTitleCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  categoryLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.medium,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  completedBadge: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nowBadge: {
    backgroundColor: COLORS.primary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BORDER_RADIUS.sm,
  },
  nowText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textOnPrimary,
  },
  soonBadge: {
    backgroundColor: COLORS.warningLight,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BORDER_RADIUS.sm,
  },
  soonText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    color: COLORS.warning,
  },
  tapHint: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
  },
  routineDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    paddingLeft: 48 + SPACING.md, // align with text
  },
  cardFooter: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: SPACING.sm,
  },
  timeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.backgroundMuted,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: BORDER_RADIUS.sm,
  },
  timeText: {
      fontSize: FONTS.sizes.xs,
      fontWeight: FONTS.weights.medium,
      color: COLORS.textSecondary,
  },
  allRoutineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  iconContainerSmall: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  iconSmall: {
    fontSize: 22,
  },
  allRoutineContent: {
    flex: 1,
  },
  allRoutineTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
  },
  allRoutineTime: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  suggestionsCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  suggestionsTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: FONTS.letterSpacing.wide,
    marginBottom: SPACING.md,
  },
  suggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundMuted,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
  },
  suggestionIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  suggestionText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.medium,
  },
  bottomPadding: {
    height: 100, // Make room for FAB
  },
});
