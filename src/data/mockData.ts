/**
 * MemoBridge - Mock Data
 * Simulates caregiver-uploaded content for MVP
 * In production, this would come from AsyncStorage or a backend
 */

import { MemoryCard } from '../types';

// Visual Memory Cards - "Family Album" module
export const visualMemoryCards: MemoryCard[] = [
  {
    id: 'v1',
    imageUri: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=400',
    correctLabel: 'Grandma Rose',
    type: 'visual',
    category: 'family',
    hint: 'She makes the best apple pie',
  },
  {
    id: 'v2',
    imageUri: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400',
    correctLabel: 'Uncle Tom',
    type: 'visual',
    category: 'family',
    hint: 'He loves fishing',
  },
  {
    id: 'v3',
    imageUri: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    correctLabel: 'Daughter Sarah',
    type: 'visual',
    category: 'family',
    hint: 'She visits every Sunday',
  },
  {
    id: 'v4',
    imageUri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    correctLabel: 'Son Michael',
    type: 'visual',
    category: 'family',
    hint: 'He is a doctor',
  },
  {
    id: 'v5',
    imageUri: 'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=400',
    correctLabel: 'Granddaughter Emma',
    type: 'visual',
    category: 'family',
    hint: 'She loves to draw',
  },
  {
    id: 'v6',
    imageUri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    correctLabel: 'Lake House',
    type: 'visual',
    category: 'places',
    hint: 'Summer vacations',
  },
  {
    id: 'v7',
    imageUri: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400',
    correctLabel: 'Downtown',
    type: 'visual',
    category: 'places',
    hint: 'Where we go shopping',
  },
  {
    id: 'v8',
    imageUri: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    correctLabel: 'Garden',
    type: 'visual',
    category: 'places',
    hint: 'Where the roses grow',
  },
];

// Audio Memory Cards - "Sound Match" module
// Note: In production, audioUri would point to actual audio files
export const audioMemoryCards: MemoryCard[] = [
  {
    id: 'a1',
    imageUri: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
    audioUri: 'cat_meow',
    correctLabel: 'Cat',
    type: 'audio',
    category: 'sounds',
    hint: 'A furry friend',
  },
  {
    id: 'a2',
    imageUri: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
    audioUri: 'dog_bark',
    correctLabel: 'Dog',
    type: 'audio',
    category: 'sounds',
    hint: 'Man\'s best friend',
  },
  {
    id: 'a3',
    imageUri: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    audioUri: 'coffee_pour',
    correctLabel: 'Coffee',
    type: 'audio',
    category: 'sounds',
    hint: 'Morning drink',
  },
  {
    id: 'a4',
    imageUri: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    audioUri: 'birds_chirping',
    correctLabel: 'Birds',
    type: 'audio',
    category: 'sounds',
    hint: 'They sing in the morning',
  },
  {
    id: 'a5',
    imageUri: 'https://images.unsplash.com/photo-1564429238980-16e22e037780?w=400',
    audioUri: 'doorbell',
    correctLabel: 'Doorbell',
    type: 'audio',
    category: 'sounds',
    hint: 'Someone is visiting',
  },
  {
    id: 'a6',
    imageUri: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400',
    audioUri: 'phone_ring',
    correctLabel: 'Telephone',
    type: 'audio',
    category: 'sounds',
    hint: 'Time to talk',
  },
  {
    id: 'a7',
    imageUri: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    audioUri: 'teaspoon_stirring',
    correctLabel: 'Tea Spoon',
    type: 'audio',
    category: 'sounds',
    hint: 'Stirring something warm',
  },
  {
    id: 'a8',
    imageUri: 'https://images.unsplash.com/photo-1501426026826-31c667bdf23d?w=400',
    audioUri: 'rain',
    correctLabel: 'Rain',
    type: 'audio',
    category: 'sounds',
    hint: 'Water from the sky',
  },
];

// Helper to get shuffled cards for a game session
export const getShuffledCards = (type: 'visual' | 'audio', count: number = 5): MemoryCard[] => {
  const cards = type === 'visual' ? visualMemoryCards : audioMemoryCards;
  const shuffled = [...cards].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

// Generate wrong options for a card (for multiple choice)
export const generateOptions = (correctCard: MemoryCard, allCards: MemoryCard[]): string[] => {
  const otherLabels = allCards
    .filter(card => card.id !== correctCard.id)
    .map(card => card.correctLabel);
  
  const shuffledOthers = otherLabels.sort(() => Math.random() - 0.5).slice(0, 2);
  const options = [correctCard.correctLabel, ...shuffledOthers];
  
  return options.sort(() => Math.random() - 0.5);
};

export const allCards = [...visualMemoryCards, ...audioMemoryCards];
