import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Alert, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { MessageMap } from './components/MessageMap';
import { MessageFeed } from './components/MessageFeed';
import { ComposeButton } from './components/ComposeButton';
import { ComposeModal } from './components/ComposeModal';
import { MessageDetail } from './components/MessageDetail';
import { Message, Location as LocationType, Region } from './types';
import { api } from './services/api';
import { calculateRegionRadius, calculateDistance } from './utils/location';

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
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isComposeModalVisible, setIsComposeModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

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
    await loadMessagesForRegion(region, isInitialLoad);
  };

  const loadMessagesForRegion = async (mapRegion: Region, showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      // Calculate radius needed to cover the visible map area
      const radius = calculateRegionRadius(
        mapRegion.latitudeDelta,
        mapRegion.longitudeDelta,
        mapRegion.latitude
      );
      
      // Use map center as the query location
      const mapCenter = {
        latitude: mapRegion.latitude,
        longitude: mapRegion.longitude,
      };
      
      const nearbyMessages = await api.getNearbyMessages(mapCenter, radius);
      
      // Calculate distance from user and filter by visible map radius
      const messagesWithDistance = nearbyMessages
        .map(message => ({
          ...message,
          distanceFromUser: userLocation ? calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            message.latitude,
            message.longitude
          ) : undefined,
          distanceFromMapCenter: calculateDistance(
            mapCenter.latitude,
            mapCenter.longitude,
            message.latitude,
            message.longitude
          ),
        }))
        // Filter to only show messages within the visible map area
        .filter(message => message.distanceFromMapCenter <= radius);
      
      setMessages(messagesWithDistance);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setError('Failed to load nearby messages');
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  };

  const handlePostMessage = async (text: string, location: LocationType) => {
    try {
      await api.createMessage(text, location);
      // Refresh the messages in the current region after posting
      loadMessagesForRegion(region, false);
    } catch (error) {
      console.error('Failed to post message:', error);
      throw error; // Re-throw so ComposeModal can handle it
    }
  };

  const handleRegionChange = (newRegion: Region) => {
    setRegion(newRegion);
    
    // Clear existing timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Debounce the API call to avoid too many requests during map interaction
    debounceRef.current = setTimeout(() => {
      loadMessagesForRegion(newRegion, true); // Show subtle loading indicator for map movements
    }, 500); // 500ms delay
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
          onRegionChange={handleRegionChange}
          isLoading={isLoading}
        />
        
        <ComposeButton onPress={() => setIsComposeModalVisible(true)} />

        <View style={styles.feedHeader}>
          <Text style={styles.feedTitle}>
            Messages in this area ({messages.length})
          </Text>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      </View>

      <MessageFeed 
        messages={messages} 
        onLoadMore={() => {
          // For now, just reload the current region
          // In the future, we could implement pagination
          loadMessagesForRegion(region, false);
        }}
        onMessagePress={setSelectedMessage}
      />
      
      <ComposeModal
        visible={isComposeModalVisible}
        userLocation={userLocation}
        onPost={handlePostMessage}
        onClose={() => setIsComposeModalVisible(false)}
      />
      
      <MessageDetail
        message={selectedMessage}
        userLocation={userLocation}
        visible={selectedMessage !== null}
        onClose={() => setSelectedMessage(null)}
      />
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
