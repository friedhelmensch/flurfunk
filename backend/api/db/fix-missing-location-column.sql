-- Fix missing location column in messages table
-- This script adds the missing geography column and recreates the function

-- First, check if location column exists
-- If this query returns no rows, the column doesn't exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'messages' AND column_name = 'location';

-- Add the missing location column if it doesn't exist
-- This is a generated column that automatically calculates from lat/lng
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS location GEOGRAPHY(POINT, 4326) 
GENERATED ALWAYS AS (ST_MakePoint(longitude, latitude)) STORED;

-- Create the index for performance
CREATE INDEX IF NOT EXISTS idx_messages_location ON messages USING GIST (location);

-- Now recreate the function (drop all variations first)
DROP FUNCTION IF EXISTS get_nearby_messages(DECIMAL, DECIMAL, INTEGER);
DROP FUNCTION IF EXISTS get_nearby_messages(DECIMAL(10,8), DECIMAL(11,8), INTEGER);
DROP FUNCTION IF EXISTS get_nearby_messages(DECIMAL, DECIMAL, DECIMAL);
DROP FUNCTION IF EXISTS get_nearby_messages(DECIMAL(10,8), DECIMAL(11,8), DECIMAL);

-- Create the corrected function
CREATE OR REPLACE FUNCTION get_nearby_messages(
  user_lat DECIMAL(10, 8),
  user_lng DECIMAL(11, 8),
  radius_km DECIMAL(6, 3) DEFAULT 5.0
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

-- Verify the column was added
SELECT column_name, data_type, is_generated, generation_expression
FROM information_schema.columns 
WHERE table_name = 'messages' AND column_name = 'location';