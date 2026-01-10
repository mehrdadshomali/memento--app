/**
 * Memento - Profile Context
 * Kullanıcı profilleri ve içerik yönetimi
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, MemoryCard } from '../types';

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

const PROFILES_KEY = 'memento_profiles';
const CURRENT_PROFILE_KEY = 'memento_current_profile';

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profilesData, currentId] = await Promise.all([
        AsyncStorage.getItem(PROFILES_KEY),
        AsyncStorage.getItem(CURRENT_PROFILE_KEY),
      ]);

      if (profilesData) {
        const loadedProfiles = JSON.parse(profilesData) as UserProfile[];
        setProfiles(loadedProfiles);

        if (currentId) {
          const current = loadedProfiles.find(p => p.id === currentId);
          if (current) setCurrentProfile(current);
        }
      }
    } catch (error) {
      console.log('Error loading profiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfiles = async (newProfiles: UserProfile[]) => {
    try {
      await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(newProfiles));
      setProfiles(newProfiles);
    } catch (error) {
      console.log('Error saving profiles:', error);
    }
  };

  const createProfile = async (name: string): Promise<UserProfile> => {
    const newProfile: UserProfile = {
      id: Date.now().toString(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
      cards: [],
    };

    const newProfiles = [...profiles, newProfile];
    await saveProfiles(newProfiles);
    await selectProfile(newProfile.id);
    return newProfile;
  };

  const selectProfile = async (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      setCurrentProfile(profile);
      await AsyncStorage.setItem(CURRENT_PROFILE_KEY, profileId);
    }
  };

  const deleteProfile = async (profileId: string) => {
    const newProfiles = profiles.filter(p => p.id !== profileId);
    await saveProfiles(newProfiles);
    
    if (currentProfile?.id === profileId) {
      setCurrentProfile(null);
      await AsyncStorage.removeItem(CURRENT_PROFILE_KEY);
    }
  };

  const addCard = async (card: Omit<MemoryCard, 'id'>) => {
    if (!currentProfile) return;

    const newCard: MemoryCard = {
      ...card,
      id: Date.now().toString(),
    };

    const updatedProfile = {
      ...currentProfile,
      cards: [...currentProfile.cards, newCard],
    };

    const newProfiles = profiles.map(p =>
      p.id === currentProfile.id ? updatedProfile : p
    );

    await saveProfiles(newProfiles);
    setCurrentProfile(updatedProfile);
  };

  const deleteCard = async (cardId: string) => {
    if (!currentProfile) return;

    const updatedProfile = {
      ...currentProfile,
      cards: currentProfile.cards.filter(c => c.id !== cardId),
    };

    const newProfiles = profiles.map(p =>
      p.id === currentProfile.id ? updatedProfile : p
    );

    await saveProfiles(newProfiles);
    setCurrentProfile(updatedProfile);
  };

  const updateCard = async (cardId: string, updates: Partial<MemoryCard>) => {
    if (!currentProfile) return;

    const updatedProfile = {
      ...currentProfile,
      cards: currentProfile.cards.map(c =>
        c.id === cardId ? { ...c, ...updates } : c
      ),
    };

    const newProfiles = profiles.map(p =>
      p.id === currentProfile.id ? updatedProfile : p
    );

    await saveProfiles(newProfiles);
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
