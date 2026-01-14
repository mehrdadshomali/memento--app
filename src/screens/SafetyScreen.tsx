/**
 * Memento - Safety Screen
 * Ev konumu ayarlama ve güvenlik özellikleri
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useLanguage } from '../i18n';
import { useSafety } from '../context/SafetyContext';
import { useProfile } from '../context/ProfileContext';

const { width } = Dimensions.get('window');

interface SafetyScreenProps {
  navigation: any;
}

export function SafetyScreen({ navigation }: SafetyScreenProps) {
  const { t } = useLanguage();
  const { currentProfile } = useProfile();
  const {
    safetyProfile,
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
  } = useSafety();

  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 41.0082,
    longitude: 28.9784,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [homeName, setHomeName] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [fullName, setFullName] = useState('');
  const [showSetupMode, setShowSetupMode] = useState(false);

  useEffect(() => {
    if (safetyProfile?.homeLocation) {
      setMapRegion({
        ...mapRegion,
        latitude: safetyProfile.homeLocation.latitude,
        longitude: safetyProfile.homeLocation.longitude,
      });
      setHomeName(safetyProfile.homeLocation.name);
      setHomeAddress(safetyProfile.homeLocation.address);
    }
    if (safetyProfile?.fullName) {
      setFullName(safetyProfile.fullName);
    }
    if (currentProfile?.name && !safetyProfile?.fullName) {
      setFullName(currentProfile.name);
    }
  }, [safetyProfile, currentProfile]);

  const handleGetCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const location = await getCurrentLocation();
      if (location) {
        const { latitude, longitude } = location.coords;
        setMapRegion({
          ...mapRegion,
          latitude,
          longitude,
        });
        setSelectedLocation({ latitude, longitude });

        // Adres al
        const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (address) {
          const formattedAddress = [
            address.street,
            address.streetNumber,
            address.district,
            address.city,
          ]
            .filter(Boolean)
            .join(', ');
          setHomeAddress(formattedAddress || 'Adres bulunamadı');
        }
      }
    } catch (error) {
      Alert.alert('Hata', 'Konum alınamadı');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleMapPress = async (event: any) => {
    if (!showSetupMode) return;
    
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });

    // Adres al
    try {
      const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (address) {
        const formattedAddress = [
          address.street,
          address.streetNumber,
          address.district,
          address.city,
        ]
          .filter(Boolean)
          .join(', ');
        setHomeAddress(formattedAddress || 'Adres bulunamadı');
      }
    } catch (error) {
      console.log('Reverse geocode error:', error);
    }
  };

  const handleSaveHome = async () => {
    if (!selectedLocation || !homeName.trim() || !homeAddress.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen tüm alanları doldurun');
      return;
    }

    await setHomeLocation({
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      name: homeName.trim(),
      address: homeAddress.trim(),
    });

    if (fullName.trim()) {
      await updateSafetyProfile({ fullName: fullName.trim() });
    }

    setShowSetupMode(false);
    Alert.alert('Başarılı', 'Ev konumunuz kaydedildi');
  };

  const handleToggleMonitoring = async (value: boolean) => {
    if (value) {
      if (!safetyProfile?.homeLocation) {
        Alert.alert('Ev Konumu Gerekli', 'Önce ev konumunuzu kaydedin');
        return;
      }
      await startMonitoring();
      Alert.alert(
        'Takip Başladı',
        `Her ${safetyProfile?.reminderIntervalMinutes || 15} dakikada bir evden uzaktaysanız hatırlatma alacaksınız.`
      );
    } else {
      await stopMonitoring();
    }
  };

  const formatDistance = (meters: number | null) => {
    if (meters === null) return '-';
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Güvenlik</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        {safetyProfile?.homeLocation && (
          <View style={[styles.statusCard, isOutsideHome ? styles.statusWarning : styles.statusSafe]}>
            <Text style={styles.statusIcon}>{isOutsideHome ? '📍' : '🏠'}</Text>
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>
                {isOutsideHome ? 'Evden Uzaktasınız' : 'Evdesiniz'}
              </Text>
              <Text style={styles.statusDistance}>
                Eve uzaklık: {formatDistance(distanceFromHome)}
              </Text>
            </View>
            {isOutsideHome && (
              <TouchableOpacity style={styles.directionsButton} onPress={getDirectionsToHome}>
                <Text style={styles.directionsButtonText}>🧭 Yol Tarifi</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Home Info Card */}
        {safetyProfile?.homeLocation && !showSetupMode && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>🏠 Ev Bilgileri</Text>
              <TouchableOpacity onPress={() => setShowSetupMode(true)}>
                <Text style={styles.editButton}>Düzenle</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.homeName}>{safetyProfile.homeLocation.name}</Text>
            <Text style={styles.homeAddress}>{safetyProfile.homeLocation.address}</Text>
            
            {safetyProfile.fullName && (
              <View style={styles.nameTag}>
                <Text style={styles.nameTagLabel}>Ad Soyad:</Text>
                <Text style={styles.nameTagValue}>{safetyProfile.fullName}</Text>
              </View>
            )}
          </View>
        )}

        {/* Setup Mode or Initial Setup */}
        {(showSetupMode || !safetyProfile?.homeLocation) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {safetyProfile?.homeLocation ? '🏠 Evi Düzenle' : '🏠 Ev Konumunu Ayarla'}
            </Text>
            <Text style={styles.cardDescription}>
              Haritada evinizi işaretleyin veya mevcut konumunuzu kullanın
            </Text>

            {/* Map */}
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                region={mapRegion}
                onRegionChangeComplete={setMapRegion}
                onPress={handleMapPress}
                showsUserLocation
                showsMyLocationButton={false}
              >
                {selectedLocation && (
                  <Marker
                    coordinate={selectedLocation}
                    title={homeName || 'Ev'}
                    pinColor={COLORS.primary}
                  />
                )}
                {safetyProfile?.homeLocation && !selectedLocation && (
                  <Marker
                    coordinate={{
                      latitude: safetyProfile.homeLocation.latitude,
                      longitude: safetyProfile.homeLocation.longitude,
                    }}
                    title={safetyProfile.homeLocation.name}
                    pinColor={COLORS.primary}
                  />
                )}
              </MapView>

              <TouchableOpacity
                style={styles.locationButton}
                onPress={handleGetCurrentLocation}
                disabled={isLoadingLocation}
              >
                {isLoadingLocation ? (
                  <ActivityIndicator color={COLORS.textOnPrimary} />
                ) : (
                  <Text style={styles.locationButtonText}>📍 Konumumu Kullan</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Form */}
            <Text style={styles.inputLabel}>Ad Soyad</Text>
            <TextInput
              style={styles.input}
              placeholder="Adınız ve soyadınız"
              placeholderTextColor={COLORS.textMuted}
              value={fullName}
              onChangeText={setFullName}
            />

            <Text style={styles.inputLabel}>Ev Adı</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: Annemin Evi"
              placeholderTextColor={COLORS.textMuted}
              value={homeName}
              onChangeText={setHomeName}
            />

            <Text style={styles.inputLabel}>Adres</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Ev adresi"
              placeholderTextColor={COLORS.textMuted}
              value={homeAddress}
              onChangeText={setHomeAddress}
              multiline
              numberOfLines={2}
            />

            <View style={styles.buttonRow}>
              {showSetupMode && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowSetupMode(false)}
                >
                  <Text style={styles.cancelButtonText}>İptal</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.saveButton, !selectedLocation && styles.buttonDisabled]}
                onPress={handleSaveHome}
                disabled={!selectedLocation}
              >
                <Text style={styles.saveButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Monitoring Settings */}
        {safetyProfile?.homeLocation && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>⏰ Hatırlatma Ayarları</Text>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Konum Takibi</Text>
                <Text style={styles.settingDescription}>
                  Evden uzaklaştığınızda hatırlatma alın
                </Text>
              </View>
              <Switch
                value={safetyProfile.isMonitoringEnabled}
                onValueChange={handleToggleMonitoring}
                trackColor={{ false: COLORS.border, true: COLORS.accent }}
                thumbColor={COLORS.background}
              />
            </View>

            <View style={styles.intervalSetting}>
              <Text style={styles.settingLabel}>Hatırlatma Sıklığı</Text>
              <View style={styles.intervalButtons}>
                {[5, 15, 30, 60].map((minutes) => (
                  <TouchableOpacity
                    key={minutes}
                    style={[
                      styles.intervalButton,
                      safetyProfile.reminderIntervalMinutes === minutes &&
                        styles.intervalButtonActive,
                    ]}
                    onPress={() => updateSafetyProfile({ reminderIntervalMinutes: minutes })}
                  >
                    <Text
                      style={[
                        styles.intervalButtonText,
                        safetyProfile.reminderIntervalMinutes === minutes &&
                          styles.intervalButtonTextActive,
                      ]}
                    >
                      {minutes} dk
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Test Notification */}
            <TouchableOpacity style={styles.testButton} onPress={sendTestNotification}>
              <Text style={styles.testButtonText}>🔔 Test Bildirimi Gönder</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions */}
        {safetyProfile?.homeLocation && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🚀 Hızlı Erişim</Text>
            
            <TouchableOpacity style={styles.actionButton} onPress={getDirectionsToHome}>
              <Text style={styles.actionIcon}>🧭</Text>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Eve Yol Tarifi Al</Text>
                <Text style={styles.actionDescription}>
                  Harita uygulamasında yol tarifi açılır
                </Text>
              </View>
              <Text style={styles.actionArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                Alert.alert(
                  '🏠 Ev Bilgilerim',
                  `Ad: ${safetyProfile.fullName}\n\nEv: ${safetyProfile.homeLocation?.name}\n\nAdres: ${safetyProfile.homeLocation?.address}`,
                  [{ text: 'Tamam' }]
                );
              }}
            >
              <Text style={styles.actionIcon}>📋</Text>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Bilgilerimi Göster</Text>
                <Text style={styles.actionDescription}>
                  Ad, soyad ve ev adresinizi görün
                </Text>
              </View>
              <Text style={styles.actionArrow}>→</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.full,
  },
  backButtonText: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.textSecondary,
  },
  headerTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  statusSafe: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  statusWarning: {
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FFCC80',
  },
  statusIcon: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
  },
  statusDistance: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  directionsButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  directionsButtonText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textOnPrimary,
  },
  card: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  cardDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
  },
  editButton: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: FONTS.weights.medium,
  },
  homeName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  homeAddress: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  nameTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  nameTagLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginRight: SPACING.sm,
  },
  nameTagValue: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
  },
  mapContainer: {
    height: 250,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  locationButton: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.md,
  },
  locationButtonText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textOnPrimary,
  },
  inputLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    backgroundColor: COLORS.backgroundMuted,
  },
  cancelButtonText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textOnPrimary,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
  },
  settingDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  intervalSetting: {
    paddingVertical: SPACING.md,
  },
  intervalButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  intervalButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  intervalButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  intervalButtonText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  intervalButtonTextActive: {
    color: COLORS.textOnPrimary,
    fontWeight: FONTS.weights.medium,
  },
  testButton: {
    marginTop: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    backgroundColor: COLORS.backgroundMuted,
  },
  testButtonText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  actionIcon: {
    fontSize: 28,
    marginRight: SPACING.md,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
  },
  actionDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  actionArrow: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.textLight,
  },
  bottomPadding: {
    height: SPACING.xxl,
  },
});
