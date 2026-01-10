/**
 * Memento - GameScreen
 * Kullanıcının kendi kartlarıyla oyun
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { GameCard, OptionButton } from '../components';
import { useGame } from '../context/GameContext';
import { useProfile } from '../context/ProfileContext';
import { useLanguage } from '../i18n';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { MemoryCard, CardType } from '../types';

type ButtonState = 'default' | 'correct' | 'fadeOut' | 'disabled';

interface GameScreenProps {
  navigation: any;
  route: {
    params: {
      gameType: CardType;
    };
  };
}

// Shuffle array helper
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Generate options for a card
const generateOptions = (correctCard: MemoryCard, allCards: MemoryCard[]): string[] => {
  const otherLabels = allCards
    .filter(card => card.id !== correctCard.id)
    .map(card => card.correctLabel);
  
  const shuffledOthers = shuffleArray(otherLabels).slice(0, 2);
  const options = [correctCard.correctLabel, ...shuffledOthers];
  
  return shuffleArray(options);
};

export function GameScreen({ navigation, route }: GameScreenProps) {
  const { gameType } = route.params;
  const { state, startGame, nextCard, recordCorrectAnswer, incrementAttempt, endGame } = useGame();
  const { currentProfile } = useProfile();
  const { t } = useLanguage();

  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [buttonStates, setButtonStates] = useState<Record<string, ButtonState>>({});
  const [showHint, setShowHint] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const allCardsForType = currentProfile?.cards.filter(c => c.type === gameType) || [];
  const currentCard = cards[currentIndex];

  useEffect(() => {
    const profileCards = currentProfile?.cards.filter(c => c.type === gameType) || [];
    const shuffledCards = shuffleArray(profileCards).slice(0, 5);
    setCards(shuffledCards);
    startGame(gameType, shuffledCards.length);
  }, [gameType, currentProfile]);

  useEffect(() => {
    if (currentCard && allCardsForType.length >= 3) {
      const newOptions = generateOptions(currentCard, allCardsForType);
      setOptions(newOptions);
      setButtonStates({});
      setShowHint(false);
      setIsTransitioning(false);
    }
  }, [currentCard, currentIndex]);

  const handleAnswer = useCallback((selectedLabel: string) => {
    if (isTransitioning || buttonStates[selectedLabel] === 'fadeOut') return;

    const isCorrect = selectedLabel === currentCard?.correctLabel;

    if (isCorrect) {
      setButtonStates(prev => ({ ...prev, [selectedLabel]: 'correct' }));
      recordCorrectAnswer();
      setIsTransitioning(true);

      setTimeout(() => {
        if (currentIndex < cards.length - 1) {
          setCurrentIndex(prev => prev + 1);
          nextCard();
        } else {
          handleGameComplete();
        }
      }, 1500);
    } else {
      setButtonStates(prev => ({ ...prev, [selectedLabel]: 'fadeOut' }));
      incrementAttempt();

      if ((state.currentSession?.attempts ?? 0) >= 1) {
        setShowHint(true);
      }
    }
  }, [currentCard, currentIndex, cards.length, isTransitioning, buttonStates, state.currentSession?.attempts]);

  const handleGameComplete = () => {
    endGame();
    Alert.alert(
      t.wonderful,
      t.greatJob,
      [
        {
          text: t.goHome,
          onPress: () => navigation.navigate('Home'),
          style: 'cancel',
        },
        {
          text: t.playAgain,
          onPress: () => {
            const profileCards = currentProfile?.cards.filter(c => c.type === gameType) || [];
            const shuffledCards = shuffleArray(profileCards).slice(0, 5);
            setCards(shuffledCards);
            setCurrentIndex(0);
            startGame(gameType, shuffledCards.length);
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleGoHome = () => {
    Alert.alert(
      t.goHomeQuestion,
      t.progressSaved,
      [
        { text: t.stay, style: 'cancel' },
        {
          text: t.goHome,
          onPress: () => {
            endGame();
            navigation.navigate('Home');
          },
        },
      ]
    );
  };

  const handlePlayAudio = () => {
    Alert.alert(t.soundPlaying, `${t.imagineHearing}: ${currentCard?.audioUri}`);
  };

  if (!currentCard) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t.loading}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const gameTitle = gameType === 'visual' ? t.whoIsThis : t.whatSound;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
          <Text style={styles.homeButtonText}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.progressContainer}>
          {cards.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index === currentIndex && styles.progressDotActive,
                index < currentIndex && styles.progressDotComplete,
              ]}
            />
          ))}
        </View>

        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.question}>{gameTitle}</Text>
        <View style={styles.questionDivider} />

        <GameCard card={currentCard} onPlayAudio={handlePlayAudio} showHint={showHint} />

        <View style={styles.optionsContainer}>
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
      </ScrollView>
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
    fontWeight: FONTS.weights.light,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  homeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.full,
  },
  homeButtonText: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.textSecondary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.borderLight,
  },
  progressDotActive: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
  progressDotComplete: {
    backgroundColor: COLORS.accent,
  },
  placeholder: {
    width: 44,
  },
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
  questionDivider: {
    width: 32,
    height: 1,
    backgroundColor: COLORS.primary,
    alignSelf: 'center',
    marginTop: SPACING.md,
  },
  optionsContainer: {
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
