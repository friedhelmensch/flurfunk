-- Flurfunk Database Schema for Supabase
-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Messages table with geospatial support
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL CHECK (char_length(text) <= 280 AND char_length(trim(text)) > 0),
  latitude DECIMAL(10, 8) NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
  longitude DECIMAL(11, 8) NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
  location GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (ST_MakePoint(longitude, latitude)) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_messages_location ON messages USING GIST (location);
CREATE INDEX idx_messages_created_at ON messages (created_at DESC);

-- Function to get nearby messages using PostGIS
CREATE OR REPLACE FUNCTION get_nearby_messages(
  user_lat DECIMAL(10, 8),
  user_lng DECIMAL(11, 8),
  radius_km INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  text TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE,
  distance_km DECIMAL(10, 3)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.text,
    m.latitude,
    m.longitude,
    m.created_at,
    ROUND(
      (ST_Distance(
        m.location,
        ST_MakePoint(user_lng, user_lat)::geography
      ) / 1000)::NUMERIC,
      3
    ) AS distance_km
  FROM messages m
  WHERE ST_DWithin(
    m.location,
    ST_MakePoint(user_lng, user_lat)::geography,
    radius_km * 1000 -- Convert km to meters
  )
  ORDER BY m.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) - Allow all operations for now
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy to allow all operations (can be restricted later)
CREATE POLICY "Allow all operations on messages" ON messages
  FOR ALL USING (true);