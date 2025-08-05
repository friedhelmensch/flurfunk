# Flurfunk Web App

Next.js web application for the Flurfunk hyperlocal social network.

## Features

- 🌐 Web-based location messaging
- 🗺️ Interactive map with Leaflet
- 📱 Responsive design for mobile and desktop
- 🔄 Real-time message updates
- 📍 Browser geolocation support

## Setup

```bash
npm install
npm run dev
```

## Environment Variables

Create `.env.local`:
```bash
NEXT_PUBLIC_API_URL=https://flurfunk.vercel.app/api
```

## Dependencies

- **Next.js** - React framework
- **Leaflet** - Open-source map library
- **React Leaflet** - React components for Leaflet
- **Tailwind CSS** - Utility-first CSS framework

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

The web app can be deployed to Vercel, Netlify, or any static hosting service.

```bash
# Deploy to Vercel
vercel

# Or build static files
npm run build
npm run export
```

## Project Structure

```
web-app/
├── pages/              # Next.js pages
├── components/         # React components
├── styles/            # CSS styles
├── public/            # Static assets
└── next.config.js     # Next.js configuration
```