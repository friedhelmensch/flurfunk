import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Message } from '../types';
import { formatDistance } from '../utils/location';

interface MessageFeedProps {
  messages: Message[];
}

const MessageItem: React.FC<{ message: Message }> = ({ message }) => {
  const timeAgo = new Date(message.timestamp).toLocaleTimeString();
  
  return (
    <View style={styles.messageItem}>
      <Text style={styles.messageText}>{message.text}</Text>
      <View style={styles.messageFooter}>
        <Text style={styles.timeText}>{timeAgo}</Text>
        {message.distanceFromUser !== undefined && (
          <Text style={styles.distanceText}>
            {formatDistance(message.distanceFromUser)} away
          </Text>
        )}
      </View>
    </View>
  );
};

export const MessageFeed: React.FC<MessageFeedProps> = ({ messages }) => {
  return (
    <FlatList
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <MessageItem message={item} />}
      style={styles.feed}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.feedContent}
    />
  );
};

const styles = StyleSheet.create({
  feed: {
    flex: 1,
  },
  feedContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  messageItem: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    marginVertical: 4,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
  distanceText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
});