/**
 * Memento - Profile Context (with Supabase Integration)
 * Kullanıcı profilleri ve içerik yönetimi (Supabase + Local Storage Fallback)
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, MemoryCard } from '../types';
import {
  isSupabaseConfigured,
  getProfilesFromSupabase,
  createProfileInSupabase,
  deleteProfileFromSupabase,
  getMemoryCardsFromSupabase,
  addMemoryCardToSupabase,
  deleteMemoryCardFromSupabase,
  updateMemoryCardInSupabase,
  uploadMediaToSupabase,
} from '../config/supabaseService';

const PROFILES_KEY = 'memento_profiles';
const CURRENT_PROFILE_KEY = 'memento_current_profile';

interface ProfileContextType {
  profiles: UserProfile[];
  currentProfile: UserProfile | null;
  isLoading: boolean;
  createProfile: (name: string) => Promise<UserProfile>;
  selectProfile: (profileId: string) => void;
  deleteProfile: (profileId: string) => Promise<void>;
  addCard: (card: Omit<MemoryCard, 'id'>) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  updateCard: (cardId: string, updates: Partial<MemoryCard>) => Promise<void>;
  logout: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      let loadedProfiles: UserProfile[] = [];
      const isOnline = isSupabaseConfigured(); // Gerçek uygulamada NetInfo da eklenebilir

      if (isOnline) {
        try {
          const dbProfiles = await getProfilesFromSupabase();
          // Her profilin kartlarını da çekmemiz lazım
          loadedProfiles = await Promise.all(
            dbProfiles.map(async (p) => {
              const dbCards = await getMemoryCardsFromSupabase(p.id);
              const mappedCards: MemoryCard[] = dbCards.map(c => ({
                id: c.id,
                type: c.type,
                correctLabel: c.correct_label,
                hint: c.hint || undefined,
                relation: c.relation || undefined,
                note: c.note || undefined,
                isVideo: c.is_video,
                imageUri: c.image_url || '',
                audioUri: c.audio_url || undefined,
              }));
              return {
                id: p.id,
                name: p.name,
                createdAt: p.created_at,
                cards: mappedCards,
              };
            })
          );
          // AsyncStorage'i güncelle (offline önbellek)
          await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(loadedProfiles));
        } catch (e) {
          console.log('Supabase load error, falling back to local storage', e);
          loadedProfiles = await loadFromLocal();
        }
      } else {
        loadedProfiles = await loadFromLocal();
      }

      setProfiles(loadedProfiles);
      
      const currentId = await AsyncStorage.getItem(CURRENT_PROFILE_KEY);
      if (currentId) {
        const current = loadedProfiles.find((p) => p.id === currentId);
        if (current) setCurrentProfile(current);
      }
    } catch (error) {
      console.log('Error loading profiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromLocal = async (): Promise<UserProfile[]> => {
    const profilesData = await AsyncStorage.getItem(PROFILES_KEY);
    return profilesData ? JSON.parse(profilesData) : [];
  };

  const saveProfilesLocally = async (newProfiles: UserProfile[]) => {
    try {
      await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(newProfiles));
      setProfiles(newProfiles);
    } catch (error) {
      console.log('Error saving profiles locally:', error);
    }
  };

  const createProfile = async (name: string): Promise<UserProfile> => {
    let newProfile: UserProfile;

    if (isSupabaseConfigured()) {
      const dbProfile = await createProfileInSupabase({ name: name.trim(), user_id: null, avatar_url: null });
      newProfile = {
        id: dbProfile.id,
        name: dbProfile.name,
        createdAt: dbProfile.created_at,
        cards: [],
      };
    } else {
      newProfile = {
        id: Date.now().toString(),
        name: name.trim(),
        createdAt: new Date().toISOString(),
        cards: [],
      };
    }

    const newProfiles = [...profiles, newProfile];
    await saveProfilesLocally(newProfiles);
    await selectProfile(newProfile.id);
    return newProfile;
  };

  const selectProfile = async (profileId: string) => {
    const profile = profiles.find((p) => p.id === profileId);
    if (profile) {
      setCurrentProfile(profile);
      await AsyncStorage.setItem(CURRENT_PROFILE_KEY, profileId);
    }
  };

  const deleteProfile = async (profileId: string) => {
    if (isSupabaseConfigured()) {
      // UUID değilse (local yaratılmışsa) Supabase'de hata verebilir, try-catch
      try { await deleteProfileFromSupabase(profileId); } catch(e) {}
    }

    const newProfiles = profiles.filter((p) => p.id !== profileId);
    await saveProfilesLocally(newProfiles);

    if (currentProfile?.id === profileId) {
      setCurrentProfile(null);
      await AsyncStorage.removeItem(CURRENT_PROFILE_KEY);
    }
  };

  const addCard = async (card: Omit<MemoryCard, 'id'>) => {
    if (!currentProfile) return;

    let newCard: MemoryCard;

    if (isSupabaseConfigured()) {
      let publicImageUrl = card.imageUri;
      let publicAudioUrl = card.audioUri;

      try {
        if (card.imageUri && card.imageUri.startsWith('file://')) {
          publicImageUrl = await uploadMediaToSupabase(currentProfile.id, card.imageUri, 'photo');
        }
        if (card.audioUri && card.audioUri.startsWith('file://')) {
          publicAudioUrl = await uploadMediaToSupabase(currentProfile.id, card.audioUri, 'audio');
        }
      } catch (e) {
        console.log('Error uploading media to Supabase:', e);
      }

      const dbCard = await addMemoryCardToSupabase({
        profile_id: currentProfile.id,
        type: card.type,
        correct_label: card.correctLabel,
        hint: card.hint || null,
        relation: card.relation || null,
        note: card.note || null,
        is_video: card.isVideo || false,
        image_url: publicImageUrl,
        audio_url: publicAudioUrl || null,
      });

      newCard = {
        ...card,
        id: dbCard.id,
        imageUri: publicImageUrl,
        audioUri: publicAudioUrl,
      };
    } else {
      newCard = {
        ...card,
        id: Date.now().toString(),
      };
    }

    const updatedProfile = {
      ...currentProfile,
      cards: [...currentProfile.cards, newCard],
    };

    const newProfiles = profiles.map((p) => (p.id === currentProfile.id ? updatedProfile : p));
    await saveProfilesLocally(newProfiles);
    setCurrentProfile(updatedProfile);
  };

  const deleteCard = async (cardId: string) => {
    if (!currentProfile) return;

    if (isSupabaseConfigured()) {
      try { await deleteMemoryCardFromSupabase(cardId); } catch(e) {}
    }

    const updatedProfile = {
      ...currentProfile,
      cards: currentProfile.cards.filter((c) => c.id !== cardId),
    };

    const newProfiles = profiles.map((p) => (p.id === currentProfile.id ? updatedProfile : p));
    await saveProfilesLocally(newProfiles);
    setCurrentProfile(updatedProfile);
  };

  const updateCard = async (cardId: string, updates: Partial<MemoryCard>) => {
    if (!currentProfile) return;

    if (isSupabaseConfigured()) {
      try {
        await updateMemoryCardInSupabase(cardId, {
          correct_label: updates.correctLabel,
          hint: updates.hint,
          relation: updates.relation,
          note: updates.note,
          is_video: updates.isVideo,
          image_url: updates.imageUri,
          audio_url: updates.audioUri,
        });
      } catch(e) {}
    }

    const updatedProfile = {
      ...currentProfile,
      cards: currentProfile.cards.map((c) => (c.id === cardId ? { ...c, ...updates } : c)),
    };

    const newProfiles = profiles.map((p) => (p.id === currentProfile.id ? updatedProfile : p));
    await saveProfilesLocally(newProfiles);
    setCurrentProfile(updatedProfile);
  };

  const logout = () => {
    setCurrentProfile(null);
    AsyncStorage.removeItem(CURRENT_PROFILE_KEY);
  };

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        currentProfile,
        isLoading,
        createProfile,
        selectProfile,
        deleteProfile,
        addCard,
        deleteCard,
        updateCard,
        logout,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
