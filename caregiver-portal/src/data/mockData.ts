/**
 * Mock data for Caregiver Portal
 */

import type { PatientData, ActivityLog, DailyStats } from '../types';

// Generate last 7 days stats
const generateStats = (): DailyStats[] => {
  const stats: DailyStats[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    stats.push({
      date: date.toISOString().split('T')[0],
      gamesPlayed: Math.floor(Math.random() * 5) + 1,
      routinesCompleted: Math.floor(Math.random() * 6) + 2,
      totalRoutines: 8,
      timeSpentMinutes: Math.floor(Math.random() * 30) + 15,
    });
  }
  return stats;
};

// Generate activity logs
const generateActivities = (): ActivityLog[] => {
  const activities: ActivityLog[] = [
    {
      id: '1',
      type: 'routine_completed',
      title: 'Sabah İlacı alındı',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      type: 'game_played',
      title: 'Aile Albümü oyunu oynandı',
      description: '5 karttan 4 doğru',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      type: 'routine_completed',
      title: 'Kahvaltı yapıldı',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      type: 'location_alert',
      title: 'Evden ayrıldı',
      description: 'Konum: Atatürk Caddesi',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '5',
      type: 'app_opened',
      title: 'Uygulama açıldı',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '6',
      type: 'routine_completed',
      title: 'Yürüyüş yapıldı',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '7',
      type: 'game_played',
      title: 'Ses Eşleştirme oyunu oynandı',
      description: '5 karttan 5 doğru',
      timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
    },
  ];
  return activities;
};

export const mockPatientData: PatientData = {
  patient: {
    id: '1',
    name: 'Ayşe Teyze',
    createdAt: '2024-01-15T10:00:00Z',
    lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    location: {
      latitude: 41.0082,
      longitude: 28.9784,
      address: 'Atatürk Caddesi No:15, Kadıköy',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      isHome: false,
    },
    homeLocation: {
      latitude: 41.0122,
      longitude: 28.9760,
      address: 'Moda Caddesi No:42, Kadıköy, İstanbul',
    },
  },
  cards: [
    {
      id: 'c1',
      imageUri: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=400',
      correctLabel: 'Kızım Fatma',
      type: 'visual',
      category: 'family',
      hint: 'Her Pazar gelir',
      createdAt: '2024-01-16T10:00:00Z',
    },
    {
      id: 'c2',
      imageUri: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400',
      correctLabel: 'Oğlum Ahmet',
      type: 'visual',
      category: 'family',
      hint: 'Doktor',
      createdAt: '2024-01-16T10:00:00Z',
    },
    {
      id: 'c3',
      imageUri: 'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=400',
      correctLabel: 'Torunum Elif',
      type: 'visual',
      category: 'family',
      hint: 'Resim yapmayı sever',
      createdAt: '2024-01-17T10:00:00Z',
    },
    {
      id: 'c4',
      imageUri: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
      correctLabel: 'Kedi Sesi',
      type: 'audio',
      audioUri: 'cat_meow.mp3',
      hint: 'Tüylü arkadaş',
      createdAt: '2024-01-18T10:00:00Z',
    },
  ],
  routines: [
    {
      id: 'r1',
      title: 'Sabah İlacı',
      category: 'medication',
      time: '08:00',
      days: [0, 1, 2, 3, 4, 5, 6],
      isEnabled: true,
      icon: '💊',
      color: '#E57373',
    },
    {
      id: 'r2',
      title: 'Kahvaltı',
      category: 'meal',
      time: '09:00',
      days: [0, 1, 2, 3, 4, 5, 6],
      isEnabled: true,
      icon: '🍽️',
      color: '#FFB74D',
    },
    {
      id: 'r3',
      title: 'Yürüyüş',
      category: 'exercise',
      time: '10:30',
      days: [1, 2, 3, 4, 5],
      isEnabled: true,
      icon: '🚶',
      color: '#81C784',
    },
    {
      id: 'r4',
      title: 'Öğle Yemeği',
      category: 'meal',
      time: '12:30',
      days: [0, 1, 2, 3, 4, 5, 6],
      isEnabled: true,
      icon: '🍽️',
      color: '#FFB74D',
    },
    {
      id: 'r5',
      title: 'Akşam İlacı',
      category: 'medication',
      time: '20:00',
      days: [0, 1, 2, 3, 4, 5, 6],
      isEnabled: true,
      icon: '💊',
      color: '#E57373',
    },
  ],
  activities: generateActivities(),
  stats: generateStats(),
};
