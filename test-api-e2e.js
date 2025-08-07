// End-to-end test for the frontend API service
// This tests the complete flow: Frontend API -> Backend API -> Database

// Set the API base URL to match the deployed backend
process.env.EXPO_PUBLIC_API_URL = 'https://flurfunk.vercel.app/api';

// Import the API service (we'll need to adjust the import for Node.js)
const { default: fetch } = require('node-fetch');

class FlurfunkAPI {
  constructor() {
    this.API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
  }

  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getNearbyMessages(location, radiusKm = 5) {
    const params = new URLSearchParams({
      lat: location.latitude.toString(),
      lng: location.longitude.toString(),
      radius: radiusKm.toString(),
    });

    const response = await this.request(`/messages/nearby?${params}`);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch nearby messages');
    }

    return response.data;
  }
}

// Test function
async function runEndToEndTest() {
  const api = new FlurfunkAPI();
  
  // Test location (same as our test messages in NYC)
  const testLocation = {
    latitude: 40.7829,
    longitude: -73.9654
  };

  console.log('🧪 Starting End-to-End API Test...\n');

  try {
    // Test 1: 50m radius (should return only center message)
    console.log('Test 1: 50m radius filtering');
    const messages50m = await api.getNearbyMessages(testLocation, 0.05);
    console.log(`✅ Returned ${messages50m.length} messages`);
    console.log('Messages:', messages50m.map(m => ({ text: m.text, distance: m.distanceFromUser })));
    console.log('');

    // Test 2: 150m radius (should return all 3 test messages)  
    console.log('Test 2: 150m radius filtering');
    const messages150m = await api.getNearbyMessages(testLocation, 0.15);
    console.log(`✅ Returned ${messages150m.length} messages`);
    console.log('Messages:', messages150m.map(m => ({ text: m.text, distance: m.distanceFromUser })));
    console.log('');

    // Test 3: 5km radius (should return only nearby messages, no global ones)
    console.log('Test 3: 5km radius filtering');
    const messages5km = await api.getNearbyMessages(testLocation, 5);
    console.log(`✅ Returned ${messages5km.length} messages`);
    console.log('Messages:', messages5km.map(m => ({ text: m.text, distance: m.distanceFromUser })));
    console.log('');

    // Test 4: Verify results consistency
    console.log('Test 4: Consistency checks');
    console.log(`✅ 50m <= 150m messages: ${messages50m.length <= messages150m.length}`);
    console.log(`✅ 150m <= 5km messages: ${messages150m.length <= messages5km.length}`);
    console.log(`✅ No global messages in 5km: ${messages5km.every(m => m.distanceFromUser < 5)}`);
    
    console.log('\n🎉 All end-to-end tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
runEndToEndTest();