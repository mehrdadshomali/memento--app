/**
 * Supabase Configuration
 * Secure database and authentication setup
 */

import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Secure storage adapter for tokens
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    await SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types matching the new schema
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      memory_cards: {
        Row: {
          id: string;
          profile_id: string;
          type: 'visual' | 'audio';
          correct_label: string;
          hint: string | null;
          relation: string | null;
          note: string | null;
          is_video: boolean;
          image_url: string | null;
          audio_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['memory_cards']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['memory_cards']['Insert']>;
      };
      routines: {
        Row: {
          id: string;
          profile_id: string;
          title: string;
          description: string | null;
          category: 'medication' | 'meal' | 'exercise' | 'appointment' | 'hygiene' | 'social' | 'other' | null;
          time: string;
          days: number[];
          is_enabled: boolean;
          icon: string | null;
          color: string | null;
          image_uri: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['routines']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['routines']['Insert']>;
      };
      routine_completions: {
        Row: {
          id: string;
          routine_id: string;
          profile_id: string;
          completed_at: string;
          date: string;
        };
        Insert: Omit<Database['public']['Tables']['routine_completions']['Row'], 'id' | 'completed_at'>;
        Update: Partial<Database['public']['Tables']['routine_completions']['Insert']>;
      };
      safety_profiles: {
        Row: {
          id: string;
          profile_id: string;
          full_name: string | null;
          phone_number: string | null;
          emergency_contact: string | null;
          home_latitude: number | null;
          home_longitude: number | null;
          home_address: string | null;
          home_name: string | null;
          is_monitoring_enabled: boolean;
          reminder_interval_minutes: number;
        };
        Insert: Omit<Database['public']['Tables']['safety_profiles']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['safety_profiles']['Insert']>;
      };
      game_sessions: {
        Row: {
          id: string;
          profile_id: string;
          total_cards: number | null;
          correct_answers: number | null;
          total_attempts: number | null;
          duration_seconds: number | null;
          completed_at: string;
        };
        Insert: Omit<Database['public']['Tables']['game_sessions']['Row'], 'id' | 'completed_at'>;
        Update: Partial<Database['public']['Tables']['game_sessions']['Insert']>;
      };
    };
  };
}
