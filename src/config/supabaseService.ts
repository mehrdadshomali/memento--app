/**
 * Memento - Supabase Service Layer
 * Profil ve kart verilerini Supabase ile senkronize eder.
 * Env değişkenleri (.env dosyası) ayarlanmadan önce offline (AsyncStorage) modunda çalışır.
 */

import { supabase } from './supabase';

// ─────────────────────────────────────────────────────────────
// Env kontrolü: Supabase yapılandırılmış mı?
// ─────────────────────────────────────────────────────────────
export const isSupabaseConfigured = (): boolean => {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
  return url.length > 10 && key.length > 10;
};

// ─────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────

export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// ─────────────────────────────────────────────────────────────
// PROFILES
// ─────────────────────────────────────────────────────────────

export const getProfileFromSupabase = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

export const createProfileInSupabase = async (userId: string, name: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert({ user_id: userId, name })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateProfileInSupabase = async (userId: string, updates: { name?: string }) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// ─────────────────────────────────────────────────────────────
// MEMORIES (Cards)
// ─────────────────────────────────────────────────────────────

export const getMemoriesFromSupabase = async (profileId: string) => {
  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const addMemoryToSupabase = async (profileId: string, memory: {
  title: string;
  description?: string;
  media_url?: string;
  media_type: 'photo' | 'video' | 'audio';
}) => {
  const { data, error } = await supabase
    .from('memories')
    .insert({ profile_id: profileId, ...memory })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteMemoryFromSupabase = async (memoryId: string) => {
  const { error } = await supabase
    .from('memories')
    .delete()
    .eq('id', memoryId);
  
  if (error) throw error;
};

// ─────────────────────────────────────────────────────────────
// MEDIA UPLOAD (Supabase Storage)
// ─────────────────────────────────────────────────────────────

export const uploadMediaToSupabase = async (
  userId: string,
  uri: string,
  mediaType: 'photo' | 'audio',
  fileName?: string
): Promise<string> => {
  const ext = mediaType === 'photo' ? 'jpg' : 'mp3';
  const name = fileName || `${Date.now()}.${ext}`;
  const path = `${userId}/${name}`;

  // URI'yi blob'a çevir
  const response = await fetch(uri);
  const blob = await response.blob();

  const { data, error } = await supabase.storage
    .from('memories')
    .upload(path, blob, {
      contentType: mediaType === 'photo' ? 'image/jpeg' : 'audio/mpeg',
      upsert: false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('memories')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
};

// ─────────────────────────────────────────────────────────────
// ROUTINES
// ─────────────────────────────────────────────────────────────

export const getRoutinesFromSupabase = async (profileId: string) => {
  const { data, error } = await supabase
    .from('routines')
    .select('*')
    .eq('profile_id', profileId)
    .order('time', { ascending: true });
  
  if (error) throw error;
  return data;
};

export const addRoutineToSupabase = async (profileId: string, routine: {
  title: string;
  time: string;
  days: string[];
  reminder_enabled?: boolean;
}) => {
  const { data, error } = await supabase
    .from('routines')
    .insert({ profile_id: profileId, ...routine })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteRoutineFromSupabase = async (routineId: string) => {
  const { error } = await supabase
    .from('routines')
    .delete()
    .eq('id', routineId);
  
  if (error) throw error;
};

// ─────────────────────────────────────────────────────────────
// LOCATION LOGGING (Supabase'e konum kaydet)
// ─────────────────────────────────────────────────────────────

export const logLocationToSupabase = async (
  profileId: string,
  latitude: number,
  longitude: number,
  accuracy?: number
) => {
  const { error } = await supabase
    .from('locations')
    .insert({
      profile_id: profileId,
      latitude,
      longitude,
      accuracy: accuracy || null,
    });
  
  if (error) {
    console.log('Location log error (non-critical):', error.message);
  }
};
