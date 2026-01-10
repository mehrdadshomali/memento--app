/**
 * Memento - App Navigator
 * Profil bazlı navigasyon
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen, GameScreen, ProfileSelectScreen, CaregiverScreen } from '../screens';
import { useProfile } from '../context/ProfileContext';
import { CardType } from '../types';
import { COLORS } from '../constants/theme';

export type RootStackParamList = {
  ProfileSelect: undefined;
  Home: undefined;
  Game: { gameType: CardType };
  Caregiver: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { currentProfile, isLoading } = useProfile();

  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background },
        gestureEnabled: true,
      }}
    >
      {currentProfile ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Game" component={GameScreen} />
          <Stack.Screen name="Caregiver" component={CaregiverScreen} />
        </>
      ) : (
        <Stack.Screen name="ProfileSelect" component={ProfileSelectScreen} />
      )}
    </Stack.Navigator>
  );
}
