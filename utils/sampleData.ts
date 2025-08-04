import { Message } from '../types';

export const generateSampleMessages = (userLat: number, userLon: number): Message[] => {
  const messages: Message[] = [
    {
      id: '1',
      text: 'Great coffee shop here! ☕',
      latitude: userLat + 0.001,
      longitude: userLon + 0.001,
      timestamp: Date.now() - 1000 * 60 * 15, // 15 minutes ago
    },
    {
      id: '2',
      text: 'Anyone know why there are so many sirens around here?',
      latitude: userLat - 0.0015,
      longitude: userLon + 0.0005,
      timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    },
    {
      id: '3',
      text: 'Beautiful sunset from this spot 🌅',
      latitude: userLat + 0.002,
      longitude: userLon - 0.001,
      timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
    },
    {
      id: '4',
      text: 'Free parking available on Main Street!',
      latitude: userLat - 0.001,
      longitude: userLon - 0.002,
      timestamp: Date.now() - 1000 * 60 * 90, // 1.5 hours ago
    },
    {
      id: '5',
      text: 'Lost dog spotted - small brown terrier',
      latitude: userLat + 0.0025,
      longitude: userLon + 0.0015,
      timestamp: Date.now() - 1000 * 60 * 120, // 2 hours ago
    },
  ];

  return messages;
};