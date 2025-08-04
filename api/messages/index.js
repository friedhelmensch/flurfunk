import { supabase } from '../lib/supabase.js';
import { validateMessage } from '../lib/validation.js';

export default async function handler(req, res) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    return await createMessage(req, res);
  } else {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are allowed for this endpoint' 
    });
  }
}

async function createMessage(req, res) {
  const { text, latitude, longitude } = req.body;

  // Validate input
  const validationErrors = validateMessage(text, latitude, longitude);
  if (validationErrors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      messages: validationErrors
    });
  }

  try {
    // Insert message into database
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

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to save message'
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
    console.error('Create message error:', error);
    return res.status(500).json({
      error: 'Failed to create message',
      message: error.message
    });
  }
}