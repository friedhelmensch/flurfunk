import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Alert, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
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
  const [activeBottomTab, setActiveBottomTab] = useState<'feed' | 'funk' | 'notifications' | 'more'>('feed');
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
          <TouchableOpacity style={styles.headerIconButton}>
            <Text style={styles.headerIcon}>📍</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerTextButton}>
            <Text style={styles.headerButtonText}>SWAG</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollView}>
        {/* Map Header */}
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
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={[styles.navButton, activeBottomTab === 'feed' && styles.activeNavButton]} 
          onPress={() => setActiveBottomTab('feed')}
          activeOpacity={0.7}
        >
          <View style={[styles.navIconContainer, activeBottomTab === 'feed' && styles.activeNavIconContainer]}>
            <Text style={[styles.navIcon, activeBottomTab === 'feed' && styles.activeNavIcon]}>📱</Text>
          </View>
          <Text style={[styles.navLabel, activeBottomTab === 'feed' && styles.activeNavLabel]}>Feed</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navButton, activeBottomTab === 'funk' && styles.activeNavButton]} 
          onPress={() => {
            setActiveBottomTab('funk');
            setIsComposeModalVisible(true);
          }} 
          activeOpacity={0.7}
        >
          <View style={[styles.navIconContainer, styles.funkButton, activeBottomTab === 'funk' && styles.activeNavIconContainer]}>
            <Text style={styles.funkIcon}>+</Text>
          </View>
          <Text style={[styles.navLabel, activeBottomTab === 'funk' && styles.activeNavLabel]}>Funk</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navButton, activeBottomTab === 'notifications' && styles.activeNavButton]} 
          onPress={() => setActiveBottomTab('notifications')}
          activeOpacity={0.7}
        >
          <View style={[styles.navIconContainer, activeBottomTab === 'notifications' && styles.activeNavIconContainer]}>
            <Text style={[styles.navIcon, activeBottomTab === 'notifications' && styles.activeNavIcon]}>🔔</Text>
          </View>
          <Text style={[styles.navLabel, activeBottomTab === 'notifications' && styles.activeNavLabel]}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navButton, activeBottomTab === 'more' && styles.activeNavButton]} 
          onPress={() => setActiveBottomTab('more')}
          activeOpacity={0.7}
        >
          <View style={[styles.navIconContainer, activeBottomTab === 'more' && styles.activeNavIconContainer]}>
            <Text style={[styles.navIcon, activeBottomTab === 'more' && styles.activeNavIcon]}>⋯</Text>
          </View>
          <Text style={[styles.navLabel, activeBottomTab === 'more' && styles.activeNavLabel]}>More</Text>
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#FF6B47',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.5,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 16,
  },
  headerTextButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  mapContainer: {
    height: 300,
    position: 'relative',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 4,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginHorizontal: 2,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#f0f0f0',
  },
  tabText: {
    fontSize: 15,
    color: '#8e8e93',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  activeTabText: {
    color: '#FF6B47',
    fontWeight: '700',
  },
  contentContainer: {
    backgroundColor: '#f8f9fa',
    minHeight: 400,
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
    backgroundColor: '#ffffff',
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#e5e5ea',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 44,
  },
  activeNavButton: {
    // No additional styling needed for the container
  },
  navLabel: {
    fontSize: 10,
    color: '#8e8e93',
    marginTop: 4,
    fontWeight: '500',
  },
  activeNavLabel: {
    color: '#FF6B47',
    fontWeight: '600',
  },
  navIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeNavIconContainer: {
    backgroundColor: '#FF6B47',
  },
  navIcon: {
    fontSize: 14,
    color: '#8e8e93',
  },
  activeNavIcon: {
    color: 'white',
  },
  funkButton: {
    backgroundColor: '#FF6B47',
    shadowColor: '#FF6B47',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  funkIcon: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
