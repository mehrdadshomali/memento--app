/**
 * ProfileSelectScreen — Profile selection & creation
 *
 * Features:
 *  - Animated hero logo with fade+scale entrance
 *  - Profile cards with unique color avatars & press animation
 *  - Staggered list entrance
 *  - Premium bottom-sheet style create modal
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  FlatList,
  Alert,
  Modal,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, TOUCH_TARGET, ANIMATION } from '../constants/theme';
import { useLanguage } from '../i18n';
import { useProfile } from '../context/ProfileContext';
import { UserProfile } from '../types';

/** Generate a deterministic avatar color from a name */
const getAvatarColor = (name: string): string => {
  const palette = [
    '#B07D4F', '#7B9E6F', '#6B8EB0', '#C4786E',
    '#9B8EC4', '#C4A86B', '#6BA3A0', '#B07FA3',
  ];
  const hash = name.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
  return palette[hash % palette.length];
};

export function ProfileSelectScreen() {
  const { t, language, setLanguage } = useLanguage();
  const { profiles, createProfile, selectProfile, deleteProfile, isLoading } = useProfile();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');

  // Entrance animations
  const heroScale = useRef(new Animated.Value(0.85)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const listOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(heroScale, { toValue: 1, ...ANIMATION.spring.gentle, useNativeDriver: true }),
        Animated.timing(heroOpacity, { toValue: 1, duration: ANIMATION.duration.slow, useNativeDriver: true }),
      ]),
      Animated.timing(listOpacity, { toValue: 1, duration: ANIMATION.duration.normal, useNativeDriver: true }),
    ]).start();
  }, [heroScale, heroOpacity, listOpacity]);

  const handleCreateProfile = async () => {
    if (newName.trim().length < 2) return;
    await createProfile(newName.trim());
    setNewName('');
    setShowCreateModal(false);
  };

  const handleDeleteProfile = (profile: UserProfile) => {
    Alert.alert(t.deleteProfile, t.deleteConfirm, [
      { text: t.cancel, style: 'cancel' },
      { text: t.delete, style: 'destructive', onPress: () => deleteProfile(profile.id) },
    ]);
  };

  const toggleLanguage = () => setLanguage(language === 'en' ? 'tr' : 'en');

  const renderProfile = ({ item, index }: { item: UserProfile; index: number }) => {
    const color = getAvatarColor(item.name);
    const cardCount = item.cards.length;
    const cardLabel = cardCount === 1
      ? (language === 'tr' ? 'kart' : 'card')
      : (language === 'tr' ? 'kart' : 'cards');

    return (
      <Animated.View style={{ opacity: listOpacity }}>
        <TouchableOpacity
          style={styles.profileCard}
          onPress={() => selectProfile(item.id)}
          onLongPress={() => handleDeleteProfile(item)}
          activeOpacity={0.8}
          accessibilityLabel={`${item.name}, ${cardCount} ${cardLabel}`}
        >
          <View style={[styles.profileAvatar, { backgroundColor: color }]}>
            <Text style={styles.avatarLetter}>{item.name.charAt(0).toUpperCase()}</Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{item.name}</Text>
            <Text style={styles.profileMeta}>{cardCount} {cardLabel}</Text>
          </View>

          <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>{t.loading}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Language toggle */}
      <View style={styles.topBar}>
        <View style={styles.spacer} />
        <TouchableOpacity style={styles.langPill} onPress={toggleLanguage} activeOpacity={0.7}>
          <Ionicons name="globe-outline" size={16} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
          <Text style={styles.langText}>{language.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      {/* Hero */}
      <Animated.View
        style={[styles.hero, { opacity: heroOpacity, transform: [{ scale: heroScale }] }]}
      >
        <View style={styles.logoCircle}>
          <Ionicons name="layers" size={36} color={COLORS.primary} />
        </View>
        <Text style={styles.heroTitle}>{t.appName}</Text>
        <Text style={styles.heroSubtitle}>{t.selectProfile}</Text>
      </Animated.View>

      {/* Profile list */}
      {profiles.length > 0 ? (
        <FlatList
          data={profiles}
          renderItem={renderProfile}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={52} color={COLORS.textLight} style={{ marginBottom: SPACING.md }} />
          <Text style={styles.emptyTitle}>{t.noProfiles}</Text>
          <Text style={styles.emptySubtitle}>
            {language === 'tr' ? 'Başlamak için bir profil oluşturun' : 'Create a profile to get started'}
          </Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={22} color={COLORS.textOnPrimary} style={{ marginRight: SPACING.sm }} />
          <Text style={styles.createButtonText}>{t.createProfile}</Text>
        </TouchableOpacity>
        <Text style={styles.footerHint}>
          {language === 'tr' ? 'Profili silmek için üzerine basılı tutun' : 'Long press a profile to delete'}
        </Text>
      </View>

      {/* Create Modal */}
      <Modal visible={showCreateModal} transparent animationType="fade" onRequestClose={() => setShowCreateModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.createProfile}</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Ionicons name="close" size={22} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder={t.enterName}
              placeholderTextColor={COLORS.textLight}
              value={newName}
              onChangeText={setNewName}
              autoFocus
              onSubmitEditing={handleCreateProfile}
              returnKeyType="done"
            />

            <TouchableOpacity
              style={[styles.modalButton, newName.trim().length < 2 && styles.modalButtonDisabled]}
              onPress={handleCreateProfile}
              disabled={newName.trim().length < 2}
              activeOpacity={0.85}
            >
              <Text style={styles.modalButtonText}>{t.create}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: FONTS.sizes.md, color: COLORS.textMuted },

  /* Top bar */
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  spacer: { width: 60 },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  langText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textSecondary,
  },

  /* Hero */
  hero: { alignItems: 'center', paddingVertical: SPACING.xl },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: BORDER_RADIUS.xxl,
    backgroundColor: COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  heroTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    letterSpacing: FONTS.letterSpacing.tight,
  },
  heroSubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },

  /* List */
  listContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarLetter: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textOnPrimary,
  },
  profileInfo: { flex: 1 },
  profileName: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  profileMeta: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },

  /* Empty */
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  /* Footer */
  footer: { padding: SPACING.lg, alignItems: 'center' },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    width: '100%',
    height: TOUCH_TARGET.buttonHeight,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.sm,
    ...SHADOWS.md,
  },
  createButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textOnPrimary,
  },
  footerHint: { fontSize: FONTS.sizes.xs, color: COLORS.textLight },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.backgroundCard,
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xl,
    paddingTop: SPACING.md,
    ...SHADOWS.lg,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.borderLight,
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  modalButton: {
    height: TOUCH_TARGET.buttonHeight,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalButtonDisabled: {
    backgroundColor: COLORS.primaryLight,
    opacity: 0.6,
  },
  modalButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textOnPrimary,
  },
});
