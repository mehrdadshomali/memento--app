/**
 * Memento - Profile Select Screen
 * Profil seçme ve oluşturma ekranı
 */

import React, { useState } from 'react';
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
} from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useLanguage } from '../i18n';
import { useProfile } from '../context/ProfileContext';
import { UserProfile } from '../types';

export function ProfileSelectScreen() {
  const { t, language, setLanguage } = useLanguage();
  const { profiles, createProfile, selectProfile, deleteProfile, isLoading } = useProfile();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreateProfile = async () => {
    if (newName.trim().length < 2) return;
    await createProfile(newName.trim());
    setNewName('');
    setShowCreateModal(false);
  };

  const handleDeleteProfile = (profile: UserProfile) => {
    Alert.alert(
      t.deleteProfile,
      t.deleteConfirm,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.delete,
          style: 'destructive',
          onPress: () => deleteProfile(profile.id),
        },
      ]
    );
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'tr' : 'en');
  };

  const renderProfile = ({ item }: { item: UserProfile }) => (
    <TouchableOpacity
      style={styles.profileCard}
      onPress={() => selectProfile(item.id)}
      onLongPress={() => handleDeleteProfile(item)}
    >
      <View style={styles.profileAvatar}>
        <Text style={styles.avatarText}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>{item.name}</Text>
        <Text style={styles.profileCards}>
          {item.cards.length} {item.cards.length === 1 ? 'card' : 'cards'}
        </Text>
      </View>
      <Text style={styles.arrow}>→</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t.loading}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Language Toggle */}
      <TouchableOpacity style={styles.languageButton} onPress={toggleLanguage}>
        <Text style={styles.languageText}>
          {language === 'en' ? 'EN' : 'TR'}
        </Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t.appName}</Text>
        <View style={styles.divider} />
        <Text style={styles.subtitle}>{t.selectProfile}</Text>
      </View>

      {/* Profiles List */}
      {profiles.length > 0 ? (
        <FlatList
          data={profiles}
          renderItem={renderProfile}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>○</Text>
          <Text style={styles.emptyText}>{t.noProfiles}</Text>
        </View>
      )}

      {/* Create Profile Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.createButtonText}>+ {t.createProfile}</Text>
        </TouchableOpacity>
      </View>

      {/* Create Profile Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t.createProfile}</Text>
            
            <TextInput
              style={styles.input}
              placeholder={t.enterName}
              placeholderTextColor={COLORS.textMuted}
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => {
                  setNewName('');
                  setShowCreateModal(false);
                }}
              >
                <Text style={styles.modalButtonCancelText}>{t.cancel}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modalButtonCreate,
                  newName.trim().length < 2 && styles.modalButtonDisabled,
                ]}
                onPress={handleCreateProfile}
                disabled={newName.trim().length < 2}
              >
                <Text style={styles.modalButtonCreateText}>{t.create}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.textMuted,
  },
  languageButton: {
    position: 'absolute',
    top: SPACING.xxl + SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.backgroundCard,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    zIndex: 10,
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
    paddingTop: SPACING.xxxl,
    paddingBottom: SPACING.xl,
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
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textOnPrimary,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  profileCards: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
  },
  arrow: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.textLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 64,
    color: COLORS.textLight,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  footer: {
    padding: SPACING.lg,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  createButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textOnPrimary,
    letterSpacing: FONTS.letterSpacing.wide,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 400,
    ...SHADOWS.lg,
  },
  modalTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  input: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xl,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    backgroundColor: COLORS.backgroundMuted,
  },
  modalButtonCancelText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  modalButtonCreate: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
  modalButtonCreateText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textOnPrimary,
  },
});
