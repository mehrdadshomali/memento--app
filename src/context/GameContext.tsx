/**
 * MemoBridge - Game Context
 * Manages game state and user progress
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, GameAction, GameSession, UserProgress, CardType } from '../types';

const initialProgress: UserProgress = {
  totalSessions: 0,
  lastPlayedDate: '',
  favoriteCards: [],
};

const initialState: AppState = {
  currentSession: null,
  userProgress: initialProgress,
  isLoading: true,
};

function gameReducer(state: AppState, action: GameAction): AppState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        currentSession: {
          currentCardIndex: 0,
          totalCards: action.payload.totalCards,
          correctAnswers: 0,
          attempts: 0,
          startTime: new Date(),
          gameType: action.payload.gameType,
        },
      };
    case 'NEXT_CARD':
      if (!state.currentSession) return state;
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          currentCardIndex: state.currentSession.currentCardIndex + 1,
          attempts: 0,
        },
      };
    case 'CORRECT_ANSWER':
      if (!state.currentSession) return state;
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          correctAnswers: state.currentSession.correctAnswers + 1,
        },
      };
    case 'INCREMENT_ATTEMPT':
      if (!state.currentSession) return state;
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          attempts: state.currentSession.attempts + 1,
        },
      };
    case 'END_GAME':
      return {
        ...state,
        currentSession: null,
        userProgress: {
          ...state.userProgress,
          totalSessions: state.userProgress.totalSessions + 1,
          lastPlayedDate: new Date().toISOString(),
        },
      };
    case 'RESET_GAME':
      return {
        ...state,
        currentSession: null,
      };
    default:
      return state;
  }
}

interface GameContextType {
  state: AppState;
  startGame: (gameType: CardType, totalCards: number) => void;
  nextCard: () => void;
  recordCorrectAnswer: () => void;
  incrementAttempt: () => void;
  endGame: () => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load saved progress on mount
  useEffect(() => {
    loadProgress();
  }, []);

  // Save progress when it changes
  useEffect(() => {
    if (!state.isLoading) {
      saveProgress();
    }
  }, [state.userProgress]);

  const loadProgress = async () => {
    try {
      const saved = await AsyncStorage.getItem('memobridge_progress');
      if (saved) {
        const progress = JSON.parse(saved) as UserProgress;
        // Update state with loaded progress
      }
    } catch (error) {
      console.log('Error loading progress:', error);
    }
  };

  const saveProgress = async () => {
    try {
      await AsyncStorage.setItem('memobridge_progress', JSON.stringify(state.userProgress));
    } catch (error) {
      console.log('Error saving progress:', error);
    }
  };

  const startGame = (gameType: CardType, totalCards: number) => {
    dispatch({ type: 'START_GAME', payload: { gameType, totalCards } });
  };

  const nextCard = () => dispatch({ type: 'NEXT_CARD' });
  const recordCorrectAnswer = () => dispatch({ type: 'CORRECT_ANSWER' });
  const incrementAttempt = () => dispatch({ type: 'INCREMENT_ATTEMPT' });
  const endGame = () => dispatch({ type: 'END_GAME' });
  const resetGame = () => dispatch({ type: 'RESET_GAME' });

  return (
    <GameContext.Provider
      value={{
        state,
        startGame,
        nextCard,
        recordCorrectAnswer,
        incrementAttempt,
        endGame,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
