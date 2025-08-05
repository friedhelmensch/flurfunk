export interface Message {
  id: string;
  text: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  distanceFromUser?: number;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}