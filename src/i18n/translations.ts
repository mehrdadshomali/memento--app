/**
 * Memento - Çoklu Dil Desteği
 */

export type Language = 'en' | 'tr';

export interface Translations {
  appName: string;
  homeSubtitle: string;
  whoIsThis: string;
  familyAlbum: string;
  whatSound: string;
  soundMatch: string;
  takeYourTime: string;
  home: string;
  loading: string;
  progress: string;
  encouragement: string;
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
  language: string;
  selectLanguage: string;
  settings: string;
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
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: 'Memento',
    homeSubtitle: "Let's exercise your memory",
    whoIsThis: 'Who is this?',
    familyAlbum: 'Family Album',
    whatSound: 'What sound is this?',
    soundMatch: 'Sound Match',
    takeYourTime: "Take your time. There's no rush.",
    home: 'Home',
    loading: 'Loading...',
    progress: 'of',
    encouragement: "Take your time. You're doing great!",
    tapToHearSound: 'Tap to hear sound',
    hint: 'Hint',
    imageNotAvailable: 'Image not available',
    wonderful: 'Wonderful!',
    greatJob: 'You did a great job today!\nWould you like to play again?',
    playAgain: 'Play Again',
    goHome: 'Go Home',
    goHomeQuestion: 'Go Home?',
    progressSaved: 'Your progress will be saved.',
    stay: 'Stay',
    soundPlaying: 'Sound Playing',
    imagineHearing: 'Imagine hearing',
    playSound: 'Play sound',
    tapToHearAgain: 'Tap to hear the sound again',
    selectAnswer: 'Select as your answer',
    language: 'Language',
    selectLanguage: 'Select Language',
    settings: 'Settings',
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
    minCardsRequired: 'Add at least 3 cards to play this game',
  },
  tr: {
    appName: 'Memento',
    homeSubtitle: 'Hafızanızı çalıştıralım',
    whoIsThis: 'Bu kim?',
    familyAlbum: 'Aile Albümü',
    whatSound: 'Bu ne sesi?',
    soundMatch: 'Ses Eşleştirme',
    takeYourTime: 'Acele etmeyin. Zaman sizin.',
    home: 'Ana Sayfa',
    loading: 'Yükleniyor...',
    progress: '/',
    encouragement: 'Acele etmeyin. Harika gidiyorsunuz!',
    tapToHearSound: 'Sesi duymak için dokunun',
    hint: 'İpucu',
    imageNotAvailable: 'Görsel mevcut değil',
    wonderful: 'Harika!',
    greatJob: 'Bugün çok iyi iş çıkardınız!\nTekrar oynamak ister misiniz?',
    playAgain: 'Tekrar Oyna',
    goHome: 'Ana Sayfaya Dön',
    goHomeQuestion: 'Ana Sayfaya Dönülsün mü?',
    progressSaved: 'İlerlemeniz kaydedilecek.',
    stay: 'Kal',
    soundPlaying: 'Ses Çalıyor',
    imagineHearing: 'Şu sesi duyduğunuzu hayal edin',
    playSound: 'Sesi çal',
    tapToHearAgain: 'Sesi tekrar duymak için dokunun',
    selectAnswer: 'Cevap olarak seçin',
    language: 'Dil',
    selectLanguage: 'Dil Seçin',
    settings: 'Ayarlar',
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
    minCardsRequired: 'Bu oyunu oynamak için en az 3 kart ekleyin',
  },
};
