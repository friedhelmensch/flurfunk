// Debug POST endpoint
import { supabase } from './lib/supabase.js';
import { validateMessage } from './lib/validation.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, latitude, longitude } = req.body;
    
    // Debug request body
    console.log('Request body:', req.body);
    console.log('Text:', text, 'Lat:', latitude, 'Lng:', longitude);

    // Validate input
    const validationErrors = validateMessage(text, latitude, longitude);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        messages: validationErrors,
        receivedData: { text, latitude, longitude }
      });
    }

    // Test direct insert
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          text: text.trim(),
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude)
        }
      ])
      .select()
      .single();

    console.log('Supabase result:', { data, error });

    if (error) {
      return res.status(500).json({
        error: 'Database error',
        message: error.message,
        details: error,
        insertData: {
          text: text.trim(),
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude)
        }
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Message created successfully',
      data: {
        id: data.id,
        text: data.text,
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: new Date(data.created_at).getTime()
      }
    });

  } catch (error) {
    console.error('POST error:', error);
    return res.status(500).json({
      error: 'Caught exception',
      message: error.message,
      stack: error.stack
    });
  }
}