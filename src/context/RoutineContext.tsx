/**
 * Memento - Routine Context
 * Günlük rutin ve hatırlatma yönetimi (Supabase)
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '../config/supabase';
import { useAuth } from './AuthContext';
import { useProfile } from './ProfileContext';

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

export type RoutineCategory = 'medication' | 'meal' | 'exercise' | 'appointment' | 'hygiene' | 'social' | 'other';

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
  const { user } = useAuth();
  const { currentProfile } = useProfile();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [completions, setCompletions] = useState<RoutineCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setupNotifications();
  }, []);

  useEffect(() => {
    if (user && currentProfile) {
      loadData();
      subscribeToChanges();
    } else {
      setRoutines([]);
      setCompletions([]);
      setIsLoading(false);
    }
  }, [user, currentProfile]);

  const subscribeToChanges = () => {
    if (!currentProfile) return;

    const subscription = supabase
      .channel('routine-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'routines',
          filter: `profile_id=eq.${currentProfile.id}`,
        },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const loadData = async () => {
    if (!currentProfile) return;

    try {
      // Routines'leri yükle
      const { data: routinesData, error: routinesError } = await supabase
        .from('routines')
        .select('*')
        .eq('profile_id', currentProfile.id)
        .order('time', { ascending: true });

      if (routinesError) throw routinesError;

      if (routinesData) {
        const loadedRoutines: Routine[] = routinesData.map((r) => ({
          id: r.id,
          title: r.title,
          description: '',
          category: 'other' as RoutineCategory,
          time: r.time,
          days: r.days.map((d: string) => parseInt(d)),
          isEnabled: r.reminder_enabled,
          icon: '📌',
          color: '#90A4AE',
          createdAt: r.created_at,
        }));

        setRoutines(loadedRoutines);
      }

      // Completions için local storage kullan (geçici)
      // TODO: Completions tablosu eklenebilir
      setCompletions([]);
    } catch (error) {
      console.log('Error loading routines:', error);
    } finally {
      setIsLoading(false);
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
          hour: hours,
          minute: minutes,
          repeats: true,
        },
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
    if (!currentProfile) return;

    const { data, error } = await supabase
      .from('routines')
      .insert({
        profile_id: currentProfile.id,
        title: routineData.title,
        time: routineData.time,
        days: routineData.days.map(String),
        reminder_enabled: routineData.isEnabled,
      })
      .select()
      .single();

    if (error) throw error;

    const newRoutine: Routine = {
      ...routineData,
      id: data.id,
      createdAt: data.created_at,
    };

    // Bildirim planla
    const notificationId = await scheduleNotification(newRoutine);
    newRoutine.notificationId = notificationId;

    setRoutines([...routines, newRoutine]);
  };

  const updateRoutine = async (id: string, updates: Partial<Routine>) => {
    const routine = routines.find((r) => r.id === id);
    if (!routine) return;

    const { error } = await supabase
      .from('routines')
      .update({
        title: updates.title,
        time: updates.time,
        days: updates.days?.map(String),
        reminder_enabled: updates.isEnabled,
      })
      .eq('id', id);

    if (error) throw error;

    const updatedRoutine = { ...routine, ...updates };

    // Bildirim güncelle
    await cancelNotification(routine.notificationId);
    const notificationId = await scheduleNotification(updatedRoutine);
    updatedRoutine.notificationId = notificationId;

    setRoutines(routines.map((r) => (r.id === id ? updatedRoutine : r)));
  };

  const deleteRoutine = async (id: string) => {
    const routine = routines.find((r) => r.id === id);
    if (routine?.notificationId) {
      await cancelNotification(routine.notificationId);
    }

    const { error } = await supabase.from('routines').delete().eq('id', id);

    if (error) throw error;

    setRoutines(routines.filter((r) => r.id !== id));
  };

  const toggleRoutine = async (id: string) => {
    const routine = routines.find(r => r.id === id);
    if (!routine) return;

    await updateRoutine(id, { isEnabled: !routine.isEnabled });
  };

  const completeRoutine = async (id: string) => {
    const today = new Date().toISOString().split('T')[0];

    // Bugün zaten tamamlanmış mı kontrol et
    const alreadyCompleted = completions.some((c) => c.routineId === id && c.date === today);

    if (alreadyCompleted) return;

    const newCompletion: RoutineCompletion = {
      routineId: id,
      completedAt: new Date().toISOString(),
      date: today,
    };

    // TODO: Completions tablosu eklendiğinde Supabase'e kaydet
    setCompletions([...completions, newCompletion]);
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
