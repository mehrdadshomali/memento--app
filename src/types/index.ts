/**
 * Memento - Core Type Definitions
 */

export type CardType = 'visual' | 'audio';

export interface MemoryCard {
  id: string;
  imageUri: string;
  audioUri?: string;
  correctLabel: string;
  type: CardType;
  category?: string;
  hint?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  createdAt: string;
  cards: MemoryCard[];
}

export interface GameSession {
  currentCardIndex: number;
  totalCards: number;
  correctAnswers: number;
  attempts: number;
  startTime: Date;
  gameType: CardType;
}

export interface UserProgress {
  totalSessions: number;
  lastPlayedDate: string;
  favoriteCards: string[];
}

export interface AppState {
  currentSession: GameSession | null;
  userProgress: UserProgress;
  isLoading: boolean;
}

export type GameAction =
  | { type: 'START_GAME'; payload: { gameType: CardType; totalCards: number } }
  | { type: 'NEXT_CARD' }
  | { type: 'CORRECT_ANSWER' }
  | { type: 'INCREMENT_ATTEMPT' }
  | { type: 'END_GAME' }
  | { type: 'RESET_GAME' };
