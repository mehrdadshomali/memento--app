/**
 * Memento - Safety Context (with Supabase Integration)
 * Ev konumu, bildirimler ve güvenlik yönetimi
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Alert, Platform, Linking } from 'react-native';
import { useProfile } from './ProfileContext';
import {
  isSupabaseConfigured,
  getSafetyProfileFromSupabase,
  upsertSafetyProfileInSupabase,
} from '../config/supabaseService';

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

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function SafetyProvider({ children }: { children: ReactNode }) {
  const { currentProfile } = useProfile();
  const [safetyProfile, setSafetyProfile] = useState<SafetyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [distanceFromHome, setDistanceFromHome] = useState<number | null>(null);
  const [isOutsideHome, setIsOutsideHome] = useState(false);
  const notificationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);

  // Aktif Konum İzleme (Ön Planda, Expo Go için kritik)
  useEffect(() => {
    let isSubscribed = true;

    const startWatching = async () => {
      if (safetyProfile?.isMonitoringEnabled) {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const sub = await Location.watchPositionAsync(
              {
                accuracy: Location.Accuracy.High,
                timeInterval: 5000,
                distanceInterval: 10,
              },
              (loc) => {
                if (isSubscribed) setCurrentLocation(loc);
              }
            );
            if (isSubscribed) {
              locationSubscriptionRef.current = sub;
            } else {
              sub.remove();
            }
          }
        } catch (e) {
          console.log("Error starting foreground watcher:", e);
        }
      } else {
        if (locationSubscriptionRef.current) {
          locationSubscriptionRef.current.remove();
          locationSubscriptionRef.current = null;
        }
      }
    };

    startWatching();

    return () => {
      isSubscribed = false;
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
        locationSubscriptionRef.current = null;
      }
    };
  }, [safetyProfile?.isMonitoringEnabled]);

  useEffect(() => {
    if (currentProfile) {
      loadSafetyData(currentProfile.id);
    } else {
      setSafetyProfile(null);
      setIsLoading(false);
    }
    setupNotifications();

    return () => {
      if (notificationIntervalRef.current) {
        clearInterval(notificationIntervalRef.current);
      }
    };
  }, [currentProfile?.id]);

  useEffect(() => {
    const checkAndSendForegroundNotification = async () => {
      try {
        const LAST_NOTIFIED_KEY = 'memento_last_notified_time';
        const lastNotifiedStr = await AsyncStorage.getItem(LAST_NOTIFIED_KEY);
        const lastNotifiedTime = lastNotifiedStr ? parseInt(lastNotifiedStr, 10) : 0;
        const currentTime = Date.now();
        
        // Sunumda hızlı çalışması için test esnasında 15 dk beklememek adına
        const intervalMinutes = safetyProfile?.reminderIntervalMinutes || 15;
        const intervalMs = intervalMinutes * 60 * 1000;

        if (currentTime - lastNotifiedTime >= intervalMs) {
          await sendReminderNotification();
          await AsyncStorage.setItem(LAST_NOTIFIED_KEY, currentTime.toString());
        }
      } catch (e) {
        console.log('Error in foreground notification check:', e);
      }
    };

    if (currentLocation && safetyProfile?.homeLocation) {
      const distance = calculateDistance(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude,
        safetyProfile.homeLocation.latitude,
        safetyProfile.homeLocation.longitude
      );
      setDistanceFromHome(distance);
      
      const isOutside = distance > 100;
      setIsOutsideHome(isOutside);

      // Eğer izleme açıksa ve dışarıdaysa, bildirim yolla (Foreground Fallback)
      if (isOutside && safetyProfile.isMonitoringEnabled) {
         checkAndSendForegroundNotification();
      }
    }
  }, [currentLocation, safetyProfile?.homeLocation, safetyProfile?.isMonitoringEnabled]);

  const loadSafetyData = async (profileId: string) => {
    setIsLoading(true);
    try {
      const storageKey = `${SAFETY_DATA_KEY}_${profileId}`;
      let data: SafetyProfile | null = null;
      
      const isOnline = isSupabaseConfigured();
      if (isOnline) {
        try {
          const dbProfile = await getSafetyProfileFromSupabase(profileId);
          if (dbProfile) {
            data = {
              fullName: dbProfile.full_name || currentProfile?.name || '',
              phoneNumber: dbProfile.phone_number || undefined,
              emergencyContact: dbProfile.emergency_contact || undefined,
              homeLocation: dbProfile.home_latitude && dbProfile.home_longitude ? {
                latitude: dbProfile.home_latitude,
                longitude: dbProfile.home_longitude,
                address: dbProfile.home_address || '',
                name: dbProfile.home_name || '',
              } : null,
              isMonitoringEnabled: dbProfile.is_monitoring_enabled,
              reminderIntervalMinutes: dbProfile.reminder_interval_minutes,
            };
            await AsyncStorage.setItem(storageKey, JSON.stringify(data));
          }
        } catch (e) {
          const localData = await AsyncStorage.getItem(storageKey);
          if (localData) data = JSON.parse(localData);
        }
      } else {
        const localData = await AsyncStorage.getItem(storageKey);
        if (localData) data = JSON.parse(localData);
      }

      if (!data) {
        data = {
          fullName: currentProfile?.name || '',
          homeLocation: null,
          isMonitoringEnabled: false,
          reminderIntervalMinutes: 15,
        };
      }

      setSafetyProfile(data);
    } catch (error) {
      console.log('Error loading safety data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSafetyData = async (data: SafetyProfile) => {
    if (!currentProfile) return;
    try {
      const storageKey = `${SAFETY_DATA_KEY}_${currentProfile.id}`;
      await AsyncStorage.setItem(storageKey, JSON.stringify(data));
      setSafetyProfile(data);

      if (isSupabaseConfigured()) {
        await upsertSafetyProfileInSupabase({
          profile_id: currentProfile.id,
          full_name: data.fullName,
          phone_number: data.phoneNumber || null,
          emergency_contact: data.emergencyContact || null,
          home_latitude: data.homeLocation?.latitude || null,
          home_longitude: data.homeLocation?.longitude || null,
          home_address: data.homeLocation?.address || null,
          home_name: data.homeLocation?.name || null,
          is_monitoring_enabled: data.isMonitoringEnabled,
          reminder_interval_minutes: data.reminderIntervalMinutes,
        });
      }
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

    if (finalStatus !== 'granted') return;

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
      `Merhaba ${safetyProfile.fullName}!\n\nEvinizin adresi:\n${safetyProfile.homeLocation.address}\n\nEve dönmek için Memento'yu açın.`,
      `${safetyProfile.fullName}, evinizi hatırlıyor musunuz?\n\n${safetyProfile.homeLocation.name}\n${safetyProfile.homeLocation.address}`,
      `Güvendesiniz ${safetyProfile.fullName}!\n\nEviniz: ${safetyProfile.homeLocation.address}\n\nYardım için Memento'yu açın.`,
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Ev Hatırlatması',
        body: randomMessage,
        data: { type: 'home-reminder' },
        sound: true,
      },
      trigger: null,
    });
  };

  const startMonitoring = async () => {
    if (!safetyProfile) return;

    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        Alert.alert('Konum İzni', 'Konum takibi için ön plan izni gerekli');
        return;
      }

      // Try background permission, but catch errors since Expo Go doesn't support it
      try {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus === 'granted') {
          await Location.startLocationUpdatesAsync('background-location-task', {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 15 * 60 * 1000,
            distanceInterval: 50,
            deferredUpdatesInterval: 5 * 60 * 1000,
            showsBackgroundLocationIndicator: true,
            foregroundService: {
              notificationTitle: 'Memento Konum Takibi',
              notificationBody: 'Güvenliğiniz için konumunuz arka planda takip ediliyor.',
              notificationColor: '#8B7355',
            },
          });
        }
      } catch (bgError) {
        console.log('Background location not fully supported in Expo Go:', bgError);
      }

      // Update state so the UI button activates regardless of background support (for demo purposes)
      await updateSafetyProfile({ isMonitoringEnabled: true });
    } catch (e) {
      console.error('Error in startMonitoring:', e);
      Alert.alert('Uyarı', 'Konum takibi başlatılırken bir sorun oluştu.');
      await updateSafetyProfile({ isMonitoringEnabled: true }); // Demo fallback
    }
  };

  const stopMonitoring = async () => {
    try {
      try {
        const hasTask = await Location.hasStartedLocationUpdatesAsync('background-location-task');
        if (hasTask) {
          await Location.stopLocationUpdatesAsync('background-location-task');
        }
      } catch (bgError) {
        console.log('Background location not fully supported in Expo Go:', bgError);
      }
      await updateSafetyProfile({ isMonitoringEnabled: false });
    } catch (e) {
      console.error('Error stopping location updates', e);
      await updateSafetyProfile({ isMonitoringEnabled: false }); // Demo fallback
    }
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
