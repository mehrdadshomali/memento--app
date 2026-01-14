/**
 * Memento - Add/Edit Routine Screen
 * Rutin ekleme ve düzenleme
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
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useLanguage } from '../i18n';
import { useRoutine, ROUTINE_CATEGORIES, DAY_NAMES, RoutineCategory, Routine } from '../context/RoutineContext';

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

  const selectAllDays = () => {
    setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
  };

  const selectWeekdays = () => {
    setSelectedDays([1, 2, 3, 4, 5]);
  };

  const formatTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Hata', 'Lütfen bir başlık girin');
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
      'Rutini Sil',
      'Bu rutini silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
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
    if (selectedDate) {
      setTime(selectedDate);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>İptal</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Rutini Düzenle' : 'Yeni Rutin'}
        </Text>
        <TouchableOpacity
          style={[styles.saveButton, !title.trim() && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!title.trim()}
        >
          <Text style={styles.saveButtonText}>Kaydet</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Input */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Başlık</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: Sabah İlacı"
            placeholderTextColor={COLORS.textMuted}
            value={title}
            onChangeText={setTitle}
            autoFocus={!isEditing && !suggestion}
          />
        </View>

        {/* Description Input */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Açıklama (İsteğe bağlı)</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="Ek notlar..."
            placeholderTextColor={COLORS.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Kategori</Text>
          <View style={styles.categoryGrid}>
            {(Object.keys(ROUTINE_CATEGORIES) as RoutineCategory[]).map((cat) => {
              const info = ROUTINE_CATEGORIES[cat];
              const isSelected = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    isSelected && { backgroundColor: info.color + '20', borderColor: info.color },
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={styles.categoryIcon}>{info.icon}</Text>
                  <Text style={[styles.categoryLabel, isSelected && { color: info.color }]}>
                    {language === 'tr' ? info.labelTr : info.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Saat</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.timeIcon}>🕐</Text>
            <Text style={styles.timeText}>{formatTime(time)}</Text>
            <Text style={styles.timeHint}>Değiştir</Text>
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
            <Text style={styles.sectionLabel}>Günler</Text>
            <View style={styles.quickDays}>
              <TouchableOpacity style={styles.quickDayButton} onPress={selectAllDays}>
                <Text style={styles.quickDayText}>Her gün</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickDayButton} onPress={selectWeekdays}>
                <Text style={styles.quickDayText}>Hafta içi</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.daysRow}>
            {DAY_NAMES.map((day, index) => {
              const isSelected = selectedDays.includes(index);
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.dayButton, isSelected && styles.dayButtonSelected]}
                  onPress={() => toggleDay(index)}
                >
                  <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Önizleme</Text>
          <View style={styles.previewCard}>
            <View style={[styles.previewIcon, { backgroundColor: ROUTINE_CATEGORIES[category].color + '20' }]}>
              <Text style={styles.previewIconText}>{ROUTINE_CATEGORIES[category].icon}</Text>
            </View>
            <View style={styles.previewContent}>
              <Text style={styles.previewTitle}>{title || 'Rutin Başlığı'}</Text>
              <Text style={styles.previewTime}>
                {formatTime(time)} • {selectedDays.map(d => DAY_NAMES[d]).join(', ')}
              </Text>
            </View>
          </View>
        </View>

        {/* Delete Button (only for editing) */}
        {isEditing && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Rutini Sil</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  cancelButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  cancelButtonText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  headerTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
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
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputMultiline: {
    minHeight: 80,
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
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.backgroundCard,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: SPACING.xs,
  },
  categoryLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
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
  },
  quickDays: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  quickDayButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.backgroundMuted,
    borderRadius: BORDER_RADIUS.sm,
  },
  quickDayText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
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
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dayButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
  },
  dayTextSelected: {
    color: COLORS.textOnPrimary,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  previewIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  previewIconText: {
    fontSize: 24,
  },
  previewContent: {
    flex: 1,
  },
  previewTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  previewTime: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
  },
  deleteButton: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  deleteButtonText: {
    fontSize: FONTS.sizes.md,
    color: '#E57373',
    fontWeight: FONTS.weights.medium,
  },
  bottomPadding: {
    height: SPACING.xxl,
  },
});
