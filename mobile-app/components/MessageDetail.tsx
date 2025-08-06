import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Message, Location as LocationType } from '../types';
import { formatDistance } from '../utils/location';

interface MessageDetailProps {
  message: Message | null;
  userLocation: LocationType | null;
  visible: boolean;
  onClose: () => void;
}

export const MessageDetail: React.FC<MessageDetailProps> = ({ 
  message, 
  userLocation,
  visible,
  onClose 
}) => {
  if (!message) {
    return null;
  }
  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const messageRegion = {
    latitude: message.latitude,
    longitude: message.longitude,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Message Details</Text>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={messageRegion}
          showsUserLocation={true}
          showsMyLocationButton={false}
        >
          <Marker
            coordinate={{
              latitude: message.latitude,
              longitude: message.longitude,
            }}
            title="Message Location"
            description={message.text}
          />
        </MapView>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.messageCard}>
          <Text style={styles.messageText}>{message.text}</Text>
          
          <View style={styles.messageInfo}>
            <Text style={styles.infoText}>
              {getTimeAgo(message.timestamp)}
            </Text>
            {message.distanceFromUser !== undefined && (
              <>
                <Text style={styles.infoDivider}>·</Text>
                <Text style={styles.infoText}>
                  {formatDistance(message.distanceFromUser)} away
                </Text>
              </>
            )}
          </View>

          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>Location:</Text>
            <Text style={styles.locationCoords}>
              {message.latitude.toFixed(6)}, {message.longitude.toFixed(6)}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eff3f4',
  },
  closeButton: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#1d9bf0',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f1419',
    flex: 1,
  },
  mapContainer: {
    height: 200,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  map: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  messageText: {
    fontSize: 18,
    color: '#0f1419',
    lineHeight: 24,
    marginBottom: 12,
  },
  messageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#536471',
  },
  infoDivider: {
    fontSize: 14,
    color: '#536471',
    marginHorizontal: 8,
  },
  locationInfo: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eff3f4',
  },
  locationLabel: {
    fontSize: 14,
    color: '#536471',
    marginBottom: 4,
  },
  locationCoords: {
    fontSize: 14,
    color: '#0f1419',
    fontFamily: 'monospace',
  },
});