/**
 * Memento - App Navigator
 * Profil bazlı navigasyon + Authentication
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import { 
  HomeScreen, 
  GameScreen, 
  ProfileSelectScreen, 
  CaregiverScreen, 
  SafetyScreen,
  RoutineScreen,
  AddRoutineScreen,
} from '../screens';
import AuthScreen from '../screens/AuthScreen';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { CardType } from '../types';
import { COLORS } from '../constants/theme';

export type RootStackParamList = {
  Auth: undefined;
  ProfileSelect: undefined;
  Home: undefined;
  Game: { gameType: CardType };
  Caregiver: undefined;
  Safety: undefined;
  Routine: undefined;
  AddRoutine: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { user, loading: authLoading } = useAuth();
  const { currentProfile, isLoading: profileLoading } = useProfile();

  if (authLoading || profileLoading) {
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
      }}
    >
      {!user ? (
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : currentProfile ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Game" component={GameScreen} />
          <Stack.Screen name="Caregiver" component={CaregiverScreen} />
          <Stack.Screen name="Safety" component={SafetyScreen} />
          <Stack.Screen name="Routine" component={RoutineScreen} />
          <Stack.Screen name="AddRoutine" component={AddRoutineScreen} />
        </>
      ) : (
        <Stack.Screen name="ProfileSelect" component={ProfileSelectScreen} />
      )}
    </Stack.Navigator>
  );
}
