/**
 * Memento - Main App Entry
 * Therapeutic memory app for Alzheimer's patients
 */

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { GameProvider } from './src/context/GameContext';
import { ProfileProvider } from './src/context/ProfileContext';
import { SafetyProvider } from './src/context/SafetyContext';
import { RoutineProvider } from './src/context/RoutineContext';
import { LanguageProvider } from './src/i18n';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AnimatedSplashScreen } from './src/screens/AnimatedSplashScreen';
import * as Notifications from 'expo-notifications';
import { Linking, Platform, View, ActivityIndicator } from 'react-native';
import { useFonts, DancingScript_400Regular, DancingScript_700Bold } from '@expo-google-fonts/dancing-script';
import './src/services/LocationTask'; // TaskManager kayıtları için

// Bildirimlere tıklandığında (Uygulama çalışıyorken)
Notifications.addNotificationResponseReceivedListener(response => {
  const data = response.notification.request.content.data;
  if (data && data.type === 'home-reminder' && data.latitude && data.longitude) {
    const url = Platform.select({
      ios: `maps://app?daddr=${data.latitude},${data.longitude}`,
      android: `google.navigation:q=${data.latitude},${data.longitude}`,
    });
    if (url) Linking.openURL(url);
  }
});

export default function App() {
  const [isSplashFinished, setIsSplashFinished] = useState(false);

  const [fontsLoaded] = useFonts({
    DancingScript_400Regular,
    DancingScript_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4A5D23" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <LanguageProvider>
        <ProfileProvider>
          <SafetyProvider>
            <RoutineProvider>
              <GameProvider>
                {!isSplashFinished ? (
                  <AnimatedSplashScreen onFinish={() => setIsSplashFinished(true)} />
                ) : (
                  <NavigationContainer>
                    <AppNavigator />
                  </NavigationContainer>
                )}
              </GameProvider>
            </RoutineProvider>
          </SafetyProvider>
        </ProfileProvider>
      </LanguageProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
