/**
 * Memento Caregiver Portal - Type Definitions
 */

export interface Patient {
  id: string;
  name: string;
  createdAt: string;
  lastActive?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
    timestamp: string;
    isHome: boolean;
  };
  homeLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export interface MemoryCard {
  id: string;
  imageUri: string;
  audioUri?: string;
  correctLabel: string;
  type: 'visual' | 'audio';
  category?: string;
  hint?: string;
  createdAt: string;
}

export interface Routine {
  id: string;
  title: string;
  description?: string;
  category: string;
  time: string;
  days: number[];
  isEnabled: boolean;
  icon: string;
  color: string;
}

export interface ActivityLog {
  id: string;
  type: 'game_played' | 'routine_completed' | 'location_alert' | 'app_opened';
  title: string;
  description?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface DailyStats {
  date: string;
  gamesPlayed: number;
  routinesCompleted: number;
  totalRoutines: number;
  timeSpentMinutes: number;
}

export interface PatientData {
  patient: Patient;
  cards: MemoryCard[];
  routines: Routine[];
  activities: ActivityLog[];
  stats: DailyStats[];
}
