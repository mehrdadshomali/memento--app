/**
 * VoiceMessagesScreen — A therapeutic audio album for Alzheimer's patients
 * Replaces the stress-inducing audio quiz with a warm voice messages board.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '../context/ProfileContext';
import { useLanguage } from '../i18n';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { AnimatedHeader, FloatingActionButton, GradientCard } from '../components';

interface VoiceMessagesScreenProps {
  navigation: any;
}

export function VoiceMessagesScreen({ navigation }: VoiceMessagesScreenProps) {
  const { currentProfile } = useProfile();
  const { t, language } = useLanguage();
  
  const audioCards = currentProfile?.cards.filter(c => c.type === 'audio') || [];
  
  const [playingId, setPlayingId] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const handlePlayAudio = async (cardId: string, uri?: string) => {
    if (!uri) return;

    if (playingId === cardId) {
      // Durdur
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        setPlayingId(null);
      }
      return;
    }

    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      setPlayingId(cardId);

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, volume: 1.0 },
      );
      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingId(null);
          sound.unloadAsync();
          soundRef.current = null;
        }
        if (!status.isLoaded && status.error) {
          setPlayingId(null);
        }
      });
    } catch (error) {
      console.log('Audio playback error:', error);
      setPlayingId(null);
    }
  };

  const handleSendMessage = (personName: string) => {
    Alert.prompt(
      language === 'tr' ? `${personName}'a Mesaj Gönder` : `Send Message to ${personName}`,
      language === 'tr' 
        ? 'Ona ne söylemek istersiniz?' 
        : 'What would you like to tell them?',
      [
        { text: t.cancel, style: 'cancel' },
        { 
          text: language === 'tr' ? 'Gönder' : 'Send', 
          onPress: () => {
            Alert.alert(
              language === 'tr' ? 'Gönderildi' : 'Sent',
              language === 'tr' ? `Mesajınız başarıyla ${personName}'a iletildi.` : `Your message was sent to ${personName}.`
            );
          }
        }
      ],
      'plain-text'
    );
  };

  const handleAddMemory = () => {
    navigation.navigate('AddMemory', { type: 'audio' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedHeader 
        title={language === 'tr' ? 'Sesli Mesajlar' : 'Voice Messages'} 
        onBack={() => navigation.navigate('Home')} 
      />

      {audioCards.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="mic-outline" size={64} color={COLORS.textLight} style={{ marginBottom: SPACING.md }} />
          <Text style={styles.emptyTitle}>{language === 'tr' ? 'Mesaj Kutusu Boş' : 'No Messages'}</Text>
          <Text style={styles.emptySubtitle}>
            {language === 'tr' 
              ? 'Sevdiklerinizden gelen sesli mesajları dinlemek için ekleme yapın.' 
              : 'Add voice messages from your loved ones to listen.'}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {audioCards.map((card) => {
            const isPlaying = playingId === card.id;
            return (
              <View key={card.id} style={styles.messageCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitials}>{card.correctLabel.substring(0, 2).toUpperCase()}</Text>
                  </View>
                  <View style={styles.headerText}>
                    <Text style={styles.senderName}>{card.correctLabel}</Text>
                    {card.relation && <Text style={styles.relationText}>{card.relation}</Text>}
                  </View>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => navigation.navigate('AddMemory', { type: 'audio', card })}
                  >
                    <Ionicons name="pencil-outline" size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>

                {(card.note || card.hint) && (
                  <Text style={styles.noteText}>"{card.note || card.hint}"</Text>
                )}

                <View style={styles.actionsRow}>
                  <TouchableOpacity 
                    style={[styles.playButton, isPlaying && styles.playButtonActive]} 
                    onPress={() => handlePlayAudio(card.id, card.audioUri)}
                  >
                    <Ionicons name={isPlaying ? "stop" : "play"} size={24} color={isPlaying ? COLORS.danger : COLORS.textOnPrimary} />
                    <Text style={[styles.playButtonText, isPlaying && {color: COLORS.danger}]}>
                      {isPlaying 
                        ? (language === 'tr' ? 'Durdur' : 'Stop') 
                        : (language === 'tr' ? 'Sesi Dinle' : 'Listen')}
                    </Text>
                    {isPlaying && <Animated.View style={styles.pulseIndicator} />}
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.replyButton}
                    onPress={() => handleSendMessage(card.correctLabel)}
                  >
                    <Ionicons name="chatbubble-outline" size={24} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      <FloatingActionButton icon="add" onPress={handleAddMemory} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
    gap: SPACING.xl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  messageCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primaryLight + '40',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarInitials: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
  },
  headerText: {
    flex: 1,
  },
  senderName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  editButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  relationText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  noteText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.backgroundMuted,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  playButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.sm,
  },
  playButtonActive: {
    backgroundColor: COLORS.dangerLight,
  },
  playButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textOnPrimary,
  },
  replyButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseIndicator: {
    position: 'absolute',
    right: SPACING.md,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.danger,
  }
});
