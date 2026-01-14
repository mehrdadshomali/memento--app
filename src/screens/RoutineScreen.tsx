/**
 * Memento - Routine Screen
 * Günlük rutin görüntüleme ve yönetim
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useLanguage } from '../i18n';
import { useRoutine, ROUTINE_CATEGORIES, DAY_NAMES, Routine } from '../context/RoutineContext';

interface RoutineScreenProps {
  navigation: any;
}

export function RoutineScreen({ navigation }: RoutineScreenProps) {
  const { t, language } = useLanguage();
  const { todayRoutines, routines, completeRoutine, isCompletedToday, getCompletionRate } = useRoutine();
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
      '✓ Tamamlandı mı?',
      `"${routine.title}" tamamlandı olarak işaretlensin mi?`,
      [
        { text: 'Hayır', style: 'cancel' },
        {
          text: 'Evet, Tamamlandı',
          onPress: () => completeRoutine(routine.id),
        },
      ]
    );
  };

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
          timeStatus === 'soon' && !completed && styles.routineCardSoon,
        ]}
        onPress={() => handleComplete(routine)}
        disabled={completed}
      >
        {/* Time Badge */}
        {showTime && (
          <View style={[styles.timeBadge, { backgroundColor: category.color + '20' }]}>
            <Text style={[styles.timeText, { color: category.color }]}>
              {formatTime(routine.time)}
            </Text>
          </View>
        )}

        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
          <Text style={styles.icon}>{category.icon}</Text>
        </View>

        {/* Content */}
        <View style={styles.routineContent}>
          <Text style={[styles.routineTitle, completed && styles.routineTitleCompleted]}>
            {routine.title}
          </Text>
          {routine.description && (
            <Text style={styles.routineDescription}>{routine.description}</Text>
          )}
          <Text style={[styles.categoryLabel, { color: category.color }]}>
            {language === 'tr' ? category.labelTr : category.label}
          </Text>
        </View>

        {/* Status */}
        <View style={styles.statusContainer}>
          {completed ? (
            <View style={styles.completedBadge}>
              <Text style={styles.completedIcon}>✓</Text>
            </View>
          ) : timeStatus === 'now' ? (
            <View style={styles.nowBadge}>
              <Text style={styles.nowText}>Şimdi</Text>
            </View>
          ) : timeStatus === 'soon' ? (
            <View style={styles.soonBadge}>
              <Text style={styles.soonText}>Yakında</Text>
            </View>
          ) : (
            <Text style={styles.tapHint}>Dokun</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const completedCount = todayRoutines.filter(r => isCompletedToday(r.id)).length;
  const totalCount = todayRoutines.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Günlük Rutin</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddRoutine')}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Today's Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Bugünün İlerlemesi</Text>
            <Text style={styles.progressCount}>
              {completedCount}/{totalCount}
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressMessage}>
            {completedCount === totalCount && totalCount > 0
              ? '🎉 Harika! Tüm rutinleri tamamladınız!'
              : completedCount > 0
              ? `👍 Güzel gidiyorsunuz! ${totalCount - completedCount} rutin kaldı.`
              : totalCount > 0
              ? '💪 Haydi başlayalım!'
              : 'Henüz rutin eklenmemiş'}
          </Text>
        </View>

        {/* View Toggle */}
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'today' && styles.toggleButtonActive]}
            onPress={() => setViewMode('today')}
          >
            <Text style={[styles.toggleText, viewMode === 'today' && styles.toggleTextActive]}>
              Bugün ({todayRoutines.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'all' && styles.toggleButtonActive]}
            onPress={() => setViewMode('all')}
          >
            <Text style={[styles.toggleText, viewMode === 'all' && styles.toggleTextActive]}>
              Tümü ({routines.length})
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
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyTitle}>Bugün için rutin yok</Text>
              <Text style={styles.emptySubtitle}>
                Yeni rutin eklemek için + butonuna dokunun
              </Text>
            </View>
          )
        ) : routines.length > 0 ? (
          <View style={styles.routinesList}>
            {routines.map(routine => (
              <TouchableOpacity
                key={routine.id}
                style={styles.allRoutineCard}
                onPress={() => navigation.navigate('AddRoutine', { routine })}
              >
                <View style={[styles.iconContainerSmall, { backgroundColor: ROUTINE_CATEGORIES[routine.category].color + '20' }]}>
                  <Text style={styles.iconSmall}>{ROUTINE_CATEGORIES[routine.category].icon}</Text>
                </View>
                <View style={styles.allRoutineContent}>
                  <Text style={styles.allRoutineTitle}>{routine.title}</Text>
                  <Text style={styles.allRoutineTime}>
                    {formatTime(routine.time)} • {routine.days.map(d => DAY_NAMES[d]).join(', ')}
                  </Text>
                </View>
                <View style={[styles.statusDot, { backgroundColor: routine.isEnabled ? '#4CAF50' : COLORS.textLight }]} />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Henüz rutin yok</Text>
            <Text style={styles.emptySubtitle}>
              İlaç, yemek, egzersiz gibi günlük rutinler ekleyin
            </Text>
          </View>
        )}

        {/* Quick Add Suggestions */}
        {routines.length === 0 && (
          <View style={styles.suggestionsCard}>
            <Text style={styles.suggestionsTitle}>Hızlı Ekle</Text>
            <View style={styles.suggestionsList}>
              {[
                { title: 'Sabah İlacı', category: 'medication' as const, time: '08:00' },
                { title: 'Kahvaltı', category: 'meal' as const, time: '09:00' },
                { title: 'Yürüyüş', category: 'exercise' as const, time: '10:00' },
                { title: 'Öğle Yemeği', category: 'meal' as const, time: '12:30' },
                { title: 'Akşam İlacı', category: 'medication' as const, time: '20:00' },
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.full,
  },
  backButtonText: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.textSecondary,
  },
  headerTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
  },
  addButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
  },
  addButtonText: {
    fontSize: FONTS.sizes.xl,
    color: COLORS.textOnPrimary,
    fontWeight: FONTS.weights.light,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  progressCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
  },
  progressCount: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.backgroundMuted,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.full,
  },
  progressMessage: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.background,
    ...SHADOWS.sm,
  },
  toggleText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
  },
  toggleTextActive: {
    color: COLORS.textPrimary,
    fontWeight: FONTS.weights.medium,
  },
  routinesList: {
    gap: SPACING.md,
  },
  routineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  routineCardCompleted: {
    backgroundColor: '#E8F5E9',
    borderColor: '#A5D6A7',
    opacity: 0.8,
  },
  routineCardNow: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  routineCardSoon: {
    borderColor: '#FFB74D',
  },
  timeBadge: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.sm,
  },
  timeText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  icon: {
    fontSize: 24,
  },
  routineContent: {
    flex: 1,
  },
  routineTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  routineTitleCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  routineDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  categoryLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.medium,
  },
  statusContainer: {
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  completedBadge: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedIcon: {
    fontSize: 18,
    color: COLORS.textOnPrimary,
  },
  nowBadge: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  nowText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textOnPrimary,
  },
  soonBadge: {
    backgroundColor: '#FFF3E0',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  soonText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.medium,
    color: '#F57C00',
  },
  tapHint: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
  },
  allRoutineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  iconContainerSmall: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  iconSmall: {
    fontSize: 20,
  },
  allRoutineContent: {
    flex: 1,
  },
  allRoutineTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
  },
  allRoutineTime: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  suggestionsCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
  },
  suggestionsTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
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
  },
  bottomPadding: {
    height: SPACING.xxl,
  },
});
