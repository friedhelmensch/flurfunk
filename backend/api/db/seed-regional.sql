-- Regional seed data script
-- Replace YOUR_LAT and YOUR_LNG with your actual coordinates
-- This script creates 50 messages within ~50km radius

-- Example coordinates (replace with your location):
-- San Francisco Bay Area example: 37.7749, -122.4194
-- Berlin example: 52.5200, 13.4050
-- London example: 51.5074, -0.1278
-- New York example: 40.7128, -74.0060

WITH locations AS (
  SELECT * FROM (VALUES
    -- Central city messages (your location ± 0.01 degrees ≈ 1km)
    (37.7749, -122.4194, 'Great coffee at this corner cafe! Perfect wifi spot ☕'),
    (37.7755, -122.4190, 'Street musician playing amazing jazz right now 🎵'),
    (37.7742, -122.4200, 'Free parking found on this street! 🚗'),
    (37.7750, -122.4185, 'Best tacos in the neighborhood 🌮'),
    (37.7745, -122.4205, 'Dog park is busy today - lots of friendly pups! 🐕'),
    
    -- Nearby neighborhoods (±0.05 degrees ≈ 5km)
    (37.7800, -122.4150, 'Farmers market happening now - fresh produce! 🥕'),
    (37.7700, -122.4250, 'Beautiful sunset view from this hill 🌅'),
    (37.7820, -122.4100, 'New restaurant opening - long queue already 🍽️'),
    (37.7680, -122.4280, 'Beach cleanup volunteer event starting soon 🏖️'),
    (37.7790, -122.4320, 'Outdoor movie screening tonight in the park 🎬'),
    
    -- Mid-range locations (±0.1 degrees ≈ 10km)
    (37.7850, -122.4050, 'Tech meetup at the coworking space 💻'),
    (37.7650, -122.4350, 'Vintage book sale at the library 📚'),
    (37.7900, -122.4200, 'Food truck festival this weekend! 🚚'),
    (37.7600, -122.4100, 'Hiking trail conditions are perfect today 🥾'),
    (37.7800, -122.4400, 'Street art tour starts here at 2pm 🎨'),
    
    -- Extended area (±0.2 degrees ≈ 20km)
    (37.7950, -122.4000, 'Wine tasting event at the vineyard 🍷'),
    (37.7550, -122.4400, 'Kayak rentals available at the marina ⛵'),
    (37.8000, -122.4100, 'Cycle path is clear - great for morning rides 🚴'),
    (37.7500, -122.4300, 'Organic farm offering tours today 🌱'),
    (37.7900, -122.4500, 'Train station has free wifi now 🚂'),
    
    -- Outer ring (±0.3 degrees ≈ 30km)
    (37.8100, -122.3900, 'Mountain bike trails reopened after rain 🚵'),
    (37.7400, -122.4500, 'Antique market every Sunday morning 🕰️'),
    (37.8050, -122.4300, 'New bridge offers amazing valley views 🌉'),
    (37.7450, -122.4000, 'Rock climbing spot - beginners welcome 🧗'),
    (37.7850, -122.4600, 'Local brewery doing tours every hour 🍺'),
    
    -- Far range (±0.4 degrees ≈ 40km)
    (37.8200, -122.3800, 'Ski resort opening early this season! ⛷️'),
    (37.7300, -122.4600, 'Hot air balloon rides on weekends 🎈'),
    (37.8150, -122.4400, 'Observatory open for night sky viewing 🔭'),
    (37.7350, -122.3900, 'Horse riding lessons for all levels 🐎'),
    (37.7750, -122.4700, 'Lighthouse tour with historical guide 🗼'),
    
    -- Maximum range (±0.45 degrees ≈ 50km)
    (37.8250, -122.3750, 'Fishing pier - early morning is best 🎣'),
    (37.7250, -122.4650, 'Outlet mall having weekend sale 🛍️'),
    (37.8200, -122.4450, 'Golf course in perfect condition ⛳'),
    (37.7300, -122.3850, 'Meditation retreat center open house 🧘'),
    (37.7700, -122.4750, 'Surf lessons available for beginners 🏄'),
    
    -- Additional variety messages
    (37.7800, -122.3950, 'Local band playing at the community center 🎤'),
    (37.7600, -122.4450, 'Farmers teaching organic gardening workshop 👨‍🌾'),
    (37.8050, -122.4150, 'Food photography class at the culinary school 📸'),
    (37.7550, -122.4250, 'Yoga in the park every Wednesday morning 🧘‍♀️'),
    (37.7950, -122.4350, 'Car boot sale with vintage finds 🚗'),
    (37.7450, -122.4150, 'Wildlife spotting tour in the nature reserve 🦎'),
    (37.8150, -122.4050, 'Art gallery featuring local painters 🖼️'),
    (37.7350, -122.4350, 'Community garden needs volunteers 🌻'),
    (37.7950, -122.3850, 'Pottery classes for beginners 🏺'),
    (37.7550, -122.4550, 'Night market with street food vendors 🌙'),
    (37.8100, -122.4250, 'Photography walk through historic district 📷'),
    (37.7400, -122.4250, 'Birdwatching group meets here Saturdays 🐦'),
    (37.7850, -122.3800, 'Cooking class featuring regional cuisine 👨‍🍳'),
    (37.7650, -122.4550, 'Community theater auditions this week 🎭'),
    (37.8000, -122.4350, 'Vintage car show every first Sunday 🚗'),
    (37.7500, -122.4050, 'Language exchange meetup at the cafe ☕'),
    (37.8200, -122.4200, 'Stargazing event if weather permits 🌟')
  ) AS t(lat, lng, message_text)
)
INSERT INTO messages (text, latitude, longitude, created_at)
SELECT 
  message_text,
  lat,
  lng,
  NOW() - INTERVAL '1 hour' * (ROW_NUMBER() OVER (ORDER BY RANDOM()))
FROM locations;

-- Verify the data was inserted
SELECT COUNT(*) as inserted_messages FROM messages WHERE created_at >= NOW() - INTERVAL '50 hours';

-- Show a sample of the new messages with distances from center point
SELECT 
  text,
  latitude,
  longitude,
  ROUND(
    ST_Distance(
      ST_MakePoint(longitude, latitude)::geography,
      ST_MakePoint(-122.4194, 37.7749)::geography
    ) / 1000,
    2
  ) AS distance_km,
  created_at
FROM messages 
WHERE created_at >= NOW() - INTERVAL '50 hours'
ORDER BY distance_km
LIMIT 10;