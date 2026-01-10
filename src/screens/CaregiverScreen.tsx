/**
 * Memento - Caregiver Screen
 * Aile tarafından içerik ekleme ve yönetme
 */

import React, { useState, useRef } from 'react';
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
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useLanguage } from '../i18n';
import { useProfile } from '../context/ProfileContext';
import { MemoryCard, CardType } from '../types';

interface CaregiverScreenProps {
  navigation: any;
}

export function CaregiverScreen({ navigation }: CaregiverScreenProps) {
  const { t } = useLanguage();
  const { currentProfile, addCard, deleteCard } = useProfile();
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<CardType>('visual');
  const [newLabel, setNewLabel] = useState('');
  const [newHint, setNewHint] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CardType>('visual');
  
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const visualCards = currentProfile?.cards.filter(c => c.type === 'visual') || [];
  const audioCards = currentProfile?.cards.filter(c => c.type === 'audio') || [];

  // Image picker for visual cards
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow access to photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  // Image picker for audio card thumbnail
  const pickThumbnail = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow access to photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  // Start recording audio
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Please allow microphone access');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingDuration(0);

      // Start duration counter
      intervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.log('Failed to start recording:', error);
      Alert.alert('Error', 'Could not start recording');
    }
  };

  // Stop recording audio
  const stopRecording = async () => {
    if (!recordingRef.current) return;

    try {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      
      if (uri) {
        setSelectedAudio(uri);
      }

      recordingRef.current = null;
      setIsRecording(false);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

    } catch (error) {
      console.log('Failed to stop recording:', error);
    }
  };

  // Pick audio file from documents
  const pickAudioFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedAudio(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Failed to pick audio:', error);
    }
  };

  // Play selected audio preview
  const playAudioPreview = async () => {
    if (!selectedAudio) return;

    try {
      const { sound } = await Audio.Sound.createAsync({ uri: selectedAudio });
      await sound.playAsync();
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Failed to play audio:', error);
    }
  };

  const handleSaveCard = async () => {
    if (!newLabel.trim()) return;
    
    if (addType === 'visual' && !selectedImage) return;
    if (addType === 'audio' && (!selectedAudio || !selectedImage)) return;

    await addCard({
      imageUri: selectedImage!,
      audioUri: addType === 'audio' ? selectedAudio! : undefined,
      correctLabel: newLabel.trim(),
      type: addType,
      hint: newHint.trim() || undefined,
    });

    resetModal();
  };

  const resetModal = () => {
    setNewLabel('');
    setNewHint('');
    setSelectedImage(null);
    setSelectedAudio(null);
    setRecordingDuration(0);
    setShowAddModal(false);
  };

  const handleDeleteCard = (card: MemoryCard) => {
    Alert.alert(
      t.deleteCard,
      t.deleteCardConfirm,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.delete,
          style: 'destructive',
          onPress: () => deleteCard(card.id),
        },
      ]
    );
  };

  const openAddModal = (type: CardType) => {
    setAddType(type);
    setShowAddModal(true);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderCard = ({ item }: { item: MemoryCard }) => (
    <View style={styles.cardItem}>
      <Image source={{ uri: item.imageUri }} style={styles.cardImage} />
      <View style={styles.cardInfo}>
        <Text style={styles.cardLabel}>{item.correctLabel}</Text>
        {item.hint && <Text style={styles.cardHint}>{item.hint}</Text>}
        {item.type === 'audio' && (
          <Text style={styles.cardAudioBadge}>♪ Audio</Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteCard(item)}
      >
        <Text style={styles.deleteButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  const canSave = addType === 'visual' 
    ? (newLabel.trim() && selectedImage)
    : (newLabel.trim() && selectedImage && selectedAudio);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.caregiverMode}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Profile Info */}
      <View style={styles.profileBanner}>
        <View style={styles.profileAvatar}>
          <Text style={styles.avatarText}>
            {currentProfile?.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.profileName}>{currentProfile?.name}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'visual' && styles.tabActive]}
          onPress={() => setActiveTab('visual')}
        >
          <Text style={[styles.tabText, activeTab === 'visual' && styles.tabTextActive]}>
            {t.visualCards} ({visualCards.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'audio' && styles.tabActive]}
          onPress={() => setActiveTab('audio')}
        >
          <Text style={[styles.tabText, activeTab === 'audio' && styles.tabTextActive]}>
            {t.audioCards} ({audioCards.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content List */}
      <FlatList
        data={activeTab === 'visual' ? visualCards : audioCards}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>○</Text>
            <Text style={styles.emptyText}>{t.noContent}</Text>
            <Text style={styles.emptySubtext}>{t.addFirstContent}</Text>
          </View>
        }
      />

      {/* Add Buttons */}
      <View style={styles.addButtons}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => openAddModal('visual')}
        >
          <Text style={styles.addButtonText}>+ {t.addPhoto}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.addButton, styles.addButtonSecondary]}
          onPress={() => openAddModal('audio')}
        >
          <Text style={[styles.addButtonText, styles.addButtonTextSecondary]}>
            + {t.addSound}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add Card Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={resetModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {addType === 'visual' ? t.addPhoto : t.addSound}
              </Text>

              {/* Visual Card: Image Picker */}
              {addType === 'visual' && (
                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                  {selectedImage ? (
                    <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                  ) : (
                    <View style={styles.imagePickerPlaceholder}>
                      <Text style={styles.imagePickerIcon}>+</Text>
                      <Text style={styles.imagePickerText}>{t.selectImage}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}

              {/* Audio Card: Sound Recording/Selection */}
              {addType === 'audio' && (
                <>
                  {/* Audio Section */}
                  <Text style={styles.sectionLabel}>{t.recordSound}</Text>
                  <View style={styles.audioSection}>
                    {isRecording ? (
                      <View style={styles.recordingContainer}>
                        <View style={styles.recordingIndicator}>
                          <View style={styles.recordingDot} />
                          <Text style={styles.recordingText}>
                            Recording... {formatDuration(recordingDuration)}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.stopButton}
                          onPress={stopRecording}
                        >
                          <Text style={styles.stopButtonText}>■ Stop</Text>
                        </TouchableOpacity>
                      </View>
                    ) : selectedAudio ? (
                      <View style={styles.audioPreview}>
                        <TouchableOpacity
                          style={styles.playButton}
                          onPress={playAudioPreview}
                        >
                          <Text style={styles.playButtonText}>▶ Play</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.removeAudioButton}
                          onPress={() => setSelectedAudio(null)}
                        >
                          <Text style={styles.removeAudioText}>× Remove</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.audioButtons}>
                        <TouchableOpacity
                          style={styles.recordButton}
                          onPress={startRecording}
                        >
                          <Text style={styles.recordButtonIcon}>●</Text>
                          <Text style={styles.recordButtonText}>Record</Text>
                        </TouchableOpacity>
                        <Text style={styles.orText}>or</Text>
                        <TouchableOpacity
                          style={styles.fileButton}
                          onPress={pickAudioFile}
                        >
                          <Text style={styles.fileButtonText}>Select File</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  {/* Thumbnail for audio card */}
                  <Text style={styles.sectionLabel}>Thumbnail Image</Text>
                  <TouchableOpacity style={styles.thumbnailPicker} onPress={pickThumbnail}>
                    {selectedImage ? (
                      <Image source={{ uri: selectedImage }} style={styles.selectedThumbnail} />
                    ) : (
                      <View style={styles.thumbnailPlaceholder}>
                        <Text style={styles.thumbnailIcon}>+</Text>
                        <Text style={styles.thumbnailText}>Add Image</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </>
              )}

              {/* Label Input */}
              <Text style={styles.inputLabel}>
                {addType === 'visual' ? t.photoName : t.soundName}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={t.enterName}
                placeholderTextColor={COLORS.textMuted}
                value={newLabel}
                onChangeText={setNewLabel}
              />

              {/* Hint Input */}
              <Text style={styles.inputLabel}>{t.hintOptional}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.hintOptional}
                placeholderTextColor={COLORS.textMuted}
                value={newHint}
                onChangeText={setNewHint}
              />

              {/* Buttons */}
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalButtonCancel} onPress={resetModal}>
                  <Text style={styles.modalButtonCancelText}>{t.cancel}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButtonSave, !canSave && styles.modalButtonDisabled]}
                  onPress={handleSaveCard}
                  disabled={!canSave}
                >
                  <Text style={styles.modalButtonSaveText}>{t.save}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
    letterSpacing: FONTS.letterSpacing.wide,
  },
  placeholder: {
    width: 44,
  },
  profileBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.backgroundCard,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textOnPrimary,
  },
  profileName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
  },
  tabActive: {
    backgroundColor: COLORS.background,
    ...SHADOWS.sm,
  },
  tabText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.textPrimary,
    fontWeight: FONTS.weights.medium,
  },
  listContent: {
    padding: SPACING.lg,
    flexGrow: 1,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.backgroundMuted,
  },
  cardInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  cardLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
  },
  cardHint: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  cardAudioBadge: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  deleteButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 24,
    color: COLORS.textMuted,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyIcon: {
    fontSize: 48,
    color: COLORS.textLight,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  addButtons: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  addButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  addButtonSecondary: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  addButtonText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textOnPrimary,
  },
  addButtonTextSecondary: {
    color: COLORS.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  sectionLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  imagePicker: {
    height: 200,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: SPACING.xl,
  },
  imagePickerPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerIcon: {
    fontSize: 48,
    color: COLORS.textLight,
  },
  imagePickerText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  audioSection: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  audioButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  recordButtonIcon: {
    fontSize: 16,
    color: '#FF4444',
  },
  recordButtonText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textOnPrimary,
  },
  orText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
  },
  fileButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fileButtonText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  recordingContainer: {
    alignItems: 'center',
    gap: SPACING.md,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF4444',
  },
  recordingText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
  },
  stopButton: {
    backgroundColor: COLORS.backgroundMuted,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
  },
  stopButtonText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
  },
  audioPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  playButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
  },
  playButtonText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textOnPrimary,
  },
  removeAudioButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  removeAudioText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
  },
  thumbnailPicker: {
    height: 120,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  thumbnailPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailIcon: {
    fontSize: 32,
    color: COLORS.textLight,
  },
  thumbnailText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  selectedThumbnail: {
    width: '100%',
    height: '100%',
  },
  inputLabel: {
    fontSize: FONTS.sizes.sm,
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
    marginBottom: SPACING.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
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
  modalButtonSave: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
  modalButtonSaveText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textOnPrimary,
  },
});
