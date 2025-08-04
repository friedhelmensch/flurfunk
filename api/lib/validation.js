// Input validation utilities

export const validateMessage = (text, latitude, longitude) => {
  const errors = [];

  // Text validation
  if (!text || typeof text !== 'string') {
    errors.push('Message text is required');
  } else if (text.trim().length === 0) {
    errors.push('Message cannot be empty');
  } else if (text.length > 280) {
    errors.push('Message cannot exceed 280 characters');
  }

  // Latitude validation
  if (typeof latitude !== 'number') {
    errors.push('Latitude must be a number');
  } else if (latitude < -90 || latitude > 90) {
    errors.push('Latitude must be between -90 and 90');
  }

  // Longitude validation
  if (typeof longitude !== 'number') {
    errors.push('Longitude must be a number');
  } else if (longitude < -180 || longitude > 180) {
    errors.push('Longitude must be between -180 and 180');
  }

  return errors;
};

export const validateNearbyQuery = (latitude, longitude, radius) => {
  const errors = [];

  // Latitude validation
  if (typeof latitude !== 'number') {
    errors.push('Latitude must be a number');
  } else if (latitude < -90 || latitude > 90) {
    errors.push('Latitude must be between -90 and 90');
  }

  // Longitude validation
  if (typeof longitude !== 'number') {
    errors.push('Longitude must be a number');
  } else if (longitude < -180 || longitude > 180) {
    errors.push('Longitude must be between -180 and 180');
  }

  // Radius validation
  if (typeof radius !== 'number') {
    errors.push('Radius must be a number');
  } else if (radius <= 0 || radius > 50) {
    errors.push('Radius must be between 0 and 50 km');
  }

  return errors;
};