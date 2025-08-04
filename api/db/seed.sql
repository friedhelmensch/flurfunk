-- Seed the database with example messages
-- Using San Francisco coordinates as the center point (37.7749, -122.4194)

INSERT INTO messages (text, latitude, longitude) VALUES
-- Messages very close to the test point
('Great coffee shop here! ☕ The barista knows their stuff', 37.7750, -122.4195),
('Free WiFi and good vibes at this cafe', 37.7748, -122.4193),
('Anyone know why there are so many sirens around here?', 37.7747, -122.4196),

-- Messages a bit further but still within 5km
('Beautiful sunset view from Dolores Park 🌅', 37.7596, -122.4269),
('Street fair happening on Valencia Street this weekend!', 37.7611, -122.4214),
('Lost dog spotted - small brown terrier near Mission', 37.7598, -122.4148),
('Amazing burrito at this taqueria 🌯', 37.7655, -122.4077),
('Parking available on 16th Street', 37.7648, -122.4194),

-- Messages in nearby neighborhoods (2-4km away)
('Farmer''s market at Ferry Building is amazing 🥕', 37.7955, -122.3937),
('Giants game tonight! Go Giants! ⚾', 37.7786, -122.3893),
('Protest march starting at City Hall', 37.7792, -122.4191),
('Food truck festival in Golden Gate Park', 37.7694, -122.4862),

-- Messages further away (4-5km, still within radius)
('Beach cleanup at Ocean Beach tomorrow 🏖️', 37.7594, -122.5107),
('Hiking trail conditions good at Twin Peaks', 37.7544, -122.4477),
('New restaurant opening in Castro district', 37.7609, -122.4350),

-- One message just outside 5km radius (should not appear in test)
('Welcome to Berkeley! 🎓', 37.8715, -122.2730);

-- Verify the data was inserted
SELECT COUNT(*) as total_messages FROM messages;

-- Test the function with our seed data
SELECT 
  text,
  latitude,
  longitude,
  distance_km,
  created_at
FROM get_nearby_messages(37.7749, -122.4194, 5)
ORDER BY distance_km;