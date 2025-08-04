# Flurfunk API

Serverless backend for Flurfunk hyperlocal social network built with Vercel Functions and Supabase.

## Architecture

```
Mobile App → Vercel API Functions → Supabase (PostgreSQL + PostGIS)
```

## API Endpoints

### Health Check
- `GET /api/health` - Service health status

### Messages
- `POST /api/messages` - Create new message
- `GET /api/messages/nearby?lat={}&lng={}&radius={}` - Get nearby messages

## Setup

1. **Supabase Setup:**
   - Create new Supabase project
   - Run `api/db/schema.sql` in SQL Editor
   - Get project URL and anon key

2. **Environment Variables:**
   ```bash
   # In Vercel dashboard or .env.local
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Deploy to Vercel:**
   ```bash
   vercel
   ```

## Database Schema

- **messages** table with PostGIS geography column
- **get_nearby_messages()** function for spatial queries
- Automatic distance calculation using PostGIS

## Features

- ✅ Input validation
- ✅ PostGIS geospatial queries
- ✅ CORS handling
- ✅ Error handling
- ⏳ Rate limiting (TODO)
- ⏳ Authentication (TODO)

## Testing

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Create message
curl -X POST https://your-app.vercel.app/api/messages \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world!","latitude":37.7749,"longitude":-122.4194}'

# Get nearby messages
curl "https://your-app.vercel.app/api/messages/nearby?lat=37.7749&lng=-122.4194&radius=5"
```