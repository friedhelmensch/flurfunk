import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { Message, Location } from '../types';

interface MessageMapProps {
  messages: Message[];
  userLocation: Location | null;
  region: Region;
  onRegionChange: (region: Region) => void;
}

export const MessageMap: React.FC<MessageMapProps> = ({
  messages,
  userLocation,
  region,
  onRegionChange,
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  map: {
    flex: 1,
  },
});