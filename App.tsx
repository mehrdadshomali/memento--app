/**
 * Memento - Main App Entry
 * Therapeutic memory app for Alzheimer's patients
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { GameProvider } from './src/context/GameContext';
import { ProfileProvider } from './src/context/ProfileContext';
import { SafetyProvider } from './src/context/SafetyContext';
import { RoutineProvider } from './src/context/RoutineContext';
import { AuthProvider } from './src/context/AuthContext';
import { LanguageProvider } from './src/i18n';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <AuthProvider>
        <LanguageProvider>
          <ProfileProvider>
            <SafetyProvider>
              <RoutineProvider>
                <GameProvider>
                  <NavigationContainer>
                    <AppNavigator />
                  </NavigationContainer>
                </GameProvider>
              </RoutineProvider>
            </SafetyProvider>
          </ProfileProvider>
        </LanguageProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
