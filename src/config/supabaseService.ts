/**
 * Memento - Supabase Service Layer
 * Supabase ile iletişim kuran veritabanı fonksiyonları.
 */

import { supabase, Database } from './supabase';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type MemoryCardInsert = Database['public']['Tables']['memory_cards']['Insert'];
type RoutineInsert = Database['public']['Tables']['routines']['Insert'];
type RoutineCompletionInsert = Database['public']['Tables']['routine_completions']['Insert'];
type SafetyProfileInsert = Database['public']['Tables']['safety_profiles']['Insert'];
type GameSessionInsert = Database['public']['Tables']['game_sessions']['Insert'];

export const isSupabaseConfigured = (): boolean => {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
  return url.length > 10 && key.length > 10;
};

// ─────────────────────────────────────────────────────────────
// PROFILES
// ─────────────────────────────────────────────────────────────
export const getProfilesFromSupabase = async () => {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) throw error;
  return data;
};

export const createProfileInSupabase = async (profile: ProfileInsert) => {
  const { data, error } = await supabase.from('profiles').insert(profile).select().single();
  if (error) throw error;
  return data;
};

export const deleteProfileFromSupabase = async (profileId: string) => {
  const { error } = await supabase.from('profiles').delete().eq('id', profileId);
  if (error) throw error;
};

// ─────────────────────────────────────────────────────────────
// MEMORY CARDS
// ─────────────────────────────────────────────────────────────
export const getMemoryCardsFromSupabase = async (profileId: string) => {
  const { data, error } = await supabase
    .from('memory_cards')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const addMemoryCardToSupabase = async (card: MemoryCardInsert) => {
  const { data, error } = await supabase.from('memory_cards').insert(card).select().single();
  if (error) throw error;
  return data;
};

export const deleteMemoryCardFromSupabase = async (cardId: string) => {
  const { error } = await supabase.from('memory_cards').delete().eq('id', cardId);
  if (error) throw error;
};

export const updateMemoryCardInSupabase = async (cardId: string, updates: Partial<MemoryCardInsert>) => {
  const { data, error } = await supabase.from('memory_cards').update(updates).eq('id', cardId).select().single();
  if (error) throw error;
  return data;
};

// ─────────────────────────────────────────────────────────────
// MEDIA UPLOAD
// ─────────────────────────────────────────────────────────────
export const uploadMediaToSupabase = async (
  profileId: string,
  uri: string,
  mediaType: 'photo' | 'audio',
  fileName?: string
): Promise<string> => {
  const uriParts = uri.split('.');
  const extFromUri = uriParts[uriParts.length - 1];
  const ext = mediaType === 'photo' ? 'jpg' : (extFromUri === 'm4a' ? 'm4a' : 'm4a');
  const name = fileName || `${Date.now()}.${ext}`;
  const path = `${profileId}/${name}`;

  let uploadData: any;
  if (uri.startsWith('file://')) {
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
    uploadData = decode(base64);
  } else {
    const response = await fetch(uri);
    uploadData = await response.blob();
  }

  const { data, error } = await supabase.storage.from('memories').upload(path, uploadData, {
    contentType: mediaType === 'photo' ? 'image/jpeg' : 'audio/mp4', // mp4/m4a MIME type
    upsert: false,
  });

  if (error) throw error;

  const { data: urlData } = supabase.storage.from('memories').getPublicUrl(data.path);
  return urlData.publicUrl;
};

// ─────────────────────────────────────────────────────────────
// ROUTINES
// ─────────────────────────────────────────────────────────────
export const getRoutinesFromSupabase = async (profileId: string) => {
  const { data, error } = await supabase.from('routines').select('*').eq('profile_id', profileId);
  if (error) throw error;
  return data;
};

export const addRoutineToSupabase = async (routine: RoutineInsert) => {
  const { data, error } = await supabase.from('routines').insert(routine).select().single();
  if (error) throw error;
  return data;
};

export const deleteRoutineFromSupabase = async (routineId: string) => {
  const { error } = await supabase.from('routines').delete().eq('id', routineId);
  if (error) throw error;
};

// ─────────────────────────────────────────────────────────────
// ROUTINE COMPLETIONS
// ─────────────────────────────────────────────────────────────
export const getRoutineCompletionsFromSupabase = async (profileId: string, date: string) => {
  const { data, error } = await supabase
    .from('routine_completions')
    .select('*')
    .eq('profile_id', profileId)
    .eq('date', date);
  if (error) throw error;
  return data;
};

export const addRoutineCompletionToSupabase = async (completion: RoutineCompletionInsert) => {
  const { data, error } = await supabase.from('routine_completions').insert(completion).select().single();
  if (error) throw error;
  return data;
};

// ─────────────────────────────────────────────────────────────
// SAFETY PROFILE
// ─────────────────────────────────────────────────────────────
export const getSafetyProfileFromSupabase = async (profileId: string) => {
  const { data, error } = await supabase.from('safety_profiles').select('*').eq('profile_id', profileId).single();
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
  return data;
};

export const upsertSafetyProfileInSupabase = async (safetyProfile: SafetyProfileInsert) => {
  const { data, error } = await supabase
    .from('safety_profiles')
    .upsert(safetyProfile, { onConflict: 'profile_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
};

// ─────────────────────────────────────────────────────────────
// GAME SESSIONS
// ─────────────────────────────────────────────────────────────
export const addGameSessionToSupabase = async (session: GameSessionInsert) => {
  const { data, error } = await supabase.from('game_sessions').insert(session).select().single();
  if (error) throw error;
  return data;
};
