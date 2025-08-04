# Flurfunk

**Hyperlocal Social Network**

Flurfunk is a mobile-first social network where users can post anonymous messages tied to their location. See what's happening around you within a 5km radius.

## Features

- 📍 **Location-based messaging** - Messages are tied to GPS coordinates
- 🗺️ **Interactive map** - See message pins on a map view
- 📱 **Mobile-first design** - Optimized for mobile devices
- 👤 **Anonymous posting** - No user accounts required
- 📏 **Distance-aware** - See how far away each message is from your location
- ⏰ **Real-time feed** - Messages sorted by time, newest first

## Getting Started

### Prerequisites
- Node.js 18+ 
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app on your mobile device

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npx expo start
```

3. Scan the QR code with Expo Go app on your device

### Permissions

The app requires location permissions to:
- Show your current location on the map
- Filter messages within 5km radius
- Associate new messages with your location

## How to Use

1. **Grant location permission** when prompted
2. **View the map** at the top showing nearby message pins
3. **Post a message** using the text input (280 character limit)
4. **Browse the feed** to see messages sorted by time
5. **Check distances** - each message shows how far away it was posted

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **expo-location** for GPS functionality
- **react-native-maps** for map visualization
- **AsyncStorage** for local data persistence

## Project Structure

```
├── App.tsx                 # Main app component
├── components/            
│   ├── MessageFeed.tsx    # Message list component
│   ├── MessageMap.tsx     # Map with message pins
│   └── PostMessage.tsx    # Message posting component
├── utils/
│   ├── location.ts        # Location utilities & distance calculations
│   ├── storage.ts         # AsyncStorage helpers
│   └── sampleData.ts      # Sample messages for testing
└── types.ts               # TypeScript interfaces
```

## Development Notes

- Sample messages are automatically generated for testing
- Messages persist locally using AsyncStorage
- 5km radius filter for nearby messages
- Haversine formula for distance calculations