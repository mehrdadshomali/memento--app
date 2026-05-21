/**
 * SafetyScreen — Location tracking setup and status
 *
 * Features:
 *  - Pulse animation for active monitoring
 *  - AnimatedHeader
 *  - react-native-maps MapView for location selection
 *  - Frequency selector for notifications
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  Alert,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedHeader, GradientCard } from '../components';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, ANIMATION, TOUCH_TARGET } from '../constants/theme';
import { useLanguage } from '../i18n';
import { useSafety } from '../context/SafetyContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SafetyScreenProps {
  navigation: any;
}

export function SafetyScreen({ navigation }: SafetyScreenProps) {
  const { t, language } = useLanguage();
  const {
    safetyProfile,
    setHomeLocation,
    updateSafetyProfile,
    startMonitoring,
    stopMonitoring,
    isOutsideHome,
    distanceFromHome,
    getDirectionsToHome,
    sendTestNotification,
  } = useSafety();

  const [isEditingMap, setIsEditingMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [mapAddress, setMapAddress] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isMonitoring = safetyProfile?.isMonitoringEnabled;
  const currentInterval = safetyProfile?.reminderIntervalMinutes || 15;

  useEffect(() => {
    if (isMonitoring && isOutsideHome) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isMonitoring, isOutsideHome, pulseAnim]);

  // Haritayı açarken mevcut konumu veya ev konumunu ayarla
  const openMap = async () => {
    if (safetyProfile?.homeLocation) {
      setSelectedLocation({
        latitude: safetyProfile.homeLocation.latitude,
        longitude: safetyProfile.homeLocation.longitude,
      });
      setMapAddress(safetyProfile.homeLocation.address);
    } else {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          setSelectedLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          await reverseGeocode(location.coords.latitude, location.coords.longitude);
        } else {
          // Varsayılan konum (Örn: İstanbul)
          setSelectedLocation({ latitude: 41.0082, longitude: 28.9784 });
        }
      } catch (e) {
        setSelectedLocation({ latitude: 41.0082, longitude: 28.9784 });
      }
    }
    setIsEditingMap(true);
  };

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      setIsGeocoding(true);
      const result = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (result && result.length > 0) {
        const addr = result[0];
        const formattedAddress = `${addr.street || addr.name || ''} ${addr.streetNumber || ''}, ${addr.district || ''} ${addr.city || addr.subregion || ''}`;
        setMapAddress(formattedAddress.trim().replace(/^,|,$/g, '').trim() || 'Seçilen Konum');
      }
    } catch (e) {
      setMapAddress('Seçilen Konum');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleMapPress = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    reverseGeocode(latitude, longitude);
  };

  const handleSaveHome = async () => {
    if (!selectedLocation) return;
    try {
      await setHomeLocation({
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        address: mapAddress || 'Mevcut Konum',
        name: safetyProfile?.homeLocation?.name || (language === 'tr' ? 'Evim' : 'My Home'),
      });
      setIsEditingMap(false);
      Alert.alert(t.safetySetup, t.homeLocationSaved);
      
      // İzleme aktif değilse, kaydettikten sonra sormak mantıklı olabilir
      if (!isMonitoring) {
        Alert.alert(
          language === 'tr' ? 'Takip Başlatılsın mı?' : 'Start Monitoring?',
          language === 'tr' ? 'Ev konumunuz kaydedildi. Evden uzaklaşıldığında bildirim almak için konum takibini başlatmak ister misiniz?' : 'Would you like to start location monitoring to receive reminders when away from home?',
          [
            { text: language === 'tr' ? 'Hayır' : 'No', style: 'cancel' },
            { text: language === 'tr' ? 'Başlat' : 'Start', onPress: startMonitoring }
          ]
        );
      }
    } catch (e) {
       Alert.alert(t.locationError, t.locationErrorDesc);
    }
  };

  const handleIntervalChange = async (minutes: number) => {
    await updateSafetyProfile({ reminderIntervalMinutes: minutes });
  };

  const formatDistance = (meters: number | null): string => {
    if (meters === null) return '';
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedHeader
        title={t.safety}
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        {safetyProfile?.homeLocation ? (
          <View style={styles.statusSection}>
            <Animated.View
              style={[
                styles.statusIconWrap,
                {
                  backgroundColor: isOutsideHome ? COLORS.warningLight : COLORS.successLight,
                  borderColor: isOutsideHome ? COLORS.warning : COLORS.success,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <Ionicons
                name={isOutsideHome ? "warning" : "shield-checkmark"}
                size={48}
                color={isOutsideHome ? COLORS.warning : COLORS.success}
              />
            </Animated.View>
            <Text style={styles.statusTitle}>
              {isOutsideHome ? t.awayFromHome : t.atHome}
            </Text>
            {isOutsideHome && distanceFromHome !== null && (
              <Text style={styles.statusSubtitle}>
                {t.distanceFromHome}: {formatDistance(distanceFromHome)}
              </Text>
            )}
            
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>{t.locationMonitoring}</Text>
              <TouchableOpacity
                style={[styles.toggleBtn, isMonitoring && styles.toggleBtnActive]}
                onPress={() => isMonitoring ? stopMonitoring() : startMonitoring()}
              >
                <View style={[styles.toggleKnob, isMonitoring && styles.toggleKnobActive]} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.emptyStatus}>
            <Ionicons name="location-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>{t.homeLocationRequired}</Text>
            <Text style={styles.emptySubtitle}>{t.setHomeFirst}</Text>
          </View>
        )}

        {/* Home Information Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.homeLocation}</Text>
          <View style={styles.card}>
            {safetyProfile?.homeLocation ? (
              <View style={styles.homeInfoRow}>
                <View style={styles.homeIcon}>
                  <Ionicons name="home" size={24} color={COLORS.primary} />
                </View>
                <View style={styles.homeDetails}>
                   <Text style={styles.homeLabel}>{t.homeAddress}</Text>
                   <Text style={styles.homeAddressText}>{safetyProfile.homeLocation.address}</Text>
                </View>
                <TouchableOpacity onPress={openMap} style={styles.editBtn}>
                    <Ionicons name="map-outline" size={24} color={COLORS.primary}/>
                </TouchableOpacity>
              </View>
            ) : (
                <TouchableOpacity style={styles.setHomeBtn} onPress={openMap}>
                    <Ionicons name="map-outline" size={24} color={COLORS.primary} style={{marginRight: SPACING.sm}}/>
                    <Text style={styles.setHomeBtnText}>{t.setHomeLocation}</Text>
                </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Frequency Selector */}
        {safetyProfile?.homeLocation && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {language === 'tr' ? 'BİLDİRİM SIKLIĞI' : 'REMINDER FREQUENCY'}
            </Text>
            <Text style={styles.sectionDesc}>
              {language === 'tr' 
                ? 'Evden uzaktayken hastaya ne sıklıkla hatırlatma gönderilsin?'
                : 'How often should the patient receive reminders when away from home?'}
            </Text>
            <View style={styles.freqRow}>
              {[15, 30, 45, 60].map(mins => (
                <TouchableOpacity
                  key={mins}
                  style={[styles.freqBtn, currentInterval === mins && styles.freqBtnActive]}
                  onPress={() => handleIntervalChange(mins)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.freqText, currentInterval === mins && styles.freqTextActive]}>
                    {mins} {t.minutes || 'dk'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

         {/* Quick Actions */}
         {safetyProfile?.homeLocation && (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t.quickAccess}</Text>
                <GradientCard
                    title={t.getDirectionsHome}
                    subtitle={t.getDirectionsHomeDesc}
                    icon="navigate"
                    iconColor={COLORS.info}
                    iconBackground={COLORS.infoLight}
                    onPress={getDirectionsToHome}
                />
                 <GradientCard
                    title={t.testNotification}
                    subtitle={language === 'tr' ? 'Bildirim sistemini test et' : 'Test the notification system'}
                    icon="notifications"
                    iconColor={COLORS.accent}
                    iconBackground={COLORS.accentLight}
                    onPress={() => {
                      sendTestNotification();
                      Alert.alert(language === 'tr' ? 'Test' : 'Test', t.sendTestNotification);
                    }}
                />
            </View>
         )}

         <View style={{height: SPACING.xxxl}} />
      </ScrollView>

       {/* Map Modal */}
       <Modal visible={isEditingMap} animationType="slide" onRequestClose={() => setIsEditingMap(false)}>
           <View style={styles.mapContainer}>
               <View style={styles.mapHeader}>
                   <TouchableOpacity onPress={() => setIsEditingMap(false)} style={styles.mapCloseBtn}>
                        <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                   </TouchableOpacity>
                   <Text style={styles.mapTitle}>{t.setHomeLocation}</Text>
                   <View style={{width: 40}} />
               </View>

               {selectedLocation && (
                 <MapView
                   style={styles.map}
                   provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                   initialRegion={{
                     latitude: selectedLocation.latitude,
                     longitude: selectedLocation.longitude,
                     latitudeDelta: 0.01,
                     longitudeDelta: 0.01,
                   }}
                   onPress={handleMapPress}
                 >
                   <Marker 
                     coordinate={selectedLocation}
                     title={language === 'tr' ? 'Eviniz' : 'Your Home'}
                     pinColor={COLORS.primary}
                   />
                 </MapView>
               )}
               
               <View style={styles.mapFooter}>
                 <Text style={styles.mapHint}>
                   {language === 'tr' ? 'Haritada evinize dokunarak konumu seçin.' : 'Tap on the map to select your home location.'}
                 </Text>
                 
                 <View style={styles.mapAddressBox}>
                   <Ionicons name="location" size={20} color={COLORS.primary} style={{marginRight: SPACING.sm}} />
                   <Text style={styles.mapAddressText} numberOfLines={2}>
                     {isGeocoding ? (language === 'tr' ? 'Adres bulunuyor...' : 'Finding address...') : mapAddress}
                   </Text>
                 </View>

                 <TouchableOpacity style={styles.primaryButton} onPress={handleSaveHome}>
                     <Text style={styles.primaryButtonText}>{t.saveHome}</Text>
                 </TouchableOpacity>
               </View>
           </View>
       </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  statusSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  statusIconWrap: {
    width: 96,
    height: 96,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    marginBottom: SPACING.lg,
  },
  statusTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  statusSubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    width: '100%',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
  },
  toggleBtn: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.border,
    padding: 2,
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: COLORS.success,
  },
  toggleKnob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.backgroundCard,
    ...SHADOWS.sm,
  },
  toggleKnobActive: {
    transform: [{ translateX: 20 }],
  },
  emptyStatus: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textMuted,
    letterSpacing: FONTS.letterSpacing.widest,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
  },
  sectionDesc: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  homeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  homeIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  homeDetails: {
    flex: 1,
  },
  homeLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
  },
  homeAddressText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  editBtn: {
      padding: SPACING.sm,
      backgroundColor: COLORS.backgroundMuted,
      borderRadius: BORDER_RADIUS.full,
  },
  setHomeBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: SPACING.md,
  },
  setHomeBtnText: {
      fontSize: FONTS.sizes.md,
      fontWeight: FONTS.weights.semibold,
      color: COLORS.primary,
  },

  /* Frequency */
  freqRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  freqBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
  },
  freqBtnActive: {
    backgroundColor: COLORS.primaryLight + '20',
    borderColor: COLORS.primary,
  },
  freqText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
  },
  freqTextActive: {
    color: COLORS.primary,
    fontWeight: FONTS.weights.bold,
  },

  /* Map Modal */
  mapContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  mapCloseBtn: {
    padding: 8,
    marginLeft: -8,
  },
  mapTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  map: {
    flex: 1,
    width: SCREEN_WIDTH,
  },
  mapFooter: {
    backgroundColor: COLORS.backgroundCard,
    padding: SPACING.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : SPACING.lg,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    marginTop: -20,
    ...SHADOWS.lg,
  },
  mapHint: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  mapAddressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundMuted,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  mapAddressText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weights.medium,
  },
  primaryButton: {
      backgroundColor: COLORS.primary,
      borderRadius: BORDER_RADIUS.lg,
      height: TOUCH_TARGET.buttonHeight,
      justifyContent: 'center',
      alignItems: 'center',
  },
  primaryButtonText: {
      color: COLORS.textOnPrimary,
      fontSize: FONTS.sizes.md,
      fontWeight: FONTS.weights.semibold,
  }
});
