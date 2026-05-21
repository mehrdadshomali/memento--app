/**
 * Memento - Çoklu Dil Desteği (Tam Versiyon)
 * Tüm ekranlar dahil (Safety, Routine, Caregiver, Game, Profile)
 */

export type Language = 'en' | 'tr';

export interface Translations {
  // App
  appName: string;
  homeSubtitle: string;
  takeYourTime: string;
  home: string;
  loading: string;
  encouragement: string;
  language: string;
  selectLanguage: string;
  settings: string;

  // Game
  whoIsThis: string;
  familyAlbum: string;
  whatSound: string;
  soundMatch: string;
  progress: string;
  tapToHearSound: string;
  hint: string;
  imageNotAvailable: string;
  wonderful: string;
  greatJob: string;
  playAgain: string;
  goHome: string;
  goHomeQuestion: string;
  progressSaved: string;
  stay: string;
  soundPlaying: string;
  imagineHearing: string;
  playSound: string;
  tapToHearAgain: string;
  selectAnswer: string;

  // Profile
  profiles: string;
  selectProfile: string;
  createProfile: string;
  enterName: string;
  create: string;
  cancel: string;
  delete: string;
  deleteProfile: string;
  deleteConfirm: string;
  noProfiles: string;
  welcome: string;
  switchProfile: string;

  // Caregiver
  caregiverMode: string;
  addContent: string;
  manageContent: string;
  addPhoto: string;
  addSound: string;
  photoName: string;
  soundName: string;
  hintOptional: string;
  save: string;
  selectImage: string;
  recordSound: string;
  noContent: string;
  addFirstContent: string;
  visualCards: string;
  audioCards: string;
  editCard: string;
  deleteCard: string;
  deleteCardConfirm: string;
  needMoreCards: string;
  minCardsRequired: string;

  // Safety Screen
  safety: string;
  safetySetup: string;
  safetySetupDesc: string;
  homeLocation: string;
  setHomeLocation: string;
  editHomeLocation: string;
  homeLocationSaved: string;
  homeInfo: string;
  homeName: string;
  homeAddress: string;
  fullName: string;
  fullNamePlaceholder: string;
  homeNamePlaceholder: string;
  homeAddressPlaceholder: string;
  useCurrentLocation: string;
  saveHome: string;
  atHome: string;
  awayFromHome: string;
  distanceFromHome: string;
  getDirections: string;
  locationMonitoring: string;
  locationMonitoringDesc: string;
  reminderFrequency: string;
  testNotification: string;
  sendTestNotification: string;
  quickAccess: string;
  getDirectionsHome: string;
  getDirectionsHomeDesc: string;
  showMyInfo: string;
  showMyInfoDesc: string;
  myHomeInfo: string;
  monitoringStarted: string;
  monitoringStartedDesc: string;
  locationPermission: string;
  locationPermissionRequired: string;
  backgroundLocationPermission: string;
  backgroundLocationRequired: string;
  homeLocationRequired: string;
  setHomeFirst: string;
  missingInfo: string;
  fillAllFields: string;
  minutes: string;
  edit: string;
  ok: string;
  addressNotFound: string;
  locationError: string;
  locationErrorDesc: string;

  // Routine Screen
  dailyRoutine: string;
  todayProgress: string;
  allRoutines: string;
  today: string;
  addRoutine: string;
  noRoutineToday: string;
  noRoutineTodayDesc: string;
  noRoutines: string;
  noRoutinesDesc: string;
  allDone: string;
  allDoneMsg: string;
  keepGoing: string;
  keepGoingMsg: string;
  letsStart: string;
  now: string;
  soon: string;
  tap: string;
  quickAdd: string;
  completeRoutine: string;
  completeRoutineConfirm: string;
  yes: string;
  no: string;
  routineTitle: string;
  routineDescription: string;
  routineTime: string;
  routineCategory: string;
  routineDays: string;
  enableReminder: string;
  enableReminderDesc: string;
  updateRoutine: string;
  routineDeleted: string;
  deleteRoutineConfirm: string;
  routineEnabled: string;
  routineDisabled: string;
  next: string;
  nextRoutine: string;
  completed: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // App
    appName: 'Memento',
    homeSubtitle: "Let's exercise your memory",
    takeYourTime: "Take your time. There's no rush.",
    home: 'Home',
    loading: 'Loading...',
    encouragement: "Take your time. You're doing great!",
    language: 'Language',
    selectLanguage: 'Select Language',
    settings: 'Settings',

    // Game
    whoIsThis: 'Who is this?',
    familyAlbum: 'Family Album',
    whatSound: 'What sound is this?',
    soundMatch: 'Sound Match',
    progress: 'of',
    tapToHearSound: 'Tap to hear sound',
    hint: 'Hint',
    imageNotAvailable: 'Image not available',
    wonderful: 'Wonderful!',
    greatJob: 'You did a great job today!\nWould you like to try again?',
    playAgain: 'Try Again',
    goHome: 'Go Home',
    goHomeQuestion: 'Go Home?',
    progressSaved: 'Your progress will be saved.',
    stay: 'Stay',
    soundPlaying: 'Sound Playing',
    imagineHearing: 'Imagine hearing',
    playSound: 'Play sound',
    tapToHearAgain: 'Tap to hear the sound again',
    selectAnswer: 'Select as your answer',

    // Profile
    profiles: 'Profiles',
    selectProfile: 'Select Profile',
    createProfile: 'Create New Profile',
    enterName: 'Enter name',
    create: 'Create',
    cancel: 'Cancel',
    delete: 'Delete',
    deleteProfile: 'Delete Profile',
    deleteConfirm: 'Are you sure you want to delete this profile?',
    noProfiles: 'No profiles yet',
    welcome: 'Welcome',
    switchProfile: 'Switch Profile',

    // Caregiver
    caregiverMode: 'Caregiver Mode',
    addContent: 'Add Content',
    manageContent: 'Manage Content',
    addPhoto: 'Add Photo',
    addSound: 'Add Sound',
    photoName: 'Who is this person?',
    soundName: 'What is this sound?',
    hintOptional: 'Hint (optional)',
    save: 'Save',
    selectImage: 'Select Image',
    recordSound: 'Record Sound',
    noContent: 'No content yet',
    addFirstContent: 'Add photos and sounds for memory exercises',
    visualCards: 'Photos',
    audioCards: 'Sounds',
    editCard: 'Edit',
    deleteCard: 'Delete',
    deleteCardConfirm: 'Are you sure you want to delete this card?',
    needMoreCards: 'Need More Cards',
    minCardsRequired: 'Add cards to do this exercise',

    // Safety Screen
    safety: 'Safety',
    safetySetup: 'Set Home Location',
    safetySetupDesc: 'Mark your home on the map or use your current location',
    homeLocation: 'Home Location',
    setHomeLocation: 'Set Home Location',
    editHomeLocation: 'Edit Home',
    homeLocationSaved: 'Home location saved successfully',
    homeInfo: '🏠 Home Information',
    homeName: 'Home Name',
    homeAddress: 'Address',
    fullName: 'Full Name',
    fullNamePlaceholder: 'Your first and last name',
    homeNamePlaceholder: "e.g. Mom's House",
    homeAddressPlaceholder: 'Home address',
    useCurrentLocation: '📍 Use My Location',
    saveHome: 'Save',
    atHome: 'You are Home',
    awayFromHome: 'Away from Home',
    distanceFromHome: 'Distance from home',
    getDirections: '🧭 Directions',
    locationMonitoring: 'Location Monitoring',
    locationMonitoringDesc: 'Get reminders when you are away from home',
    reminderFrequency: 'Reminder Frequency',
    testNotification: '🔔 Send Test Notification',
    sendTestNotification: 'Test notification sent!',
    quickAccess: '🚀 Quick Access',
    getDirectionsHome: 'Get Directions Home',
    getDirectionsHomeDesc: 'Opens directions in Maps app',
    showMyInfo: 'Show My Information',
    showMyInfoDesc: 'See your name and home address',
    myHomeInfo: '🏠 My Home Information',
    monitoringStarted: 'Monitoring Started',
    monitoringStartedDesc: 'You will receive reminders when away from home.',
    locationPermission: 'Location Permission',
    locationPermissionRequired: 'Location permission is required for tracking',
    backgroundLocationPermission: 'Background Location',
    backgroundLocationRequired: 'Background location permission needed for continuous tracking',
    homeLocationRequired: 'Home Location Required',
    setHomeFirst: 'Please save your home location first',
    missingInfo: 'Missing Information',
    fillAllFields: 'Please fill in all fields',
    minutes: 'min',
    edit: 'Edit',
    ok: 'OK',
    addressNotFound: 'Address not found',
    locationError: 'Error',
    locationErrorDesc: 'Could not get location',

    // Routine Screen
    dailyRoutine: 'Daily Routine',
    todayProgress: "Today's Progress",
    allRoutines: 'All',
    today: 'Today',
    addRoutine: 'Add Routine',
    noRoutineToday: 'No routines for today',
    noRoutineTodayDesc: 'Tap + to add a new routine',
    noRoutines: 'No routines yet',
    noRoutinesDesc: 'Add daily routines like medication, meals, or exercise',
    allDone: '🎉 Amazing!',
    allDoneMsg: 'You completed all routines today!',
    keepGoing: '👍 Great progress!',
    keepGoingMsg: 'routines remaining',
    letsStart: '💪 Let\'s get started!',
    now: 'Now',
    soon: 'Soon',
    tap: 'Tap',
    quickAdd: 'Quick Add',
    completeRoutine: '✓ Mark as Done?',
    completeRoutineConfirm: 'Mark this routine as completed?',
    yes: 'Yes, Done!',
    no: 'No',
    routineTitle: 'Routine Title',
    routineDescription: 'Description (optional)',
    routineTime: 'Time',
    routineCategory: 'Category',
    routineDays: 'Days',
    enableReminder: 'Enable Reminder',
    enableReminderDesc: 'Receive a notification at the scheduled time',
    updateRoutine: 'Update',
    routineDeleted: 'Routine deleted',
    deleteRoutineConfirm: 'Are you sure you want to delete this routine?',
    routineEnabled: 'Routine enabled',
    routineDisabled: 'Routine disabled',
    next: 'Next',
    nextRoutine: 'Next:',
    completed: 'Completed',
  },

  tr: {
    // App
    appName: 'Memento',
    homeSubtitle: 'Hafızanızı çalıştıralım',
    takeYourTime: 'Acele etmeyin. Zaman sizin.',
    home: 'Ana Sayfa',
    loading: 'Yükleniyor...',
    encouragement: 'Acele etmeyin. Harika gidiyorsunuz!',
    language: 'Dil',
    selectLanguage: 'Dil Seçin',
    settings: 'Ayarlar',

    // Game
    whoIsThis: 'Bu kim?',
    familyAlbum: 'Aile Albümü',
    whatSound: 'Bu ne sesi?',
    soundMatch: 'Ses Eşleştirme',
    progress: '/',
    tapToHearSound: 'Sesi duymak için dokunun',
    hint: 'İpucu',
    imageNotAvailable: 'Görsel mevcut değil',
    wonderful: 'Harika!',
    greatJob: 'Bugün çok iyi iş çıkardınız!\nTekrar yapmak ister misiniz?',
    playAgain: 'Tekrarla',
    goHome: 'Ana Sayfaya Dön',
    goHomeQuestion: 'Ana Sayfaya Dönülsün mü?',
    progressSaved: 'İlerlemeniz kaydedilecek.',
    stay: 'Kal',
    soundPlaying: 'Ses Çalıyor',
    imagineHearing: 'Şu sesi duyduğunuzu hayal edin',
    playSound: 'Sesi çal',
    tapToHearAgain: 'Sesi tekrar duymak için dokunun',
    selectAnswer: 'Cevap olarak seçin',

    // Profile
    profiles: 'Profiller',
    selectProfile: 'Profil Seçin',
    createProfile: 'Yeni Profil Oluştur',
    enterName: 'İsim girin',
    create: 'Oluştur',
    cancel: 'İptal',
    delete: 'Sil',
    deleteProfile: 'Profili Sil',
    deleteConfirm: 'Bu profili silmek istediğinizden emin misiniz?',
    noProfiles: 'Henüz profil yok',
    welcome: 'Hoş geldiniz',
    switchProfile: 'Profil Değiştir',

    // Caregiver
    caregiverMode: 'Bakıcı Modu',
    addContent: 'İçerik Ekle',
    manageContent: 'İçerikleri Yönet',
    addPhoto: 'Fotoğraf Ekle',
    addSound: 'Ses Ekle',
    photoName: 'Bu kişi kim?',
    soundName: 'Bu ne sesi?',
    hintOptional: 'İpucu (isteğe bağlı)',
    save: 'Kaydet',
    selectImage: 'Görsel Seç',
    recordSound: 'Ses Kaydet',
    noContent: 'Henüz içerik yok',
    addFirstContent: 'Hafıza egzersizleri için fotoğraf ve ses ekleyin',
    visualCards: 'Fotoğraflar',
    audioCards: 'Sesler',
    editCard: 'Düzenle',
    deleteCard: 'Sil',
    deleteCardConfirm: 'Bu kartı silmek istediğinizden emin misiniz?',
    needMoreCards: 'Daha Fazla Kart Gerekli',
    minCardsRequired: 'Bu aktiviteyi yapmak için kart ekleyin',

    // Safety Screen
    safety: 'Güvenlik',
    safetySetup: 'Ev Konumunu Ayarla',
    safetySetupDesc: 'Haritada evinizi işaretleyin veya mevcut konumunuzu kullanın',
    homeLocation: 'Ev Konumu',
    setHomeLocation: 'Ev Konumunu Ayarla',
    editHomeLocation: 'Evi Düzenle',
    homeLocationSaved: 'Ev konumunuz kaydedildi',
    homeInfo: '🏠 Ev Bilgileri',
    homeName: 'Ev Adı',
    homeAddress: 'Adres',
    fullName: 'Ad Soyad',
    fullNamePlaceholder: 'Adınız ve soyadınız',
    homeNamePlaceholder: 'Örn: Annemin Evi',
    homeAddressPlaceholder: 'Ev adresi',
    useCurrentLocation: '📍 Konumumu Kullan',
    saveHome: 'Kaydet',
    atHome: 'Evdesiniz',
    awayFromHome: 'Evden Uzaktasınız',
    distanceFromHome: 'Eve uzaklık',
    getDirections: '🧭 Yol Tarifi',
    locationMonitoring: 'Konum Takibi',
    locationMonitoringDesc: 'Evden uzaklaştığınızda hatırlatma alın',
    reminderFrequency: 'Hatırlatma Sıklığı',
    testNotification: '🔔 Test Bildirimi Gönder',
    sendTestNotification: 'Test bildirimi gönderildi!',
    quickAccess: '🚀 Hızlı Erişim',
    getDirectionsHome: 'Eve Yol Tarifi Al',
    getDirectionsHomeDesc: 'Harita uygulamasında yol tarifi açılır',
    showMyInfo: 'Bilgilerimi Göster',
    showMyInfoDesc: 'Ad, soyad ve ev adresinizi görün',
    myHomeInfo: '🏠 Ev Bilgilerim',
    monitoringStarted: 'Takip Başladı',
    monitoringStartedDesc: 'Evden uzaktaysanız hatırlatma alacaksınız.',
    locationPermission: 'Konum İzni',
    locationPermissionRequired: 'Konum takibi için izin gerekli',
    backgroundLocationPermission: 'Arka Plan Konum',
    backgroundLocationRequired: 'Sürekli takip için arka plan konum izni gerekli',
    homeLocationRequired: 'Ev Konumu Gerekli',
    setHomeFirst: 'Önce ev konumunuzu kaydedin',
    missingInfo: 'Eksik Bilgi',
    fillAllFields: 'Lütfen tüm alanları doldurun',
    minutes: 'dk',
    edit: 'Düzenle',
    ok: 'Tamam',
    addressNotFound: 'Adres bulunamadı',
    locationError: 'Hata',
    locationErrorDesc: 'Konum alınamadı',

    // Routine Screen
    dailyRoutine: 'Günlük Rutin',
    todayProgress: 'Bugünün İlerlemesi',
    allRoutines: 'Tümü',
    today: 'Bugün',
    addRoutine: 'Rutin Ekle',
    noRoutineToday: 'Bugün için rutin yok',
    noRoutineTodayDesc: 'Yeni rutin eklemek için + butonuna dokunun',
    noRoutines: 'Henüz rutin yok',
    noRoutinesDesc: 'İlaç, yemek, egzersiz gibi günlük rutinler ekleyin',
    allDone: '🎉 Harika!',
    allDoneMsg: 'Tüm rutinleri tamamladınız!',
    keepGoing: '👍 Güzel gidiyorsunuz!',
    keepGoingMsg: 'rutin kaldı',
    letsStart: '💪 Haydi başlayalım!',
    now: 'Şimdi',
    soon: 'Yakında',
    tap: 'Dokun',
    quickAdd: 'Hızlı Ekle',
    completeRoutine: '✓ Tamamlandı mı?',
    completeRoutineConfirm: 'tamamlandı olarak işaretlensin mi?',
    yes: 'Evet, Tamamlandı',
    no: 'Hayır',
    routineTitle: 'Rutin Başlığı',
    routineDescription: 'Açıklama (isteğe bağlı)',
    routineTime: 'Saat',
    routineCategory: 'Kategori',
    routineDays: 'Günler',
    enableReminder: 'Hatırlatıcıyı Etkinleştir',
    enableReminderDesc: 'Belirtilen saatte bildirim alın',
    updateRoutine: 'Güncelle',
    routineDeleted: 'Rutin silindi',
    deleteRoutineConfirm: 'Bu rutini silmek istediğinizden emin misiniz?',
    routineEnabled: 'Rutin etkinleştirildi',
    routineDisabled: 'Rutin devre dışı bırakıldı',
    next: 'Sonraki',
    nextRoutine: 'Sıradaki:',
    completed: 'Tamamlandı',
  },
};
