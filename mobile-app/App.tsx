import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Alert, SafeAreaView, TouchableOpacity } from 'react-native';
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
  const [activeTab, setActiveTab] = useState<'people' | 'events' | 'news'>('people');
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
      
      // Calculate distance from user (backend already filters by radius)
      const messagesWithDistance = nearbyMessages
        .map(message => ({
          ...message,
          distanceFromUser: userLocation ? calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            message.latitude,
            message.longitude
          ) : undefined,
        }));
      
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
        <StatusBar style="light" backgroundColor="#FF6B47" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>flurfunk</Text>
        </View>
        <View style={styles.loadingContent}>
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#FF6B47" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>flurfunk</Text>
        <View style={styles.headerButtons}>
          <Text style={styles.headerButton}>📍</Text>
          <Text style={styles.headerButton}>SWAG</Text>
        </View>
      </View>

      {/* Full Screen Map */}
      <View style={styles.mapContainer}>
        <MessageMap
          messages={messages}
          userLocation={userLocation}
          region={region}
          onRegionChange={handleRegionChange}
          isLoading={isLoading}
        />
        
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'people' && styles.activeTab]}
          onPress={() => setActiveTab('people')}
        >
          <Text style={[styles.tabText, activeTab === 'people' && styles.activeTabText]}>People</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'events' && styles.activeTab]}
          onPress={() => setActiveTab('events')}
        >
          <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>Events</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'news' && styles.activeTab]}
          onPress={() => setActiveTab('news')}
        >
          <Text style={[styles.tabText, activeTab === 'news' && styles.activeTabText]}>News</Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <View style={styles.contentContainer}>
        {activeTab === 'people' && (
          <MessageFeed 
            messages={messages} 
            onLoadMore={() => loadMessagesForRegion(region, false)}
            onMessagePress={setSelectedMessage}
          />
        )}
        {activeTab === 'events' && (
          <View style={styles.emptyTab}>
            <Text style={styles.emptyTabText}>Events coming soon</Text>
          </View>
        )}
        {activeTab === 'news' && (
          <View style={styles.emptyTab}>
            <Text style={styles.emptyTabText}>News coming soon</Text>
          </View>
        )}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton}>
          <View style={styles.recordButton} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => setIsComposeModalVisible(true)}>
          <Text style={styles.navIcon}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <View style={styles.cameraButton}>
            <Text style={styles.cameraText}>📷</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navIcon}>⋯</Text>
        </TouchableOpacity>
      </View>
      
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
    backgroundColor: '#FF6B47',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FF6B47',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FF6B47',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 0.6,
    backgroundColor: 'white',
  },
  emptyTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTabText: {
    fontSize: 16,
    color: '#999',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: 20,
    color: 'white',
  },
  recordButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF4444',
    borderWidth: 2,
    borderColor: 'white',
  },
  cameraButton: {
    backgroundColor: '#666',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  cameraText: {
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});
