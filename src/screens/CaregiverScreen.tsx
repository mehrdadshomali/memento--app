/**
 * CaregiverScreen — Content management for caregivers
 *
 * Features:
 *  - AnimatedHeader with analytics shortcut
 *  - Animated tab underline indicator
 *  - Card list with swipe-friendly delete
 *  - FloatingActionButton for add photo/sound
 *  - Bottom-sheet modal for content creation
 *  - Real audio recording with expo-av
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
  Animated,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedHeader, FloatingActionButton } from '../components';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, ANIMATION, TOUCH_TARGET } from '../constants/theme';
import { useLanguage } from '../i18n';
import { useProfile } from '../context/ProfileContext';
import { MemoryCard, CardType } from '../types';

interface CaregiverScreenProps {
  navigation: any;
}

export function CaregiverScreen({ navigation }: CaregiverScreenProps) {
  const { t, language } = useLanguage();
  const { currentProfile, addCard, deleteCard } = useProfile();

  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<CardType>('visual');
  const [newLabel, setNewLabel] = useState('');
  const [newHint, setNewHint] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CardType>('visual');

  // Recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Tab underline animation
  const tabAnim = useRef(new Animated.Value(0)).current;

  const visualCards = currentProfile?.cards.filter(c => c.type === 'visual') || [];
  const audioCards = currentProfile?.cards.filter(c => c.type === 'audio') || [];

  const switchTab = (tab: CardType) => {
    setActiveTab(tab);
    Animated.spring(tabAnim, {
      toValue: tab === 'visual' ? 0 : 1,
      ...ANIMATION.spring.default,
      useNativeDriver: true,
    }).start();
  };

  // ─── Image Picking ──────────────────────────────────
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

  // ─── Audio Recording ────────────────────────────────
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Please allow microphone access');
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingDuration(0);
      intervalRef.current = setInterval(() => setRecordingDuration(prev => prev + 1), 1000);
    } catch (error) {
      console.log('Recording start error:', error);
      Alert.alert('Error', 'Could not start recording');
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;
    try {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      if (uri) setSelectedAudio(uri);
      recordingRef.current = null;
      setIsRecording(false);
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    } catch (error) {
      console.log('Recording stop error:', error);
    }
  };

  const pickAudioFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*', copyToCacheDirectory: true });
      if (!result.canceled && result.assets[0]) {
        setSelectedAudio(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Audio file pick error:', error);
    }
  };

  const playAudioPreview = async () => {
    if (!selectedAudio) return;
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: selectedAudio });
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) sound.unloadAsync();
      });
    } catch (error) {
      console.log('Audio preview error:', error);
    }
  };

  // ─── Save / Delete ──────────────────────────────────
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
    Alert.alert(t.deleteCard, t.deleteCardConfirm, [
      { text: t.cancel, style: 'cancel' },
      { text: t.delete, style: 'destructive', onPress: () => deleteCard(card.id) },
    ]);
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

  const canSave = addType === 'visual'
    ? (newLabel.trim() && selectedImage)
    : (newLabel.trim() && selectedImage && selectedAudio);

  // ─── Render card item ───────────────────────────────
  const renderCard = ({ item }: { item: MemoryCard }) => (
    <View style={styles.cardItem}>
      <Image source={{ uri: item.imageUri }} style={styles.cardThumb} />
      <View style={styles.cardInfo}>
        <Text style={styles.cardLabel}>{item.correctLabel}</Text>
        {item.hint && <Text style={styles.cardHint}>{item.hint}</Text>}
        {item.type === 'audio' && (
          <View style={styles.audioBadge}>
            <Ionicons name="musical-note" size={12} color={COLORS.primary} />
            <Text style={styles.audioBadgeText}>Audio</Text>
          </View>
        )}
      </View>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => handleDeleteCard(item)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="trash-outline" size={18} color={COLORS.textMuted} />
      </TouchableOpacity>
    </View>
  );

  // ─── Tab underline position ─────────────────────────
  const underlineTranslateX = tabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1], // will be multiplied by tab width
  });

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedHeader
        title={t.caregiverMode}
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            style={styles.analyticsBtn}
            onPress={() => navigation.navigate('Analytics')}
            activeOpacity={0.7}
          >
            <Ionicons name="stats-chart-outline" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        }
      />

      {/* Profile banner */}
      <View style={styles.banner}>
        <View style={styles.bannerAvatar}>
          <Text style={styles.bannerAvatarText}>
            {currentProfile?.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.bannerName}>{currentProfile?.name}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tab} onPress={() => switchTab('visual')}>
          <Text style={[styles.tabText, activeTab === 'visual' && styles.tabTextActive]}>
            {t.visualCards} ({visualCards.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => switchTab('audio')}>
          <Text style={[styles.tabText, activeTab === 'audio' && styles.tabTextActive]}>
            {t.audioCards} ({audioCards.length})
          </Text>
        </TouchableOpacity>

        {/* Animated underline */}
        <Animated.View
          style={[
            styles.tabUnderline,
            {
              transform: [{
                translateX: tabAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 170], // approx half-width
                }),
              }],
            },
          ]}
        />
      </View>

      {/* List */}
      <FlatList
        data={activeTab === 'visual' ? visualCards : audioCards}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name={activeTab === 'visual' ? 'images-outline' : 'musical-notes-outline'}
              size={48}
              color={COLORS.textLight}
              style={{ marginBottom: SPACING.md }}
            />
            <Text style={styles.emptyTitle}>{t.noContent}</Text>
            <Text style={styles.emptySubtitle}>{t.addFirstContent}</Text>
          </View>
        }
      />

      {/* FAB */}
      <FloatingActionButton
        actions={[
          {
            icon: 'camera-outline',
            label: t.addPhoto,
            onPress: () => openAddModal('visual'),
            color: COLORS.primary,
          },
          {
            icon: 'mic-outline',
            label: t.addSound,
            onPress: () => openAddModal('audio'),
            color: COLORS.accent,
          },
        ]}
      />

      {/* Add Modal */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={resetModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHandle} />

              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {addType === 'visual' ? t.addPhoto : t.addSound}
                </Text>
                <TouchableOpacity onPress={resetModal} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                  <Ionicons name="close" size={22} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Image picker (visual) */}
              {addType === 'visual' && (
                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                  {selectedImage ? (
                    <Image source={{ uri: selectedImage }} style={styles.pickedImage} />
                  ) : (
                    <View style={styles.pickerPlaceholder}>
                      <Ionicons name="camera-outline" size={36} color={COLORS.textLight} />
                      <Text style={styles.pickerText}>{t.selectImage}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}

              {/* Audio section */}
              {addType === 'audio' && (
                <>
                  <Text style={styles.fieldLabel}>{t.recordSound}</Text>
                  <View style={styles.audioSection}>
                    {isRecording ? (
                      <View style={styles.recordingState}>
                        <View style={styles.recordingDot} />
                        <Text style={styles.recordingTimer}>
                          {language === 'tr' ? 'Kaydediliyor' : 'Recording'}... {formatDuration(recordingDuration)}
                        </Text>
                        <TouchableOpacity style={styles.stopBtn} onPress={stopRecording}>
                          <Ionicons name="stop" size={18} color={COLORS.textOnPrimary} />
                          <Text style={styles.stopBtnText}>Stop</Text>
                        </TouchableOpacity>
                      </View>
                    ) : selectedAudio ? (
                      <View style={styles.audioPreview}>
                        <TouchableOpacity style={styles.playBtn} onPress={playAudioPreview}>
                          <Ionicons name="play" size={18} color={COLORS.textOnPrimary} />
                          <Text style={styles.playBtnText}>{language === 'tr' ? 'Oynat' : 'Play'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.removeBtn} onPress={() => setSelectedAudio(null)}>
                          <Ionicons name="close-circle-outline" size={18} color={COLORS.danger} />
                          <Text style={styles.removeBtnText}>{language === 'tr' ? 'Kaldır' : 'Remove'}</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.audioButtons}>
                        <TouchableOpacity style={styles.recordBtn} onPress={startRecording}>
                          <View style={styles.recordDotIcon} />
                          <Text style={styles.recordBtnText}>{language === 'tr' ? 'Kaydet' : 'Record'}</Text>
                        </TouchableOpacity>
                        <Text style={styles.orText}>{language === 'tr' ? 'veya' : 'or'}</Text>
                        <TouchableOpacity style={styles.fileBtn} onPress={pickAudioFile}>
                          <Ionicons name="document-outline" size={18} color={COLORS.textSecondary} />
                          <Text style={styles.fileBtnText}>{language === 'tr' ? 'Dosya Seç' : 'Select File'}</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  {/* Thumbnail */}
                  <Text style={styles.fieldLabel}>{language === 'tr' ? 'Küçük Resim' : 'Thumbnail Image'}</Text>
                  <TouchableOpacity style={styles.thumbnailPicker} onPress={pickThumbnail}>
                    {selectedImage ? (
                      <Image source={{ uri: selectedImage }} style={styles.pickedThumb} />
                    ) : (
                      <View style={styles.pickerPlaceholder}>
                        <Ionicons name="image-outline" size={28} color={COLORS.textLight} />
                        <Text style={styles.pickerTextSm}>{language === 'tr' ? 'Resim Ekle' : 'Add Image'}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </>
              )}

              {/* Label */}
              <Text style={styles.fieldLabel}>
                {addType === 'visual' ? t.photoName : t.soundName}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={t.enterName}
                placeholderTextColor={COLORS.textLight}
                value={newLabel}
                onChangeText={setNewLabel}
              />

              {/* Hint */}
              <Text style={styles.fieldLabel}>{t.hintOptional}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.hintOptional}
                placeholderTextColor={COLORS.textLight}
                value={newHint}
                onChangeText={setNewHint}
              />

              {/* Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={resetModal}>
                  <Text style={styles.cancelBtnText}>{t.cancel}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
                  onPress={handleSaveCard}
                  disabled={!canSave}
                >
                  <Text style={styles.saveBtnText}>{t.save}</Text>
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
  container: { flex: 1, backgroundColor: COLORS.background },

  /* Analytics shortcut */
  analyticsBtn: {
    width: TOUCH_TARGET.iconButton,
    height: TOUCH_TARGET.iconButton,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.backgroundMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Banner */
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.sm,
  },
  bannerAvatar: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  bannerAvatarText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textOnPrimary,
  },
  bannerName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
  },

  /* Tabs */
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  tabText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: FONTS.weights.semibold,
  },
  tabUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    width: '50%',
    height: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 1,
  },

  /* List */
  listContent: {
    padding: SPACING.lg,
    paddingBottom: 120,
    flexGrow: 1,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  cardThumb: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.backgroundMuted,
  },
  cardInfo: { flex: 1, marginLeft: SPACING.md },
  cardLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
  },
  cardHint: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  audioBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    gap: 4,
  },
  audioBadgeText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.primary,
    fontWeight: FONTS.weights.medium,
  },
  deleteBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Empty */
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    maxWidth: 260,
  },

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
    maxHeight: '92%',
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
    marginBottom: SPACING.xl,
  },
  modalTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },

  /* Image picker */
  imagePicker: {
    height: 200,
    backgroundColor: COLORS.backgroundMuted,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: SPACING.xl,
  },
  pickerPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
  pickerTextSm: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  pickedImage: { width: '100%', height: '100%' },

  /* Thumbnail */
  thumbnailPicker: {
    height: 100,
    backgroundColor: COLORS.backgroundMuted,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  pickedThumb: { width: '100%', height: '100%' },

  /* Audio section */
  audioSection: {
    backgroundColor: COLORS.backgroundMuted,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  audioButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  recordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  recordDotIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.danger,
  },
  recordBtnText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textOnPrimary,
  },
  orText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
  },
  fileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  fileBtnText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  recordingState: {
    alignItems: 'center',
    gap: SPACING.md,
  },
  recordingDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.danger,
  },
  recordingTimer: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
  },
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.textSecondary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.xs,
  },
  stopBtnText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textOnPrimary,
  },
  audioPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.xs,
  },
  playBtnText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textOnPrimary,
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  removeBtnText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.danger,
    fontWeight: FONTS.weights.medium,
  },

  /* Fields */
  fieldLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
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

  /* Modal actions */
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  cancelBtn: {
    flex: 1,
    height: TOUCH_TARGET.buttonHeight,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.backgroundMuted,
  },
  cancelBtnText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
  },
  saveBtn: {
    flex: 1,
    height: TOUCH_TARGET.buttonHeight,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary,
  },
  saveBtnDisabled: {
    backgroundColor: COLORS.primaryLight,
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textOnPrimary,
  },
});
