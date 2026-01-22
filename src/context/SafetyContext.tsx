/**
 * Memento - Safety Context
 * Ev konumu, bildirimler ve güvenlik yönetimi
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Alert, Platform, Linking } from 'react-native';
import { useProfile } from './ProfileContext';

const SAFETY_DATA_KEY = 'memento_safety_data';

export interface HomeLocation {
  latitude: number;
  longitude: number;
  address: string;
  name: string; // Ev adı (örn: "Annemin Evi")
}

export interface SafetyProfile {
  fullName: string;
  phoneNumber?: string;
  emergencyContact?: string;
  homeLocation: HomeLocation | null;
  isMonitoringEnabled: boolean;
  reminderIntervalMinutes: number;
  lastKnownLocation?: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
}

interface SafetyContextType {
  safetyProfile: SafetyProfile | null;
  isLoading: boolean;
  currentLocation: Location.LocationObject | null;
  distanceFromHome: number | null;
  isOutsideHome: boolean;
  setHomeLocation: (location: HomeLocation) => Promise<void>;
  updateSafetyProfile: (updates: Partial<SafetyProfile>) => Promise<void>;
  startMonitoring: () => Promise<void>;
  stopMonitoring: () => Promise<void>;
  getCurrentLocation: () => Promise<Location.LocationObject | null>;
  getDirectionsToHome: () => void;
  sendTestNotification: () => Promise<void>;
}

const SafetyContext = createContext<SafetyContextType | undefined>(undefined);

// Bildirim ayarları
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Mesafe hesaplama (Haversine formülü)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Dünya yarıçapı (metre)
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Metre cinsinden mesafe
}

export function SafetyProvider({ children }: { children: ReactNode }) {
  const { currentProfile } = useProfile();
  const [safetyProfile, setSafetyProfile] = useState<SafetyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [distanceFromHome, setDistanceFromHome] = useState<number | null>(null);
  const [isOutsideHome, setIsOutsideHome] = useState(false);
  const notificationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadSafetyData();
    setupNotifications();

    return () => {
      if (notificationIntervalRef.current) {
        clearInterval(notificationIntervalRef.current);
      }
    };
  }, []);

  // Konum değiştiğinde mesafe hesapla
  useEffect(() => {
    if (currentLocation && safetyProfile?.homeLocation) {
      const distance = calculateDistance(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude,
        safetyProfile.homeLocation.latitude,
        safetyProfile.homeLocation.longitude
      );
      setDistanceFromHome(distance);
      setIsOutsideHome(distance > 100); // 100 metreden uzaksa dışarıda
    }
  }, [currentLocation, safetyProfile?.homeLocation]);

  const loadSafetyData = async () => {
    try {
      const data = await AsyncStorage.getItem(SAFETY_DATA_KEY);
      if (data) {
        setSafetyProfile(JSON.parse(data));
      } else {
        // Varsayılan profil
        setSafetyProfile({
          fullName: currentProfile?.name || '',
          homeLocation: null,
          isMonitoringEnabled: false,
          reminderIntervalMinutes: 15,
        });
      }
    } catch (error) {
      console.log('Error loading safety data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSafetyData = async (data: SafetyProfile) => {
    try {
      await AsyncStorage.setItem(SAFETY_DATA_KEY, JSON.stringify(data));
      setSafetyProfile(data);
    } catch (error) {
      console.log('Error saving safety data:', error);
    }
  };

  const setupNotifications = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('safety-reminders', {
        name: 'Safety Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#8B7355',
      });
    }
  };

  const getCurrentLocation = async (): Promise<Location.LocationObject | null> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Konum İzni', 'Konum izni gerekli');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setCurrentLocation(location);
      return location;
    } catch (error) {
      console.log('Error getting location:', error);
      return null;
    }
  };

  const setHomeLocation = async (location: HomeLocation) => {
    if (!safetyProfile) return;

    const updated = {
      ...safetyProfile,
      homeLocation: location,
    };
    await saveSafetyData(updated);
  };

  const updateSafetyProfile = async (updates: Partial<SafetyProfile>) => {
    if (!safetyProfile) return;

    const updated = {
      ...safetyProfile,
      ...updates,
    };
    await saveSafetyData(updated);
  };

  const sendReminderNotification = async () => {
    if (!safetyProfile?.homeLocation || !safetyProfile.fullName) return;

    const messages = [
      `Merhaba ${safetyProfile.fullName}! 🏠\n\nEvinizin adresi:\n${safetyProfile.homeLocation.address}\n\nEve dönmek için Memento'yu açın.`,
      `${safetyProfile.fullName}, evinizi hatırlıyor musunuz? 💙\n\n${safetyProfile.homeLocation.name}\n${safetyProfile.homeLocation.address}`,
      `Güvendesiniz ${safetyProfile.fullName}! 🌟\n\nEviniz: ${safetyProfile.homeLocation.address}\n\nYardım için Memento'yu açın.`,
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🏠 Ev Hatırlatması',
        body: randomMessage,
        data: { type: 'home-reminder' },
        sound: true,
      },
      trigger: null, // Hemen gönder
    });
  };

  const startMonitoring = async () => {
    if (!safetyProfile) return;

    // Konum izni
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
      Alert.alert('Konum İzni', 'Konum takibi için izin gerekli');
      return;
    }

    // Arka plan konum izni
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      Alert.alert('Arka Plan Konum', 'Sürekli takip için arka plan konum izni gerekli');
    }

    // Bildirim interval'ı başlat
    if (notificationIntervalRef.current) {
      clearInterval(notificationIntervalRef.current);
    }

    const intervalMs = (safetyProfile.reminderIntervalMinutes || 15) * 60 * 1000;
    
    notificationIntervalRef.current = setInterval(async () => {
      const location = await getCurrentLocation();
      if (location && safetyProfile.homeLocation) {
        const distance = calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          safetyProfile.homeLocation.latitude,
          safetyProfile.homeLocation.longitude
        );

        // Evden 100 metreden uzaktaysa bildirim gönder
        if (distance > 100) {
          await sendReminderNotification();
        }
      }
    }, intervalMs);

    await updateSafetyProfile({ isMonitoringEnabled: true });
    
    // İlk konum al
    await getCurrentLocation();
  };

  const stopMonitoring = async () => {
    if (notificationIntervalRef.current) {
      clearInterval(notificationIntervalRef.current);
      notificationIntervalRef.current = null;
    }

    await updateSafetyProfile({ isMonitoringEnabled: false });
  };

  const getDirectionsToHome = () => {
    if (!safetyProfile?.homeLocation) {
      Alert.alert('Ev Konumu', 'Önce ev konumunuzu kaydedin');
      return;
    }

    const { latitude, longitude } = safetyProfile.homeLocation;
    const url = Platform.select({
      ios: `maps://app?daddr=${latitude},${longitude}`,
      android: `google.navigation:q=${latitude},${longitude}`,
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  const sendTestNotification = async () => {
    await sendReminderNotification();
  };

  return (
    <SafetyContext.Provider
      value={{
        safetyProfile,
        isLoading,
        currentLocation,
        distanceFromHome,
        isOutsideHome,
        setHomeLocation,
        updateSafetyProfile,
        startMonitoring,
        stopMonitoring,
        getCurrentLocation,
        getDirectionsToHome,
        sendTestNotification,
      }}
    >
      {children}
    </SafetyContext.Provider>
  );
}

export function useSafety() {
  const context = useContext(SafetyContext);
  if (!context) {
    throw new Error('useSafety must be used within a SafetyProvider');
  }
  return context;
}
