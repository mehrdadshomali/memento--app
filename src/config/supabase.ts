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

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          age: number;
          diagnosis: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      memories: {
        Row: {
          id: string;
          profile_id: string;
          title: string;
          description: string;
          media_url: string | null;
          media_type: 'photo' | 'video' | 'audio';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['memories']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['memories']['Insert']>;
      };
      routines: {
        Row: {
          id: string;
          profile_id: string;
          title: string;
          time: string;
          days: string[];
          reminder_enabled: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['routines']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['routines']['Insert']>;
      };
      locations: {
        Row: {
          id: string;
          profile_id: string;
          latitude: number;
          longitude: number;
          timestamp: string;
          accuracy: number | null;
        };
        Insert: Omit<Database['public']['Tables']['locations']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['locations']['Insert']>;
      };
      caregivers: {
        Row: {
          id: string;
          user_id: string;
          profile_id: string;
          relationship: string;
          permissions: string[];
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['caregivers']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['caregivers']['Insert']>;
      };
    };
  };
}
