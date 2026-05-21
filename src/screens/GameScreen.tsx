/**
 * GameScreen — Memory exercise gameplay
 *
 * Features:
 *  - Step indicator with animated dots
 *  - Card entrance animation (spring)
 *  - Navigates to GameCompleteScreen on finish (no Alert)
 *  - Real audio playback with expo-av
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { GameCard, OptionButton } from '../components';
import { useGame } from '../context/GameContext';
import { useProfile } from '../context/ProfileContext';
import { useLanguage } from '../i18n';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, ANIMATION, TOUCH_TARGET } from '../constants/theme';
import { MemoryCard, CardType } from '../types';

type ButtonState = 'default' | 'correct' | 'fadeOut' | 'disabled';

interface GameScreenProps {
  navigation: any;
  route: { params: { gameType: CardType } };
}

/** Fisher-Yates shuffle */
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/** Pick 2 wrong answers + 1 correct, then shuffle */
const generateOptions = (correct: MemoryCard, all: MemoryCard[]): string[] => {
  const others = all
    .filter(c => c.id !== correct.id)
    .map(c => c.correctLabel);
  const wrongChoices = shuffleArray(others).slice(0, 2);
  return shuffleArray([correct.correctLabel, ...wrongChoices]);
};

export function GameScreen({ navigation, route }: GameScreenProps) {
  const { gameType } = route.params;
  const { state, startGame, nextCard, recordCorrectAnswer, incrementAttempt, endGame } = useGame();
  const { currentProfile } = useProfile();
  const { t, language } = useLanguage();

  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [buttonStates, setButtonStates] = useState<Record<string, ButtonState>>({});
  const [showHint, setShowHint] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const soundRef = useRef<Audio.Sound | null>(null);
  const questionFade = useRef(new Animated.Value(1)).current;

  const allCardsForType = currentProfile?.cards.filter(c => c.type === gameType) || [];
  const currentCard = cards[currentIndex];

  // Cleanup audio on unmount
  useEffect(() => {
    return () => { soundRef.current?.unloadAsync(); };
  }, []);

  // Initialize game
  useEffect(() => {
    const profileCards = currentProfile?.cards.filter(c => c.type === gameType) || [];
    const shuffledCards = shuffleArray(profileCards).slice(0, 5);
    setCards(shuffledCards);
    setCorrectCount(0);
    startGame(gameType, shuffledCards.length);
  }, [gameType, currentProfile]);

  // Update options when card changes
  useEffect(() => {
    if (currentCard) {
      const newOptions = generateOptions(currentCard, allCardsForType);
      setOptions(newOptions);
      setButtonStates({});
      setShowHint(false);
      setIsTransitioning(false);

      // Card entrance fade
      questionFade.setValue(0);
      Animated.timing(questionFade, {
        toValue: 1,
        duration: ANIMATION.duration.normal,
        useNativeDriver: true,
      }).start();
    }
  }, [currentCard, currentIndex]);

  const resetAndPlayAgain = useCallback(() => {
    const profileCards = currentProfile?.cards.filter(c => c.type === gameType) || [];
    const shuffledCards = shuffleArray(profileCards).slice(0, 5);
    setCards(shuffledCards);
    setCurrentIndex(0);
    setCorrectCount(0);
    startGame(gameType, shuffledCards.length);
  }, [currentProfile, gameType, startGame]);

  const handleAnswer = useCallback((selectedLabel: string) => {
    if (isTransitioning || buttonStates[selectedLabel] === 'fadeOut') return;

    const isCorrect = selectedLabel === currentCard?.correctLabel;

    if (isCorrect) {
      setButtonStates(prev => ({ ...prev, [selectedLabel]: 'correct' }));
      recordCorrectAnswer();
      setIsTransitioning(true);
      const newCount = correctCount + 1;
      setCorrectCount(newCount);

      setTimeout(() => {
        if (currentIndex < cards.length - 1) {
          setCurrentIndex(prev => prev + 1);
          nextCard();
        } else {
          endGame();
          navigation.navigate('GameComplete', {
            correctAnswers: newCount,
            totalCards: cards.length,
            gameType,
            onPlayAgain: resetAndPlayAgain,
          });
        }
      }, 1200);
    } else {
      setButtonStates(prev => ({ ...prev, [selectedLabel]: 'fadeOut' }));
      incrementAttempt();
      if ((state.currentSession?.attempts ?? 0) >= 1) {
        setShowHint(true);
      }
    }
  }, [currentCard, currentIndex, cards.length, isTransitioning, buttonStates, state.currentSession?.attempts, correctCount, resetAndPlayAgain]);

  const handleGoHome = () => {
    Alert.alert(
      t.goHomeQuestion,
      t.progressSaved,
      [
        { text: t.stay, style: 'cancel' },
        { text: t.goHome, onPress: () => { endGame(); navigation.navigate('Home'); } },
      ],
    );
  };

  /** Play audio with expo-av */
  const handlePlayAudio = useCallback(async () => {
    if (!currentCard?.audioUri) {
      Alert.alert(t.soundPlaying, t.imagineHearing);
      return;
    }
    if (isPlayingAudio) return;

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

      setIsPlayingAudio(true);

      const { sound } = await Audio.Sound.createAsync(
        { uri: currentCard.audioUri },
        { shouldPlay: true, volume: 1.0 },
      );
      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlayingAudio(false);
          sound.unloadAsync();
          soundRef.current = null;
        }
        if (!status.isLoaded && status.error) {
          setIsPlayingAudio(false);
        }
      });
    } catch (error) {
      console.log('Audio playback error:', error);
      setIsPlayingAudio(false);
      Alert.alert(t.soundPlaying, `${t.imagineHearing}: ${currentCard?.correctLabel}`);
    }
  }, [currentCard, isPlayingAudio, t]);

  // Empty state
  if (allCardsForType.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
            <Ionicons name="chevron-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.spacer} />
          <View style={styles.spacer} />
        </View>
        <View style={styles.centered}>
          <Ionicons name="images-outline" size={48} color={COLORS.textLight} style={{ marginBottom: SPACING.md }} />
          <Text style={styles.emptyText}>{t.noContent}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Loading state
  if (!currentCard) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>{t.loading}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const gameTitle = gameType === 'visual' ? t.whoIsThis : t.whatSound;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoHome}>
          <Ionicons name="chevron-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>

        {/* Step indicator */}
        <View style={styles.steps}>
          {cards.map((_, index) => (
            <View
              key={index}
              style={[
                styles.stepDot,
                index === currentIndex && styles.stepDotActive,
                index < currentIndex && styles.stepDotDone,
              ]}
            />
          ))}
        </View>

        <View style={styles.spacer} />
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: questionFade }}>
          <Text style={styles.question}>{gameTitle}</Text>
          <View style={styles.divider} />

          <GameCard
            card={currentCard}
            onPlayAudio={handlePlayAudio}
            showHint={showHint}
            isPlayingAudio={isPlayingAudio}
          />

          <View style={styles.optionsBlock}>
            {options.map((option) => (
              <OptionButton
                key={option}
                label={option}
                onPress={() => handleAnswer(option)}
                state={buttonStates[option] || 'default'}
                disabled={isTransitioning}
              />
            ))}
          </View>

          <View style={styles.encouragement}>
            <Text style={styles.encouragementText}>{t.encouragement}</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  emptyText: { fontSize: FONTS.sizes.lg, color: COLORS.textMuted, fontWeight: FONTS.weights.medium, textAlign: 'center' },

  /* Header */
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    width: TOUCH_TARGET.iconButton,
    height: TOUCH_TARGET.iconButton,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.backgroundMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacer: { width: TOUCH_TARGET.iconButton },

  /* Steps */
  steps: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.borderLight,
  },
  stepDotActive: {
    width: 28,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
  },
  stepDotDone: {
    backgroundColor: COLORS.accent,
  },

  /* Content */
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING.xxl,
  },
  question: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.light,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: SPACING.xl,
    marginHorizontal: SPACING.lg,
  },
  divider: {
    width: 36,
    height: 2,
    backgroundColor: COLORS.primary,
    alignSelf: 'center',
    marginTop: SPACING.md,
    borderRadius: 1,
  },
  optionsBlock: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  encouragement: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.xl,
  },
  encouragementText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
