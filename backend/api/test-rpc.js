// Test RPC function specifically
import { supabase } from './lib/supabase.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Test the RPC function directly
    const { data, error } = await supabase
      .rpc('get_nearby_messages', {
        user_lat: 37.7749,
        user_lng: -122.4194,
        radius_km: 5
      });

    return res.status(200).json({
      success: !error,
      data: data || [],
      error: error?.message || null,
      errorDetails: error || null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}