// Health check endpoint
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Flurfunk API',
      version: '1.0.0'
    });
  }

  return res.status(405).json({ 
    error: 'Method not allowed' 
  });
}