# Flurfunk Mobile App

React Native mobile app for the Flurfunk hyperlocal social network.

## Features

- 📱 Location-based messaging
- 🗺️ Interactive map with message pins
- 📝 Twitter-style message feed
- ✏️ Modal compose interface
- 🔄 Dynamic region-based loading

## Setup

```bash
npm install
npx expo start
```

## Environment Variables

Create `.env.local`:
```bash
EXPO_PUBLIC_API_URL=https://flurfunk.vercel.app/api
```

## Dependencies

- **Expo** - React Native framework
- **expo-location** - GPS functionality
- **react-native-maps** - Map component
- **@react-native-async-storage/async-storage** - Local storage

## Development

```bash
# Start development server
npx expo start

# Start with tunnel (for external testing)
npx expo start --tunnel

# Start web version
npx expo start --web
```

## Building for Production

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Build for app stores
eas build --platform all
```

## Project Structure

```
frontend/
├── components/          # React components
│   ├── ComposeButton.tsx
│   ├── ComposeModal.tsx  
│   ├── MessageFeed.tsx
│   └── MessageMap.tsx
├── services/           # API client
├── utils/             # Helper functions
├── types.ts           # TypeScript types
└── App.tsx           # Main app component
```