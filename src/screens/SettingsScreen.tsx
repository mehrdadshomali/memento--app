/**
 * SettingsScreen — App preferences and information
 *
 * Features:
 *  - Language selection with flag icons
 *  - About / version info
 *  - Data management (clear all data)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedHeader } from '../components';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, TOUCH_TARGET } from '../constants/theme';
import { useLanguage } from '../i18n';
import { useProfile } from '../context/ProfileContext';

interface SettingsScreenProps {
  navigation: any;
}

export function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { language, setLanguage } = useLanguage();

  const tr = language === 'tr';

  const handleClearData = () => {
    Alert.alert(
      tr ? 'Tüm Verileri Sil' : 'Clear All Data',
      tr
        ? 'Bu işlem tüm profilleri, kartları ve ayarları silecektir. Bu işlem geri alınamaz!'
        : 'This will delete all profiles, cards, and settings. This cannot be undone!',
      [
        { text: tr ? 'İptal' : 'Cancel', style: 'cancel' },
        {
          text: tr ? 'Sil' : 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert(
                '✓',
                tr ? 'Tüm veriler silindi. Uygulama yeniden başlatılmalıdır.' : 'All data cleared. Please restart the app.',
              );
            } catch {
              Alert.alert(tr ? 'Hata' : 'Error', tr ? 'Veri silinemedi' : 'Could not clear data');
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedHeader
        title={tr ? 'Ayarlar' : 'Settings'}
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {tr ? 'DİL' : 'LANGUAGE'}
          </Text>

          <TouchableOpacity
            style={[styles.optionRow, language === 'tr' && styles.optionRowActive]}
            onPress={() => setLanguage('tr')}
            activeOpacity={0.7}
          >
            <Text style={styles.flag}>🇹🇷</Text>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Türkçe</Text>
              <Text style={styles.optionSubtitle}>Turkish</Text>
            </View>
            {language === 'tr' && (
              <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionRow, language === 'en' && styles.optionRowActive]}
            onPress={() => setLanguage('en')}
            activeOpacity={0.7}
          >
            <Text style={styles.flag}>🇬🇧</Text>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>English</Text>
              <Text style={styles.optionSubtitle}>İngilizce</Text>
            </View>
            {language === 'en' && (
              <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {tr ? 'HAKKINDA' : 'ABOUT'}
          </Text>

          <View style={styles.aboutCard}>
            <View style={styles.aboutHeader}>
              <View style={styles.appIcon}>
                <Ionicons name="layers" size={28} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.appName}>Memento</Text>
                <Text style={styles.appVersion}>v1.0.0</Text>
              </View>
            </View>
            <Text style={styles.aboutText}>
              {tr
                ? 'Alzheimer hastaları ve aileleri için terapötik hafıza egzersiz uygulaması.'
                : 'A therapeutic memory exercise app for Alzheimer\'s patients and their families.'}
            </Text>
            <View style={styles.aboutFooter}>
              <Ionicons name="heart" size={14} color={COLORS.danger} />
              <Text style={styles.aboutCredit}>
                {tr ? 'Mehrdad Shomali tarafından geliştirildi' : 'Built by Mehrdad Shomali'}
              </Text>
            </View>
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {tr ? 'VERİ YÖNETİMİ' : 'DATA MANAGEMENT'}
          </Text>

          <TouchableOpacity
            style={styles.dangerRow}
            onPress={handleClearData}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.danger} style={{ marginRight: SPACING.md }} />
            <Text style={styles.dangerText}>
              {tr ? 'Tüm Verileri Sil' : 'Clear All Data'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.warningHint}>
            {tr
              ? 'Bu işlem tüm profilleri, kartları ve rutinleri kalıcı olarak siler.'
              : 'This permanently deletes all profiles, cards, and routines.'}
          </Text>
        </View>

        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },

  /* Section */
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

  /* Language options */
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
  },
  optionRowActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryMuted,
  },
  flag: {
    fontSize: 28,
    marginRight: SPACING.md,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
  },
  optionSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginTop: 1,
  },

  /* About */
  aboutCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  appName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  appVersion: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
  },
  aboutText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: FONTS.sizes.sm * FONTS.lineHeight.relaxed,
    marginBottom: SPACING.md,
  },
  aboutFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  aboutCredit: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
  },

  /* Data */
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerLight,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.danger + '30',
  },
  dangerText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.danger,
  },
  warningHint: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
});
