import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Alert, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { MessageMap } from './components/MessageMap';
import { MessageFeed } from './components/MessageFeed';
import { PostMessage } from './components/PostMessage';
import { Message, Location as LocationType, Region } from './types';
import { api } from './services/api';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userLocation, setUserLocation] = useState<LocationType | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (userLocation) {
      loadNearbyMessages();
    }
  }, [userLocation]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is required to use Flurfunk'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const userLoc = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      setUserLocation(userLoc);
      setRegion({
        ...userLoc,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to get location');
    }
  };

  const loadNearbyMessages = async () => {
    if (!userLocation) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const nearbyMessages = await api.getNearbyMessages(userLocation, 5);
      setMessages(nearbyMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setError('Failed to load nearby messages');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostMessage = async (text: string, location: LocationType) => {
    try {
      const newMessage = await api.createMessage(text, location);
      setMessages(prev => [newMessage, ...prev]);
    } catch (error) {
      console.error('Failed to post message:', error);
      throw error; // Re-throw so PostMessage component can handle it
    }
  };

  if (!userLocation) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Getting your location...</Text>
        <StatusBar style="auto" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <MessageMap
          messages={messages}
          userLocation={userLocation}
          region={region}
          onRegionChange={setRegion}
        />
        
        <PostMessage
          userLocation={userLocation}
          onPost={handlePostMessage}
        />

        <View style={styles.feedHeader}>
          <Text style={styles.feedTitle}>
            Messages nearby ({messages.length})
          </Text>
          {isLoading && <Text style={styles.loadingText}>Loading...</Text>}
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      </View>

      <MessageFeed messages={messages} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#f5f5f5',
    paddingTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  feedHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  feedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  errorText: {
    fontSize: 12,
    color: '#ff4444',
    marginTop: 4,
  },
});
