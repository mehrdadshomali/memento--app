import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const LOCATION_TASK_NAME = 'background-location-task';
const SAFETY_DATA_KEY = 'memento_safety_data';
const LAST_NOTIFIED_KEY = 'memento_last_notified_time';

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

  return R * c; // Metre
}

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Location task error:', error);
    return;
  }

  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    if (!locations || locations.length === 0) return;

    const currentLocation = locations[0];

    try {
      // 1. Safety Profile verisini oku
      const safetyDataStr = await AsyncStorage.getItem(SAFETY_DATA_KEY);
      if (!safetyDataStr) return;

      const safetyProfile = JSON.parse(safetyDataStr);
      
      // İzleme açık değilse veya ev konumu yoksa çık
      if (!safetyProfile.isMonitoringEnabled || !safetyProfile.homeLocation) return;

      // 2. Mesafeyi hesapla
      const distance = calculateDistance(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude,
        safetyProfile.homeLocation.latitude,
        safetyProfile.homeLocation.longitude
      );

      // 100 metreden yakındaysa (evde) işlem yapma
      if (distance <= 100) return;

      // 3. Son bildirim zamanını kontrol et (Interval kontrolü)
      const lastNotifiedStr = await AsyncStorage.getItem(LAST_NOTIFIED_KEY);
      const lastNotifiedTime = lastNotifiedStr ? parseInt(lastNotifiedStr, 10) : 0;
      const currentTime = Date.now();
      
      const intervalMinutes = safetyProfile.reminderIntervalMinutes || 15;
      const intervalMs = intervalMinutes * 60 * 1000;

      // Yeterli zaman geçmediyse bildirim gönderme
      if (currentTime - lastNotifiedTime < intervalMs) return;

      // 4. Bildirimi Gönder
      const patientName = safetyProfile.fullName || 'Değerli kullanıcımız';
      const address = safetyProfile.homeLocation.address;
      
      const title = 'Ev Hatırlatması';
      const body = `${patientName}, evinizin konumu burasıdır:\n\n${address}\n\nEğer unuttuysanız, eve yol tarifi almak için bu bildirime tıklayabilirsiniz.`;

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: 'home-reminder', latitude: safetyProfile.homeLocation.latitude, longitude: safetyProfile.homeLocation.longitude },
          sound: true,
        },
        trigger: null,
      });

      // 5. Son bildirim zamanını güncelle
      await AsyncStorage.setItem(LAST_NOTIFIED_KEY, currentTime.toString());

    } catch (e) {
      console.error('Error in background location processing:', e);
    }
  }
});

// Bildirimlere tıklandığında yol tarifi açmak için yardımcı fonksiyon
export function setupNotificationListener() {
  Notifications.addNotificationResponseReceivedListener(response => {
    const data = response.notification.request.content.data;
    if (data && data.type === 'home-reminder' && data.latitude && data.longitude) {
      // Maps uygulamasını aç
      const url = Platform.select({
        ios: `maps://app?daddr=${data.latitude},${data.longitude}`,
        android: `google.navigation:q=${data.latitude},${data.longitude}`,
      });
      // Not: Linking import edilmeli, ancak bu listener'ı genellikle App.tsx gibi bir UI context'inde kurarız
      // Bu servisi dışa aktarıp App.tsx'te çağıracağız.
    }
  });
}
