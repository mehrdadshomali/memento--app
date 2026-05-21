/**
 * AddRoutineScreen — Routine creation and editing form
 *
 * Features:
 *  - AnimatedHeader
 *  - Modern floating-label-like input styling (clean borders)
 *  - Grid selection for category
 *  - Visual day selector
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  Image,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedHeader } from '../components';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, TOUCH_TARGET } from '../constants/theme';
import { useLanguage } from '../i18n';
import { useRoutine, ROUTINE_CATEGORIES, DAY_NAMES, DAY_NAMES_EN, RoutineCategory, Routine } from '../context/RoutineContext';

interface AddRoutineScreenProps {
  navigation: any;
  route?: {
    params?: {
      routine?: Routine;
      suggestion?: {
        title: string;
        category: RoutineCategory;
        time: string;
      };
    };
  };
}

export function AddRoutineScreen({ navigation, route }: AddRoutineScreenProps) {
  const { t, language } = useLanguage();
  const { addRoutine, updateRoutine, deleteRoutine } = useRoutine();

  const existingRoutine = route?.params?.routine;
  const suggestion = route?.params?.suggestion;
  const isEditing = !!existingRoutine;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<RoutineCategory>('other');
  const [time, setTime] = useState(new Date());
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [isEnabled, setIsEnabled] = useState(true);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (existingRoutine) {
      setTitle(existingRoutine.title);
      setDescription(existingRoutine.description || '');
      setCategory(existingRoutine.category);
      const [hours, minutes] = existingRoutine.time.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes);
      setTime(date);
      setSelectedDays(existingRoutine.days);
      setIsEnabled(existingRoutine.isEnabled);
      setImageUri(existingRoutine.imageUri);
    } else if (suggestion) {
      setTitle(suggestion.title);
      setCategory(suggestion.category);
      const [hours, minutes] = suggestion.time.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes);
      setTime(date);
    }
  }, [existingRoutine, suggestion]);

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter(d => d !== day));
      }
    } else {
      setSelectedDays([...selectedDays, day].sort());
    }
  };

  const selectAllDays = () => setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
  const selectWeekdays = () => setSelectedDays([1, 2, 3, 4, 5]);

  const formatTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert(t.missingInfo || 'Error', t.fillAllFields || 'Please enter a title');
      return;
    }

    const categoryInfo = ROUTINE_CATEGORIES[category];
    const routineData = {
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      time: formatTime(time),
      days: selectedDays,
      isEnabled,
      icon: categoryInfo.icon,
      color: categoryInfo.color,
      imageUri,
    };

    if (isEditing && existingRoutine) {
      await updateRoutine(existingRoutine.id, routineData);
    } else {
      await addRoutine(routineData);
    }

    navigation.goBack();
  };

  const handleDelete = () => {
    if (!existingRoutine) return;

    Alert.alert(
      t.deleteCard || 'Delete',
      t.deleteRoutineConfirm,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.delete,
          style: 'destructive',
          onPress: async () => {
            await deleteRoutine(existingRoutine.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const onTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) setTime(selectedDate);
  };

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedHeader
        title={isEditing ? t.updateRoutine : t.addRoutine}
        onBack={() => navigation.goBack()}
        rightAction={
            <TouchableOpacity
                style={[styles.saveButton, !title.trim() && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={!title.trim()}
            >
                <Text style={styles.saveButtonText}>{t.save}</Text>
            </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Input */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t.routineTitle}</Text>
          <TextInput
            style={styles.input}
            placeholder={language === 'tr' ? 'Örn: Sabah İlacı' : 'e.g. Morning Meds'}
            placeholderTextColor={COLORS.textLight}
            value={title}
            onChangeText={setTitle}
            autoFocus={!isEditing && !suggestion}
          />
        </View>

        {/* Description Input */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t.routineDescription}</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder={language === 'tr' ? 'Ek notlar...' : 'Additional notes...'}
            placeholderTextColor={COLORS.textLight}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t.routineCategory}</Text>
          <View style={styles.categoryGrid}>
            {(Object.keys(ROUTINE_CATEGORIES) as RoutineCategory[]).map((cat) => {
              const info = ROUTINE_CATEGORIES[cat];
              const isSelected = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    isSelected && { backgroundColor: info.color + '15', borderColor: info.color },
                  ]}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.categoryIcon}>{info.icon}</Text>
                  <Text style={[styles.categoryLabel, isSelected && { color: info.color, fontWeight: FONTS.weights.bold }]}>
                    {language === 'tr' ? info.labelTr : info.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t.routineTime}</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowTimePicker(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="time-outline" size={24} color={COLORS.primary} style={{marginRight: SPACING.md}}/>
            <Text style={styles.timeText}>{formatTime(time)}</Text>
            <Text style={styles.timeHint}>{t.edit}</Text>
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              is24Hour={true}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onTimeChange}
            />
          )}
        </View>

        {/* Days Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>{t.routineDays}</Text>
            <View style={styles.quickDays}>
              <TouchableOpacity style={styles.quickDayButton} onPress={selectAllDays}>
                <Text style={styles.quickDayText}>{language === 'tr' ? 'Her gün' : 'Every day'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickDayButton} onPress={selectWeekdays}>
                <Text style={styles.quickDayText}>{language === 'tr' ? 'Hafta içi' : 'Weekdays'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.daysRow}>
            {(language === 'tr' ? DAY_NAMES : DAY_NAMES_EN).map((day, index) => {
              const isSelected = selectedDays.includes(index);
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.dayButton, isSelected && styles.dayButtonSelected]}
                  onPress={() => toggleDay(index)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                    {day.slice(0, 3)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Delete Button (only for editing) */}
        {isEditing && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} activeOpacity={0.7}>
            <Ionicons name="trash-outline" size={20} color={COLORS.danger} style={{marginRight: SPACING.sm}}/>
            <Text style={styles.deleteButtonText}>{t.delete} {t.dailyRoutine}</Text>
          </TouchableOpacity>
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
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.full,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textOnPrimary,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: FONTS.letterSpacing.wider,
  },
  input: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.backgroundCard,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: SPACING.xs,
  },
  categoryLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.medium,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  timeText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  timeHint: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: FONTS.weights.semibold,
  },
  quickDays: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  quickDayButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: COLORS.backgroundMuted,
    borderRadius: BORDER_RADIUS.sm,
  },
  quickDayText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.medium,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  dayButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textSecondary,
  },
  dayTextSelected: {
    color: COLORS.textOnPrimary,
  },
  deleteButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.dangerLight,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.danger + '30',
  },
  deleteButtonText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.danger,
    fontWeight: FONTS.weights.semibold,
  },
  bottomPadding: {
    height: SPACING.xxxl,
  },
});
