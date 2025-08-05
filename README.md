# Flurfunk

**Hyperlocal Social Network**

Flurfunk is a location-based social network where users can post anonymous messages tied to their GPS coordinates. Discover what's happening around you within a customizable radius.

## Project Structure

```
flurfunk2/
├── backend/          # Node.js API (deployed to Vercel)
├── mobile-app/       # React Native mobile app (Expo)
├── web-app/          # Next.js web app (Vercel/static)
└── README.md         # This file
```

## Quick Start

### Backend (API)
```bash
cd backend
npm install
vercel dev  # or vercel --prod to deploy
```

### Mobile App
```bash
cd mobile-app
npm install
npx expo start
```

### Web App
```bash
cd web-app
npm install
npm run dev
```

## Architecture

- **Backend**: Vercel serverless functions + Supabase (PostgreSQL + PostGIS)
- **Mobile App**: React Native + Expo + TypeScript
- **Web App**: Next.js + React + Leaflet maps
- **Database**: Supabase with geospatial queries

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/messages` - Create message
- `GET /api/messages/nearby` - Get messages in radius

## Features

- 📍 Location-based anonymous messaging
- 🗺️ Interactive map with message pins  
- 📱 Mobile-first design
- 🔄 Dynamic loading based on map region
- 📏 Distance-aware message feed
- ⚡ Real-time updates

## Environment Variables

See individual README files in `backend/`, `mobile-app/`, and `web-app/` directories.

## Deployment

- **Backend**: Auto-deploys to Vercel on push
- **Mobile App**: Use Expo EAS Build for app stores
- **Web App**: Deploy to Vercel, Netlify, or static hosting

---

Built with ❤️ using React Native, Vercel, and Supabase