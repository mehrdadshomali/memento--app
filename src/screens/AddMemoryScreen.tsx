/**
 * AddMemoryScreen — Form to add a new memory card (Visual Album or Voice Message)
 * Direct access from the Album/Messages screens
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedHeader } from '../components';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, TOUCH_TARGET } from '../constants/theme';
import { useLanguage } from '../i18n';
import { useProfile } from '../context/ProfileContext';
import { MemoryCard } from '../types';

interface AddMemoryScreenProps {
  navigation: any;
  route: { params: { type: 'visual' | 'audio'; card?: MemoryCard } };
}

export function AddMemoryScreen({ navigation, route }: AddMemoryScreenProps) {
  const { type, card } = route.params;
  const { t, language } = useLanguage();
  const { addCard, updateCard, deleteCard } = useProfile();

  const isEditMode = !!card;

  const [name, setName] = useState(card?.correctLabel === 'Anı' ? '' : (card?.correctLabel || ''));
  const [note, setNote] = useState(card?.note || card?.hint || '');
  
  // Media states
  const [imageUri, setImageUri] = useState<string | null>(card?.imageUri || null);
  const [isVideo, setIsVideo] = useState(card?.isVideo || false);
  const [audioUri, setAudioUri] = useState<string | null>(card?.audioUri || null);
  
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const isVisual = type === 'visual';

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      setIsVideo(asset.type === 'video');
    }
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(recording);
      } else {
        Alert.alert(language === 'tr' ? 'İzin Hatası' : 'Permission Error', language === 'tr' ? 'Mikrofon izni gereklidir.' : 'Microphone permission is required.');
      }
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      setRecording(null);
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = recording.getURI();
      if (uri) setAudioUri(uri);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const handleSave = async () => {
    if (!isVisual && !name.trim()) {
      Alert.alert(t.missingInfo || 'Error', t.enterName || 'Please enter a name');
      return;
    }
    if (isVisual && !note.trim()) {
      Alert.alert(t.missingInfo || 'Error', language === 'tr' ? 'Lütfen bir not yazın' : 'Please write a note');
      return;
    }
    if (isVisual && !imageUri) {
      Alert.alert(t.missingInfo || 'Error', language === 'tr' ? 'Lütfen bir fotoğraf veya video seçin' : 'Please select a photo or video');
      return;
    }
    if (!isVisual && !audioUri) {
      Alert.alert(t.missingInfo || 'Error', language === 'tr' ? 'Lütfen ses kaydedin' : 'Please record audio');
      return;
    }

    try {
      const cardData = {
        correctLabel: isVisual ? 'Anı' : name.trim(),
        type: type,
        imageUri: imageUri || '', // for audio, maybe an avatar or empty string
        audioUri: audioUri || undefined,
        note: note.trim() || undefined,
        isVideo: isVideo,
      };

      if (isEditMode) {
        await updateCard(card.id, cardData);
      } else {
        await addCard(cardData);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Could not save memory');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      language === 'tr' ? 'Sil' : 'Delete',
      language === 'tr' ? 'Bu anıyı silmek istediğinize emin misiniz?' : 'Are you sure you want to delete this memory?',
      [
        { text: t.cancel, style: 'cancel' },
        { 
          text: language === 'tr' ? 'Evet, Sil' : 'Yes, Delete',
          style: 'destructive',
          onPress: async () => {
            if (card) {
              await deleteCard(card.id);
              navigation.goBack();
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedHeader
        title={isEditMode 
          ? (language === 'tr' ? 'Düzenle' : 'Edit')
          : (isVisual ? (language === 'tr' ? 'Albüme Ekle' : 'Add to Album') : (language === 'tr' ? 'Mesaj Bırak' : 'Leave a Message'))}
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
              style={[styles.saveButton, (isVisual ? !note.trim() : !name.trim()) && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isVisual ? !note.trim() : !name.trim()}
          >
              <Text style={styles.saveButtonText}>{t.save}</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Media Selector */}
        <View style={styles.mediaSection}>
          {isVisual ? (
            <TouchableOpacity style={styles.imagePickerBtn} onPress={pickMedia}>
              {imageUri ? (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: imageUri }} style={styles.previewImage} />
                  {isVideo && (
                    <View style={styles.videoOverlay}>
                      <Ionicons name="play-circle" size={48} color="white" />
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.placeholderContainer}>
                  <Ionicons name="images" size={48} color={COLORS.primaryLight} />
                  <Text style={styles.placeholderText}>
                    {language === 'tr' ? 'Fotoğraf veya Video Seçin' : 'Select Photo or Video'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.audioRecorderContainer}>
              <Text style={styles.sectionLabel}>{language === 'tr' ? 'Ses Kaydı' : 'Voice Recording'}</Text>
              
              <TouchableOpacity
                style={[styles.recordBtn, recording && styles.recordingBtn]}
                onPress={recording ? stopRecording : startRecording}
              >
                <Ionicons name={recording ? "stop" : "mic"} size={32} color={COLORS.textOnPrimary} />
              </TouchableOpacity>
              
              <Text style={styles.recordStatus}>
                {recording 
                  ? (language === 'tr' ? 'Kaydediliyor... Durdurmak için dokunun' : 'Recording... Tap to stop') 
                  : (audioUri ? (language === 'tr' ? 'Kayıt alındı. Yeniden kaydetmek için dokunun' : 'Recorded. Tap to re-record') : (language === 'tr' ? 'Kayda başlamak için dokunun' : 'Tap to start recording'))
                }
              </Text>
            </View>
          )}
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          {!isVisual && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{language === 'tr' ? 'Kimin Sesi?' : 'Whose Voice?'}</Text>
              <TextInput
                style={styles.input}
                placeholder={language === 'tr' ? "Örn: Ayşe" : "e.g. Jane"}
                value={name}
                onChangeText={setName}
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {isVisual 
                ? (language === 'tr' ? 'Hatırlatıcı Not' : 'Reminder Note')
                : (language === 'tr' ? 'Mesaj Detayı' : 'Message Details')}
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={isVisual
                ? (language === 'tr' ? "Bu fotoğrafın anısı nedir? İçinizden geçenleri yazın..." : "What's the memory of this photo?")
                : (language === 'tr' ? "Ona ne söylemek istersiniz?" : "What would you like to tell them?")}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {isEditMode && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color={COLORS.danger} style={{marginRight: 8}} />
            <Text style={styles.deleteButtonText}>{language === 'tr' ? 'Bu Anıyı Sil' : 'Delete Memory'}</Text>
          </TouchableOpacity>
        )}

        <View style={{height: SPACING.xxxl}} />
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
  },
  mediaSection: {
    padding: SPACING.lg,
    paddingBottom: 0,
  },
  imagePickerBtn: {
    width: '100%',
    height: 250,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    borderStyle: 'dashed',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    marginTop: SPACING.sm,
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.medium,
  },
  audioRecorderContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  sectionLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  recordBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  recordingBtn: {
    backgroundColor: COLORS.danger,
    transform: [{ scale: 1.1 }],
  },
  recordStatus: {
    marginTop: SPACING.lg,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  formSection: {
    padding: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: FONTS.letterSpacing.wider,
  },
  input: {
    backgroundColor: COLORS.backgroundCard,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.dangerLight + '30',
    marginHorizontal: SPACING.lg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.danger + '40',
  },
  deleteButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.danger,
  },
});
