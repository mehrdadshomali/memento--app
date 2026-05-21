/**
 * FamilyAlbumScreen — A therapeutic visual album for Alzheimer's patients
 * Replaces the stress-inducing visual quiz with a warm, memory-evoking album.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '../context/ProfileContext';
import { useLanguage } from '../i18n';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, ANIMATION } from '../constants/theme';
import { AnimatedHeader, FloatingActionButton } from '../components';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FamilyAlbumScreenProps {
  navigation: any;
}

export function FamilyAlbumScreen({ navigation }: FamilyAlbumScreenProps) {
  const { currentProfile } = useProfile();
  const { t, language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  const visualCards = currentProfile?.cards.filter(c => c.type === 'visual') || [];
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Fade out/in when scrolling between cards
  const onScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    if (currentIndex !== roundIndex) {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0.5, duration: 150, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      setCurrentIndex(roundIndex);
    }
  };

  const handleAddMemory = () => {
    navigation.navigate('AddMemory', { type: 'visual' });
  };

  if (visualCards.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <AnimatedHeader title={language === 'tr' ? 'Aile Albümü' : 'Family Album'} onBack={() => navigation.navigate('Home')} />
        <View style={styles.emptyContainer}>
          <Ionicons name="images-outline" size={64} color={COLORS.textLight} style={{ marginBottom: SPACING.md }} />
          <Text style={styles.emptyTitle}>{language === 'tr' ? 'Albümünüz Boş' : 'Album is Empty'}</Text>
          <Text style={styles.emptySubtitle}>
            {language === 'tr' 
              ? 'Sevdiklerinizin fotoğraflarını ve videolarını ekleyerek anılarınızı canlandırın.' 
              : 'Add photos and videos of your loved ones to bring back memories.'}
          </Text>
        </View>
        <FloatingActionButton icon="add" onPress={handleAddMemory} />
      </SafeAreaView>
    );
  }

  const currentCard = visualCards[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedHeader title={language === 'tr' ? 'Aile Albümü' : 'Family Album'} onBack={() => navigation.navigate('Home')} />

      <View style={styles.quoteContainer}>
        <Ionicons name="leaf-outline" size={16} color={COLORS.primary} style={{marginRight: SPACING.xs}} />
        <Text style={styles.quoteText}>
          {language === 'tr' 
            ? '“Anılar, kalbimizin ölümsüz misafirleridir.”' 
            : '“Memories are the immortal guests of our heart.”'}
        </Text>
      </View>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        style={styles.carousel}
      >
        {visualCards.map((card, index) => (
          <View key={card.id} style={styles.cardContainer}>
            <View style={styles.mediaFrame}>
              {card.isVideo ? (
                <Video
                  source={{ uri: card.imageUri }} // In our data model, imageUri holds the media path
                  style={styles.media}
                  useNativeControls
                  resizeMode={ResizeMode.COVER}
                  isLooping={false}
                />
              ) : (
                <Image source={{ uri: card.imageUri }} style={styles.media} />
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {currentCard && (
        <Animated.View style={[styles.infoContainer, { opacity: fadeAnim }]}>
          {(currentCard.note || currentCard.hint) && (
            <View style={styles.noteBox}>
              <Ionicons name="heart" size={24} color={COLORS.primary} style={styles.noteIcon} />
              <Text style={styles.noteText}>{currentCard.note || currentCard.hint}</Text>
              
              <TouchableOpacity 
                style={styles.editButton} 
                onPress={() => navigation.navigate('AddMemory', { type: 'visual', card: currentCard })}
              >
                <Ionicons name="pencil-outline" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      )}

      {/* Indicators */}
      <View style={styles.pagination}>
        {visualCards.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentIndex === index && styles.dotActive
            ]}
          />
        ))}
      </View>

      <FloatingActionButton icon="add" onPress={handleAddMemory} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  quoteContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  quoteText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontStyle: 'italic',
    fontWeight: FONTS.weights.medium,
    textAlign: 'center',
  },
  carousel: {
    flexGrow: 0,
    height: SCREEN_WIDTH * 1.1,
  },
  cardContainer: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  mediaFrame: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 8,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    ...SHADOWS.lg,
    elevation: 10,
  },
  media: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    alignItems: 'center',
  },
  noteBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryLight + '15',
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.primaryLight + '40',
    ...SHADOWS.sm,
  },
  noteIcon: {
    marginRight: SPACING.md,
    marginTop: 2,
  },
  noteText: {
    flex: 1,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
    lineHeight: 28,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
  },
  editButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
});
