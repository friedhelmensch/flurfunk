-- Fix for radius filtering bug
-- This script fixes the get_nearby_messages function to accept decimal radius values
-- instead of only integers, which was causing database errors for small radius values

-- Drop the existing function (required when changing parameter types)
DROP FUNCTION IF EXISTS get_nearby_messages(DECIMAL, DECIMAL, INTEGER);

-- Recreate the function with proper decimal parameter type
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