/**
 * AppNavigator — Root navigation configuration
 *
 * Flow:
 *  1. Check onboarding status
 *  2. Onboarding → ProfileSelect → Home → ...
 *  3. Includes all new screens (GameComplete, Settings)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  HomeScreen,
  GameScreen,
  GameCompleteScreen,
  ProfileSelectScreen,
  CaregiverScreen,
  SafetyScreen,
  RoutineScreen,
  AddRoutineScreen,
  AnalyticsScreen,
  OnboardingScreen,
  SettingsScreen,
  FamilyAlbumScreen,
  VoiceMessagesScreen,
  AddMemoryScreen,
} from '../screens';
import { useProfile } from '../context/ProfileContext';
import { CardType, MemoryCard } from '../types';
import { COLORS } from '../constants/theme';

const ONBOARDING_KEY = '@memento_onboarding_completed';

export type RootStackParamList = {
  Onboarding: undefined;
  ProfileSelect: undefined;
  Home: undefined;
  Game: { gameType: CardType };
  GameComplete: {
    correctAnswers: number;
    totalCards: number;
    gameType: CardType;
    onPlayAgain: () => void;
  };
  Caregiver: undefined;
  Safety: undefined;
  Routine: undefined;
  AddRoutine: undefined;
  Analytics: undefined;
  Settings: undefined;
  FamilyAlbum: undefined;
  VoiceMessages: undefined;
  AddMemory: { type: 'visual' | 'audio'; card?: MemoryCard };
};

const Stack = createStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { currentProfile, isLoading: profileLoading } = useProfile();
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY)
      .then(value => setOnboardingDone(value === 'true'))
      .catch(() => setOnboardingDone(false));
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    setOnboardingDone(true);
  }, []);

  // Still loading
  if (profileLoading || onboardingDone === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background },
        gestureEnabled: true,
        ...TransitionPresets.SlideFromRightIOS,
      }}
    >
      {/* Onboarding — first launch only */}
      {!onboardingDone && (
        <Stack.Screen name="Onboarding">
          {() => <OnboardingScreen onComplete={handleOnboardingComplete} />}
        </Stack.Screen>
      )}

      {/* Auth-gated screens */}
      {currentProfile ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Game" component={GameScreen} />
          <Stack.Screen
            name="GameComplete"
            component={GameCompleteScreen}
            options={{ ...TransitionPresets.ModalSlideFromBottomIOS, gestureEnabled: false }}
          />
          <Stack.Screen name="Caregiver" component={CaregiverScreen} />
          <Stack.Screen name="Safety" component={SafetyScreen} />
          <Stack.Screen name="Routine" component={RoutineScreen} />
          <Stack.Screen name="AddRoutine" component={AddRoutineScreen} />
          <Stack.Screen name="Analytics" component={AnalyticsScreen} />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={TransitionPresets.ModalSlideFromBottomIOS}
          />
          <Stack.Screen name="FamilyAlbum" component={FamilyAlbumScreen} />
          <Stack.Screen name="VoiceMessages" component={VoiceMessagesScreen} />
          <Stack.Screen name="AddMemory" component={AddMemoryScreen} options={TransitionPresets.ModalSlideFromBottomIOS} />
        </>
      ) : (
        <Stack.Screen name="ProfileSelect" component={ProfileSelectScreen} />
      )}
    </Stack.Navigator>
  );
}
