// Debug endpoint to test Supabase connection
import { supabase } from './lib/supabase.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check environment variables
    const envCheck = {
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
      supabaseUrl: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0, 30) + '...' : 'missing',
      supabaseKeyLength: process.env.SUPABASE_ANON_KEY ? process.env.SUPABASE_ANON_KEY.length : 0
    };

    // Test basic Supabase connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('messages')
      .select('count', { count: 'exact', head: true });

    // Test direct query
    const { data: directQuery, error: directError } = await supabase
      .from('messages')
      .select('id, text')
      .limit(1);

    return res.status(200).json({
      success: true,
      environment: envCheck,
      connectionTest: {
        error: connectionError?.message || null,
        count: connectionTest || 'unknown'
      },
      directQuery: {
        error: directError?.message || null,
        data: directQuery || []
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}