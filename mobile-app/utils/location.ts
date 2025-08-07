import { Location, Message } from '../types';

// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRadians = (degrees: number): number => degrees * (Math.PI / 180);

// Filter messages within radius
export const filterMessagesByRadius = (
  messages: Message[],
  userLocation: Location,
  radiusKm: number = 5
): Message[] => {
  return messages
    .map(message => ({
      ...message,
      distanceFromUser: calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        message.latitude,
        message.longitude
      ),
    }))
    .filter(message => message.distanceFromUser! <= radiusKm)
    .sort((a, b) => b.timestamp - a.timestamp);
};

// Format distance for display
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
};

// Calculate radius needed to cover the visible map region
export const calculateRegionRadius = (
  latitudeDelta: number,
  longitudeDelta: number,
  centerLatitude: number
): number => {
  // Convert deltas to distance in km
  const latDistance = latitudeDelta * 111; // 1 degree latitude ≈ 111 km
  const lonDistance = longitudeDelta * 111 * Math.cos(toRadians(centerLatitude));
  
  // Calculate diagonal distance to cover the entire visible area
  const diagonalDistance = Math.sqrt(latDistance * latDistance + lonDistance * lonDistance);
  
  // Add 20% buffer to ensure we get all messages in the visible area
  return Math.max(diagonalDistance * 0.6, 1); // Minimum 1km radius, no maximum limit
};