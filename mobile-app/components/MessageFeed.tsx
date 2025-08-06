import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Message } from '../types';
import { formatDistance } from '../utils/location';

interface MessageFeedProps {
  messages: Message[];
  onLoadMore?: () => void;
  onMessagePress?: (message: Message) => void;
}

const MessageItem: React.FC<{ 
  message: Message;
  onPress?: (message: Message) => void;
}> = ({ message, onPress }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Format timestamp to relative time (like Twitter)
  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return new Date(timestamp).toLocaleDateString();
  };
  
  const timeAgo = getTimeAgo(message.timestamp);
  const shouldTruncate = message.text.length > 140 && !isExpanded;
  const displayText = shouldTruncate 
    ? message.text.substring(0, 140) + '...' 
    : message.text;
  
  return (
    <TouchableOpacity 
      style={styles.messageItem} 
      onPress={() => {
        if (onPress) {
          onPress(message);
        } else {
          setIsExpanded(!isExpanded);
        }
      }}
      activeOpacity={0.95}
    >
      <Text style={styles.messageText}>
        {displayText}
        {shouldTruncate && (
          <Text style={styles.showMoreText}> Show more</Text>
        )}
      </Text>
      <View style={styles.messageFooter}>
        <Text style={styles.metaText}>{timeAgo}</Text>
        <Text style={styles.metaDivider}>·</Text>
        {message.distanceFromUser !== undefined && (
          <Text style={styles.metaText}>
            {formatDistance(message.distanceFromUser)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export const MessageFeed: React.FC<MessageFeedProps> = ({ messages, onLoadMore, onMessagePress }) => {
  const handleEndReached = () => {
    if (onLoadMore) {
      onLoadMore();
    }
  };

  return (
    <FlatList
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <MessageItem message={item} onPress={onMessagePress} />}
      style={styles.feed}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.feedContent}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.1}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
};

const styles = StyleSheet.create({
  feed: {
    flex: 1,
    backgroundColor: '#fff',
  },
  feedContent: {
    paddingBottom: 20,
  },
  messageItem: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  messageText: {
    fontSize: 16,
    color: '#0f1419',
    lineHeight: 20,
    marginBottom: 4,
  },
  showMoreText: {
    color: '#1d9bf0',
    fontSize: 16,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#536471',
  },
  metaDivider: {
    fontSize: 14,
    color: '#536471',
    marginHorizontal: 6,
  },
  separator: {
    height: 1,
    backgroundColor: '#eff3f4',
    marginLeft: 16,
  },
});