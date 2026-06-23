/**
 * Memento - Routine Context (with Supabase Integration)
 * Günlük rutin ve hatırlatma yönetimi
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useProfile } from './ProfileContext';
import {
  isSupabaseConfigured,
  getRoutinesFromSupabase,
  addRoutineToSupabase,
  deleteRoutineFromSupabase,
  getRoutineCompletionsFromSupabase,
  addRoutineCompletionToSupabase,
} from '../config/supabaseService';
import { supabase } from '../config/supabase';

const ROUTINES_KEY = 'memento_routines';
const COMPLETIONS_KEY = 'memento_completions';

export type RoutineCategory = 'medication' | 'meal' | 'exercise' | 'appointment' | 'hygiene' | 'social' | 'other';

// Kategori ayarları
export const ROUTINE_CATEGORIES: Record<RoutineCategory, { icon: string; color: string; label: string; labelTr: string }> = {
  medication: { icon: 'medical', color: '#E57373', label: 'Medication', labelTr: 'İlaç' },
  meal: { icon: 'restaurant', color: '#FFB74D', label: 'Meal', labelTr: 'Yemek' },
  exercise: { icon: 'walk', color: '#81C784', label: 'Exercise', labelTr: 'Egzersiz' },
  appointment: { icon: 'calendar', color: '#64B5F6', label: 'Appointment', labelTr: 'Randevu' },
  hygiene: { icon: 'water', color: '#9575CD', label: 'Hygiene', labelTr: 'Hijyen' },
  social: { icon: 'people', color: '#F06292', label: 'Social', labelTr: 'Sosyal' },
  other: { icon: 'bookmark', color: '#90A4AE', label: 'Other', labelTr: 'Diğer' },
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
  imageUri?: string;
}

export interface RoutineCompletion {
  id?: string;
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
    if (currentProfile) {
      loadData(currentProfile.id);
    } else {
      setRoutines([]);
      setCompletions([]);
      setIsLoading(false);
    }
    setupNotifications();
  }, [currentProfile?.id]);

  const loadData = async (profileId: string) => {
    setIsLoading(true);
    try {
      let loadedRoutines: Routine[] = [];
      let loadedCompletions: RoutineCompletion[] = [];
      const isOnline = isSupabaseConfigured();

      if (isOnline) {
        try {
          const dbRoutines = await getRoutinesFromSupabase(profileId);
          loadedRoutines = dbRoutines.map(r => ({
            id: r.id,
            title: r.title,
            description: r.description || undefined,
            category: (r.category || 'other') as RoutineCategory,
            time: r.time,
            days: r.days,
            isEnabled: r.is_enabled,
            icon: r.icon || 'bookmark',
            color: r.color || '#90A4AE',
            createdAt: r.created_at,
            imageUri: r.image_uri || undefined,
          }));

          const today = new Date().toISOString().split('T')[0];
          const dbCompletions = await getRoutineCompletionsFromSupabase(profileId, today);
          loadedCompletions = dbCompletions.map(c => ({
            id: c.id,
            routineId: c.routine_id,
            completedAt: c.completed_at,
            date: c.date,
          }));

          await AsyncStorage.setItem(ROUTINES_KEY + '_' + profileId, JSON.stringify(loadedRoutines));
          await AsyncStorage.setItem(COMPLETIONS_KEY + '_' + profileId, JSON.stringify(loadedCompletions));
        } catch (e) {
          console.log('Error from Supabase, loading local routines...', e);
          const localRoutines = await AsyncStorage.getItem(ROUTINES_KEY + '_' + profileId);
          const localCompletions = await AsyncStorage.getItem(COMPLETIONS_KEY + '_' + profileId);
          if (localRoutines) loadedRoutines = JSON.parse(localRoutines);
          if (localCompletions) loadedCompletions = JSON.parse(localCompletions);
        }
      } else {
        const localRoutines = await AsyncStorage.getItem(ROUTINES_KEY + '_' + profileId);
        const localCompletions = await AsyncStorage.getItem(COMPLETIONS_KEY + '_' + profileId);
        if (localRoutines) loadedRoutines = JSON.parse(localRoutines);
        if (localCompletions) loadedCompletions = JSON.parse(localCompletions);
      }

      setRoutines(loadedRoutines);
      setCompletions(loadedCompletions);
    } catch (error) {
      console.log('Error loading routines:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveRoutinesLocally = async (newRoutines: Routine[]) => {
    if (!currentProfile) return;
    try {
      await AsyncStorage.setItem(ROUTINES_KEY + '_' + currentProfile.id, JSON.stringify(newRoutines));
      setRoutines(newRoutines);
    } catch (error) {
      console.log('Error saving routines:', error);
    }
  };

  const saveCompletionsLocally = async (newCompletions: RoutineCompletion[]) => {
    if (!currentProfile) return;
    try {
      await AsyncStorage.setItem(COMPLETIONS_KEY + '_' + currentProfile.id, JSON.stringify(newCompletions));
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
      if (routine.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(routine.notificationId);
      }

      const [hours, minutes] = routine.time.split(':').map(Number);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${routine.title}`,
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
      } catch (error) {}
    }
  };

  const addRoutine = async (routineData: Omit<Routine, 'id' | 'createdAt' | 'notificationId'>) => {
    if (!currentProfile) return;
    let newRoutine: Routine;

    if (isSupabaseConfigured()) {
      const dbRoutine = await addRoutineToSupabase({
        profile_id: currentProfile.id,
        title: routineData.title,
        description: routineData.description || null,
        category: routineData.category,
        time: routineData.time,
        days: routineData.days,
        is_enabled: routineData.isEnabled,
        icon: routineData.icon,
        color: routineData.color,
        image_uri: routineData.imageUri || null,
      });
      newRoutine = {
        ...routineData,
        id: dbRoutine.id,
        createdAt: dbRoutine.created_at,
      };
    } else {
      newRoutine = {
        ...routineData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
    }

    const notificationId = await scheduleNotification(newRoutine);
    newRoutine.notificationId = notificationId;

    const newRoutines = [...routines, newRoutine];
    await saveRoutinesLocally(newRoutines);
  };

  const updateRoutine = async (id: string, updates: Partial<Routine>) => {
    if (!currentProfile) return;
    const routine = routines.find((r) => r.id === id);
    if (!routine) return;

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('routines').update({
          title: updates.title,
          description: updates.description,
          category: updates.category,
          time: updates.time,
          days: updates.days,
          is_enabled: updates.isEnabled,
        }).eq('id', id);
      } catch(e){}
    }

    const updatedRoutine = { ...routine, ...updates };

    await cancelNotification(routine.notificationId);
    const notificationId = await scheduleNotification(updatedRoutine);
    updatedRoutine.notificationId = notificationId;

    const newRoutines = routines.map((r) => (r.id === id ? updatedRoutine : r));
    await saveRoutinesLocally(newRoutines);
  };

  const deleteRoutine = async (id: string) => {
    if (!currentProfile) return;

    if (isSupabaseConfigured()) {
      try { await deleteRoutineFromSupabase(id); } catch(e){}
    }

    const routine = routines.find((r) => r.id === id);
    if (routine?.notificationId) {
      await cancelNotification(routine.notificationId);
    }

    const newRoutines = routines.filter((r) => r.id !== id);
    await saveRoutinesLocally(newRoutines);
  };

  const toggleRoutine = async (id: string) => {
    const routine = routines.find(r => r.id === id);
    if (!routine) return;

    await updateRoutine(id, { isEnabled: !routine.isEnabled });
  };

  const completeRoutine = async (id: string) => {
    if (!currentProfile) return;
    const today = new Date().toISOString().split('T')[0];

    const alreadyCompleted = completions.some((c) => c.routineId === id && c.date === today);
    if (alreadyCompleted) return;

    let newCompletion: RoutineCompletion;

    if (isSupabaseConfigured()) {
      const dbCompletion = await addRoutineCompletionToSupabase({
        profile_id: currentProfile.id,
        routine_id: id,
        date: today,
      });
      newCompletion = {
        id: dbCompletion.id,
        routineId: id,
        completedAt: dbCompletion.completed_at,
        date: today,
      };
    } else {
      newCompletion = {
        routineId: id,
        completedAt: new Date().toISOString(),
        date: today,
      };
    }

    const newCompletions = [...completions, newCompletion];
    await saveCompletionsLocally(newCompletions);
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
