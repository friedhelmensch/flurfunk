import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { Message, Location } from '../types';

interface MessageMapProps {
  messages: Message[];
  userLocation: Location | null;
  region: Region;
  onRegionChange: (region: Region) => void;
  isLoading?: boolean;
}

export const MessageMap: React.FC<MessageMapProps> = ({
  messages,
  userLocation,
  region,
  onRegionChange,
  isLoading = false,
}) => {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={onRegionChange}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {messages.map((message) => (
          <Marker
            key={message.id}
            coordinate={{
              latitude: message.latitude,
              longitude: message.longitude,
            }}
            title="Message"
            description={message.text.substring(0, 50) + '...'}
            pinColor="#007AFF"
          />
        ))}
      </MapView>
      
      {isLoading && (
        <View style={styles.loadingIndicator}>
          <ActivityIndicator size="small" color="#1d9bf0" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingIndicator: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});