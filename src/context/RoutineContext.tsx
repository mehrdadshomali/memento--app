/**
 * Memento - Routine Context
 * Günlük rutin ve hatırlatma yönetimi
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useProfile } from './ProfileContext';

const ROUTINES_KEY = 'memento_routines';
const COMPLETIONS_KEY = 'memento_completions';

export type RoutineCategory = 'medication' | 'meal' | 'exercise' | 'appointment' | 'hygiene' | 'social' | 'other';

// Kategori ayarları
export const ROUTINE_CATEGORIES: Record<RoutineCategory, { icon: string; color: string; label: string; labelTr: string }> = {
  medication: { icon: '💊', color: '#E57373', label: 'Medication', labelTr: 'İlaç' },
  meal: { icon: '🍽️', color: '#FFB74D', label: 'Meal', labelTr: 'Yemek' },
  exercise: { icon: '🚶', color: '#81C784', label: 'Exercise', labelTr: 'Egzersiz' },
  appointment: { icon: '📅', color: '#64B5F6', label: 'Appointment', labelTr: 'Randevu' },
  hygiene: { icon: '🚿', color: '#9575CD', label: 'Hygiene', labelTr: 'Hijyen' },
  social: { icon: '👥', color: '#F06292', label: 'Social', labelTr: 'Sosyal' },
  other: { icon: '📌', color: '#90A4AE', label: 'Other', labelTr: 'Diğer' },
};

export const DAY_NAMES = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
export const DAY_NAMES_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export interface Routine {
  id: string;
  title: string;
  description?: string;
  category: RoutineCategory;
  time: string; // HH:MM format
  days: number[]; // 0-6 (Pazar-Cumartesi)
  isEnabled: boolean;
  icon: string;
  color: string;
  notificationId?: string;
  createdAt: string;
}

export interface RoutineCompletion {
  routineId: string;
  completedAt: string;
  date: string; // YYYY-MM-DD
}

interface RoutineContextType {
  routines: Routine[];
  completions: RoutineCompletion[];
  todayRoutines: Routine[];
  isLoading: boolean;
  addRoutine: (routine: Omit<Routine, 'id' | 'createdAt' | 'notificationId'>) => Promise<void>;
  updateRoutine: (id: string, updates: Partial<Routine>) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;
  toggleRoutine: (id: string) => Promise<void>;
  completeRoutine: (id: string) => Promise<void>;
  isCompletedToday: (id: string) => boolean;
  getCompletionRate: (days: number) => number;
}

const RoutineContext = createContext<RoutineContextType | undefined>(undefined);

export function RoutineProvider({ children }: { children: ReactNode }) {
  const { currentProfile } = useProfile();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [completions, setCompletions] = useState<RoutineCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
    setupNotifications();
  }, []);

  const loadData = async () => {
    try {
      const [routinesData, completionsData] = await Promise.all([
        AsyncStorage.getItem(ROUTINES_KEY),
        AsyncStorage.getItem(COMPLETIONS_KEY),
      ]);

      if (routinesData) {
        setRoutines(JSON.parse(routinesData));
      }
      if (completionsData) {
        const allCompletions = JSON.parse(completionsData) as RoutineCompletion[];
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentCompletions = allCompletions.filter((c) => new Date(c.date) >= thirtyDaysAgo);
        setCompletions(recentCompletions);
      }
    } catch (error) {
      console.log('Error loading routines:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveRoutines = async (newRoutines: Routine[]) => {
    try {
      await AsyncStorage.setItem(ROUTINES_KEY, JSON.stringify(newRoutines));
      setRoutines(newRoutines);
    } catch (error) {
      console.log('Error saving routines:', error);
    }
  };

  const saveCompletions = async (newCompletions: RoutineCompletion[]) => {
    try {
      await AsyncStorage.setItem(COMPLETIONS_KEY, JSON.stringify(newCompletions));
      setCompletions(newCompletions);
    } catch (error) {
      console.log('Error saving completions:', error);
    }
  };

  const setupNotifications = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      await Notifications.requestPermissionsAsync();
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('routine-reminders', {
        name: 'Routine Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#8B7355',
        sound: 'default',
      });
    }
  };

  const scheduleNotification = async (routine: Routine): Promise<string | undefined> => {
    if (!routine.isEnabled || routine.days.length === 0) return undefined;

    try {
      // Mevcut bildirimi iptal et
      if (routine.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(routine.notificationId);
      }

      const [hours, minutes] = routine.time.split(':').map(Number);
      const categoryInfo = ROUTINE_CATEGORIES[routine.category];

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${categoryInfo.icon} ${routine.title}`,
          body: routine.description || 'Hatırlatma zamanı!',
          data: { routineId: routine.id },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: hours,
          minute: minutes,
          repeats: true,
        } as Notifications.CalendarTriggerInput,
      });

      return notificationId;
    } catch (error) {
      console.log('Error scheduling notification:', error);
      return undefined;
    }
  };

  const cancelNotification = async (notificationId?: string) => {
    if (notificationId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      } catch (error) {
        console.log('Error canceling notification:', error);
      }
    }
  };

  const addRoutine = async (routineData: Omit<Routine, 'id' | 'createdAt' | 'notificationId'>) => {
    const newRoutine: Routine = {
      ...routineData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    // Bildirim planla
    const notificationId = await scheduleNotification(newRoutine);
    newRoutine.notificationId = notificationId;

    const newRoutines = [...routines, newRoutine];
    await saveRoutines(newRoutines);
  };

  const updateRoutine = async (id: string, updates: Partial<Routine>) => {
    const routine = routines.find((r) => r.id === id);
    if (!routine) return;

    const updatedRoutine = { ...routine, ...updates };

    // Bildirim güncelle
    await cancelNotification(routine.notificationId);
    const notificationId = await scheduleNotification(updatedRoutine);
    updatedRoutine.notificationId = notificationId;

    const newRoutines = routines.map((r) => (r.id === id ? updatedRoutine : r));
    await saveRoutines(newRoutines);
  };

  const deleteRoutine = async (id: string) => {
    const routine = routines.find((r) => r.id === id);
    if (routine?.notificationId) {
      await cancelNotification(routine.notificationId);
    }

    const newRoutines = routines.filter((r) => r.id !== id);
    await saveRoutines(newRoutines);
  };

  const toggleRoutine = async (id: string) => {
    const routine = routines.find(r => r.id === id);
    if (!routine) return;

    await updateRoutine(id, { isEnabled: !routine.isEnabled });
  };

  const completeRoutine = async (id: string) => {
    const today = new Date().toISOString().split('T')[0];

    const alreadyCompleted = completions.some((c) => c.routineId === id && c.date === today);

    if (alreadyCompleted) return;

    const newCompletion: RoutineCompletion = {
      routineId: id,
      completedAt: new Date().toISOString(),
      date: today,
    };

    const newCompletions = [...completions, newCompletion];
    await saveCompletions(newCompletions);
  };

  const isCompletedToday = (id: string): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return completions.some(c => c.routineId === id && c.date === today);
  };

  const getCompletionRate = (days: number): number => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const relevantCompletions = completions.filter(
      c => new Date(c.date) >= startDate
    );

    const totalPossible = routines.filter(r => r.isEnabled).length * days;
    if (totalPossible === 0) return 0;

    return Math.round((relevantCompletions.length / totalPossible) * 100);
  };

  // Bugünün rutinleri
  const todayRoutines = routines
    .filter(r => {
      const today = new Date().getDay();
      return r.isEnabled && r.days.includes(today);
    })
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <RoutineContext.Provider
      value={{
        routines,
        completions,
        todayRoutines,
        isLoading,
        addRoutine,
        updateRoutine,
        deleteRoutine,
        toggleRoutine,
        completeRoutine,
        isCompletedToday,
        getCompletionRate,
      }}
    >
      {children}
    </RoutineContext.Provider>
  );
}

export function useRoutine() {
  const context = useContext(RoutineContext);
  if (!context) {
    throw new Error('useRoutine must be used within a RoutineProvider');
  }
  return context;
}
