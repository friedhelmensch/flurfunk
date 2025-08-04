import { supabase } from '../lib/supabase.js';
import { validateNearbyQuery } from '../lib/validation.js';

export default async function handler(req, res) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      return await getNearbyMessages(req, res);
    } else {
      return res.status(405).json({ 
        error: 'Method not allowed',
        message: 'Only GET requests are allowed for this endpoint' 
      });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Something went wrong on our end' 
    });
  }
}

async function getNearbyMessages(req, res) {
  const { lat, lng, radius = 5 } = req.query;

  // Convert query params to numbers
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const radiusKm = parseFloat(radius);

  // Validate input
  const validationErrors = validateNearbyQuery(latitude, longitude, radiusKm);
  if (validationErrors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      messages: validationErrors
    });
  }

  try {
    // Use PostGIS function to get nearby messages
    const { data, error } = await supabase
      .rpc('get_nearby_messages', {
        user_lat: latitude,
        user_lng: longitude,
        radius_km: Math.floor(radiusKm)
      });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch nearby messages'
      });
    }

    // Transform data to match mobile app format
    const messages = data.map(row => ({
      id: row.id,
      text: row.text,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      timestamp: new Date(row.created_at).getTime(),
      distanceFromUser: parseFloat(row.distance_km)
    }));

    return res.status(200).json({
      success: true,
      data: messages,
      meta: {
        count: messages.length,
        radius: radiusKm,
        userLocation: {
          latitude,
          longitude
        }
      }
    });

  } catch (error) {
    console.error('Get nearby messages error:', error);
    return res.status(500).json({
      error: 'Failed to fetch messages',
      message: error.message
    });
  }
}