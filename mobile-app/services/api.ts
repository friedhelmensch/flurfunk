import { Message, Location } from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  messages?: string[];
}

class FlurfunkAPI {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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

  async createMessage(text: string, location: Location): Promise<Message> {
    const response = await this.request<Message>('/messages', {
      method: 'POST',
      body: JSON.stringify({
        text,
        latitude: location.latitude,
        longitude: location.longitude,
      }),
    });

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create message');
    }

    return response.data;
  }

  async getNearbyMessages(
    location: Location,
    radiusKm: number = 5
  ): Promise<Message[]> {
    const params = new URLSearchParams({
      lat: location.latitude.toString(),
      lng: location.longitude.toString(),
      radius: radiusKm.toString(),
    });

    const response = await this.request<Message[]>(`/messages/nearby?${params}`);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch nearby messages');
    }

    return response.data;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.request('/health');
      return response.success || false;
    } catch {
      return false;
    }
  }
}

export const api = new FlurfunkAPI();