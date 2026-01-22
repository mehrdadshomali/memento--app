/**
 * Memento - Profile Context
 * Kullanıcı profilleri ve içerik yönetimi (Supabase)
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, MemoryCard } from '../types';
import { supabase } from '../config/supabase';
import { useAuth } from './AuthContext';

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
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
      subscribeToChanges();
    } else {
      setProfiles([]);
      setCurrentProfile(null);
      setIsLoading(false);
    }
  }, [user]);

  const subscribeToChanges = () => {
    if (!user) return;

    // Profil değişikliklerini dinle
    const profileSubscription = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadData();
        }
      )
      .subscribe();

    // Memories değişikliklerini dinle
    const memoriesSubscription = supabase
      .channel('memories-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'memories',
        },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      profileSubscription.unsubscribe();
      memoriesSubscription.unsubscribe();
    };
  };

  const loadData = async () => {
    if (!user) return;

    try {
      // Profilleri yükle
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id);

      if (profilesError) throw profilesError;

      if (profilesData && profilesData.length > 0) {
        // Her profil için memories'leri yükle
        const profilesWithCards = await Promise.all(
          profilesData.map(async (profile) => {
            const { data: memories, error: memoriesError } = await supabase
              .from('memories')
              .select('*')
              .eq('profile_id', profile.id)
              .order('created_at', { ascending: false });

            if (memoriesError) throw memoriesError;

            const cards: MemoryCard[] = (memories || []).map((memory) => ({
              id: memory.id,
              title: memory.title,
              description: memory.description || '',
              imageUri: memory.media_url || undefined,
              audioUri: memory.media_type === 'audio' ? memory.media_url : undefined,
              videoUri: memory.media_type === 'video' ? memory.media_url : undefined,
              type: memory.media_type === 'photo' ? 'photo' : memory.media_type === 'video' ? 'video' : 'audio',
            }));

            return {
              id: profile.id,
              name: profile.name,
              createdAt: profile.created_at,
              cards,
            };
          })
        );

        setProfiles(profilesWithCards);

        // İlk profili otomatik seç
        if (!currentProfile && profilesWithCards.length > 0) {
          setCurrentProfile(profilesWithCards[0]);
        }
      }
    } catch (error) {
      console.log('Error loading profiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createProfile = async (name: string): Promise<UserProfile> => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        name: name.trim(),
        age: 0,
        diagnosis: '',
      })
      .select()
      .single();

    if (error) throw error;

    const newProfile: UserProfile = {
      id: data.id,
      name: data.name,
      createdAt: data.created_at,
      cards: [],
    };

    setProfiles([...profiles, newProfile]);
    setCurrentProfile(newProfile);
    return newProfile;
  };

  const selectProfile = async (profileId: string) => {
    const profile = profiles.find((p) => p.id === profileId);
    if (profile) {
      setCurrentProfile(profile);
    }
  };

  const deleteProfile = async (profileId: string) => {
    const { error } = await supabase.from('profiles').delete().eq('id', profileId);

    if (error) throw error;

    const newProfiles = profiles.filter((p) => p.id !== profileId);
    setProfiles(newProfiles);

    if (currentProfile?.id === profileId) {
      setCurrentProfile(newProfiles[0] || null);
    }
  };

  const addCard = async (card: Omit<MemoryCard, 'id'>) => {
    if (!currentProfile) return;

    let mediaUrl = card.imageUri || card.videoUri || card.audioUri;
    let mediaType: 'photo' | 'video' | 'audio' = 'photo';

    if (card.videoUri) mediaType = 'video';
    else if (card.audioUri) mediaType = 'audio';

    // Media dosyası varsa Supabase Storage'a yükle
    if (mediaUrl && mediaUrl.startsWith('file://')) {
      try {
        const fileName = `${user?.id}/${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const fileExt = mediaUrl.split('.').pop();
        const filePath = `${fileName}.${fileExt}`;

        // Dosyayı oku ve yükle
        const response = await fetch(mediaUrl);
        const blob = await response.blob();

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('memories')
          .upload(filePath, blob, {
            contentType: blob.type,
          });

        if (uploadError) throw uploadError;

        // Public URL al
        const { data: urlData } = supabase.storage.from('memories').getPublicUrl(filePath);
        mediaUrl = urlData.publicUrl;
      } catch (error) {
        console.log('Error uploading media:', error);
      }
    }

    const { data, error } = await supabase
      .from('memories')
      .insert({
        profile_id: currentProfile.id,
        title: card.title,
        description: card.description,
        media_url: mediaUrl,
        media_type: mediaType,
      })
      .select()
      .single();

    if (error) throw error;

    const newCard: MemoryCard = {
      id: data.id,
      title: data.title,
      description: data.description || '',
      imageUri: mediaType === 'photo' ? mediaUrl : undefined,
      videoUri: mediaType === 'video' ? mediaUrl : undefined,
      audioUri: mediaType === 'audio' ? mediaUrl : undefined,
      type: card.type,
    };

    const updatedProfile = {
      ...currentProfile,
      cards: [...currentProfile.cards, newCard],
    };

    setCurrentProfile(updatedProfile);
    setProfiles(profiles.map((p) => (p.id === currentProfile.id ? updatedProfile : p)));
  };

  const deleteCard = async (cardId: string) => {
    if (!currentProfile) return;

    const { error } = await supabase.from('memories').delete().eq('id', cardId);

    if (error) throw error;

    const updatedProfile = {
      ...currentProfile,
      cards: currentProfile.cards.filter((c) => c.id !== cardId),
    };

    setCurrentProfile(updatedProfile);
    setProfiles(profiles.map((p) => (p.id === currentProfile.id ? updatedProfile : p)));
  };

  const updateCard = async (cardId: string, updates: Partial<MemoryCard>) => {
    if (!currentProfile) return;

    const { error } = await supabase
      .from('memories')
      .update({
        title: updates.title,
        description: updates.description,
      })
      .eq('id', cardId);

    if (error) throw error;

    const updatedProfile = {
      ...currentProfile,
      cards: currentProfile.cards.map((c) => (c.id === cardId ? { ...c, ...updates } : c)),
    };

    setCurrentProfile(updatedProfile);
    setProfiles(profiles.map((p) => (p.id === currentProfile.id ? updatedProfile : p)));
  };

  const logout = () => {
    setCurrentProfile(null);
    setProfiles([]);
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
