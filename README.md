<p align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native"/>
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo"/>
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License"/>
</p>

<h1 align="center">🧠 Memento</h1>

<p align="center">
  <strong>A Therapeutic Memory Exercise Application for Alzheimer's Patients</strong>
</p>

<p align="center">
  Memento is a compassionate, accessibility-focused mobile application designed to help Alzheimer's patients exercise their memory through personalized visual and auditory exercises. Built with love for patients and their caregivers.
</p>

---

## 📖 Table of Contents

- [About The Project](#-about-the-project)
- [Key Features](#-key-features)
- [Design Philosophy](#-design-philosophy)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Usage Guide](#-usage-guide)
- [Accessibility Features](#-accessibility-features)
- [Internationalization](#-internationalization)
- [Contributing](#-contributing)
- [Roadmap](#-roadmap)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

---

## 🎯 About The Project

Alzheimer's disease affects millions of people worldwide, impacting their ability to recognize loved ones and familiar sounds. **Memento** was created to provide a gentle, supportive tool that helps patients maintain cognitive connections through personalized memory exercises.

### The Problem
- Traditional memory apps are not designed for elderly users with cognitive impairments
- Generic content doesn't create meaningful connections
- Harsh feedback (wrong/right) can cause anxiety and frustration
- Complex interfaces overwhelm users with cognitive challenges

### Our Solution
- **Personalized content** - Caregivers add real family photos and voice recordings
- **Errorless learning** - No harsh "wrong" feedback, gentle guidance instead
- **Calming design** - Bohemian, minimal aesthetic with soothing colors
- **Simple navigation** - Large buttons, clear text, intuitive flow

---

## ✨ Key Features

### 🖼️ Visual Memory Module - "Who Is This?"
- Display family photos uploaded by caregivers
- Multiple choice answers with gentle feedback
- Hints available after incorrect attempts
- Progress tracking through visual indicators

### 🔊 Auditory Memory Module - "What Sound Is This?"
- Play recorded family voices or familiar sounds
- Match sounds to corresponding images
- Support for both recorded audio and file uploads
- Thumbnail images for visual association

### 👥 Multi-Profile System
- Create unlimited patient profiles
- Each profile has its own content library
- Easy profile switching
- Secure local data storage

### 👨‍👩‍👧 Caregiver Mode
- Add photos from device gallery
- Record audio directly in-app
- Import audio files from device
- Add helpful hints for each card
- Manage and delete content easily

### 🌍 Bilingual Support
- Full English support
- Full Turkish support (Türkçe)
- Easy language switching
- Persistent language preference

---

## 🎨 Design Philosophy

### Errorless Learning Approach
Based on cognitive rehabilitation research, Memento implements **errorless learning** principles:

```
❌ Traditional App          ✅ Memento
─────────────────          ─────────────
"WRONG!" (red X)     →     Gentle fade out
Harsh buzzer sound   →     Silent transition
Immediate failure    →     Try again encouraged
Anxiety-inducing     →     Calm, supportive
```

### Visual Design Principles
- **High Contrast**: Warm taupe (#8B7355) on cream (#FDFCFA) backgrounds
- **Large Typography**: Minimum 16px, titles up to 52px
- **Touch Targets**: Minimum 56px height for all interactive elements
- **Minimal Distractions**: Clean, uncluttered interfaces
- **Calming Colors**: Bohemian palette with earth tones

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#8B7355` | Buttons, accents |
| Background | `#FDFCFA` | Main background |
| Card | `#F2EDE7` | Card backgrounds |
| Accent | `#9CAF88` | Success states |
| Text | `#3D3630` | Primary text |

---

## 📱 Screenshots

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│                 │  │                 │  │                 │
│  PROFILE SELECT │  │   HOME SCREEN   │  │   GAME SCREEN   │
│                 │  │                 │  │                 │
│  ○ Grandma Rose │  │    MEMENTO      │  │  Who is this?   │
│  ○ Uncle Tom    │  │    ─────        │  │                 │
│                 │  │                 │  │   [  Photo  ]   │
│  [+ New Profile]│  │  [Who is this?] │  │                 │
│                 │  │  [What sound?]  │  │  [ Option 1 ]   │
│                 │  │                 │  │  [ Option 2 ]   │
│                 │  │  [Caregiver]    │  │  [ Option 3 ]   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React Native | 0.76+ | Cross-platform mobile framework |
| Expo | SDK 54 | Development platform & tools |
| TypeScript | 5.3+ | Type-safe JavaScript |
| React Navigation | 7.x | Screen navigation |
| AsyncStorage | 2.x | Local data persistence |
| Expo AV | 15.x | Audio recording & playback |
| Expo Image Picker | 16.x | Photo selection |
| Expo Document Picker | 13.x | File selection |

---

## 📁 Project Structure

```
MemoBridge/
├── App.tsx                    # Application entry point
├── app.json                   # Expo configuration
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript configuration
│
├── assets/                    # Static assets
│   ├── icon.png
│   ├── splash-icon.png
│   └── adaptive-icon.png
│
└── src/
    ├── components/            # Reusable UI components
    │   ├── index.ts
    │   ├── GameCard.tsx       # Card display component
    │   └── OptionButton.tsx   # Answer button component
    │
    ├── constants/
    │   └── theme.ts           # Design tokens & colors
    │
    ├── context/               # React Context providers
    │   ├── GameContext.tsx    # Game state management
    │   └── ProfileContext.tsx # Profile & content management
    │
    ├── data/
    │   └── mockData.ts        # Sample data for development
    │
    ├── i18n/                  # Internationalization
    │   ├── index.ts
    │   ├── translations.ts    # EN/TR translations
    │   └── LanguageContext.tsx
    │
    ├── navigation/
    │   └── AppNavigator.tsx   # Navigation configuration
    │
    ├── screens/               # Application screens
    │   ├── index.ts
    │   ├── ProfileSelectScreen.tsx
    │   ├── HomeScreen.tsx
    │   ├── GameScreen.tsx
    │   └── CaregiverScreen.tsx
    │
    └── types/
        └── index.ts           # TypeScript type definitions
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo Go app on your mobile device
- iOS Simulator (Mac) or Android Emulator (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mehrdadshomali/memento--app.git
   cd memento--app/MemoBridge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on device**
   - Scan QR code with Expo Go (Android)
   - Scan QR code with Camera app (iOS)
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator

### Environment Setup

No additional environment variables required for basic usage. All data is stored locally on device.

---

## 📖 Usage Guide

### For Caregivers

#### Creating a Profile
1. Open the app
2. Tap "Create New Profile"
3. Enter the patient's name
4. Tap "Create"

#### Adding Visual Content (Photos)
1. Select a profile
2. Tap "Caregiver Mode"
3. Tap "+ Add Photo"
4. Select image from gallery
5. Enter the person/place name
6. Add an optional hint
7. Tap "Save"

#### Adding Audio Content (Sounds)
1. Tap "+ Add Sound"
2. Either:
   - Tap "Record" to capture audio
   - Tap "Select File" to import audio
3. Add a thumbnail image
4. Enter what the sound is
5. Add an optional hint
6. Tap "Save"

### For Patients

#### Playing Visual Memory Game
1. Tap "Who is this?"
2. Look at the photo
3. Tap the correct name
4. If wrong, the option fades - try again!
5. Progress dots show advancement

#### Playing Audio Memory Game
1. Tap "What sound is this?"
2. Tap the speaker to hear the sound
3. Match it to the correct image
4. Gentle hints appear if needed

---

## ♿ Accessibility Features

| Feature | Implementation |
|---------|----------------|
| Large Text | Minimum 16px, scalable up to 52px |
| High Contrast | WCAG AA compliant color ratios |
| Touch Targets | Minimum 56px × 56px |
| Screen Reader | Full accessibility labels |
| Reduced Motion | Gentle, non-distracting animations |
| Error Prevention | Errorless learning approach |
| Simple Navigation | Maximum 2 levels deep |
| Clear Feedback | Visual progress indicators |

---

## 🌐 Internationalization

Currently supported languages:
- 🇬🇧 English (en)
- 🇹🇷 Turkish (tr)

### Adding a New Language

1. Open `src/i18n/translations.ts`
2. Add new language code to `Language` type
3. Add translations object following existing structure
4. Update `LanguageContext.tsx` if needed

```typescript
// Example: Adding Spanish
export type Language = 'en' | 'tr' | 'es';

export const translations: Record<Language, Translations> = {
  // ... existing
  es: {
    appName: 'Memento',
    homeSubtitle: 'Ejercitemos tu memoria',
    // ... all other keys
  }
};
```

---

## 🤝 Contributing

Contributions are what make the open source community amazing! Any contributions you make are **greatly appreciated**.

### How to Contribute

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Ideas

- [ ] Add more languages
- [ ] Implement cloud sync for profiles
- [ ] Add difficulty levels
- [ ] Create progress reports for caregivers
- [ ] Add more game modes
- [ ] Improve audio visualization

---

## 🗺️ Roadmap

### Version 1.0 (Current)
- [x] Multi-profile system
- [x] Visual memory game
- [x] Audio memory game
- [x] Caregiver content management
- [x] Audio recording
- [x] Bilingual support (EN/TR)
- [x] Errorless learning

### Version 1.1 (Planned)
- [ ] Cloud backup & sync
- [ ] Progress analytics
- [ ] More languages
- [ ] Customizable themes
- [ ] Reminder notifications

### Version 2.0 (Future)
- [ ] AI-powered difficulty adjustment
- [ ] Video memory module
- [ ] Family sharing features
- [ ] Healthcare provider dashboard
- [ ] Research data export (anonymized)

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

```
MIT License

Copyright (c) 2024 Mehrdad Shomali

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) - Amazing development platform
- [React Native](https://reactnative.dev/) - Cross-platform framework
- [Alzheimer's Association](https://www.alz.org/) - Research and inspiration
- All caregivers and families supporting loved ones with Alzheimer's

---

<p align="center">
  Made with ❤️ for Alzheimer's patients and their families
</p>

<p align="center">
  <a href="https://github.com/mehrdadshomali/memento--app/issues">Report Bug</a>
  ·
  <a href="https://github.com/mehrdadshomali/memento--app/issues">Request Feature</a>
</p>
