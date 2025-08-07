import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
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
  
  // Generate a consistent username from message ID
  const getUsername = (id: string) => {
    const names = ['kola', 'benjin', 'mitch', 'alex', 'sarah', 'tom', 'lisa', 'mike'];
    const hash = id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return names[hash % names.length];
  };
  
  // Generate avatar color from username
  const getAvatarColor = (username: string) => {
    const colors = ['#FF6B47', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    const hash = username.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };
  
  // Format timestamp to relative time
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
  
  const username = getUsername(message.id);
  const avatarColor = getAvatarColor(username);
  const timeAgo = getTimeAgo(message.timestamp);
  const shouldTruncate = message.text.length > 140 && !isExpanded;
  const displayText = shouldTruncate 
    ? message.text.substring(0, 140) + '...' 
    : message.text;
  
  return (
    <TouchableOpacity 
      style={styles.messageCard} 
      onPress={() => {
        if (onPress) {
          onPress(message);
        } else {
          setIsExpanded(!isExpanded);
        }
      }}
      activeOpacity={0.95}
    >
      <View style={styles.messageHeader}>
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{username.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.messageInfo}>
          <View style={styles.userInfo}>
            <Text style={styles.username}>{username}</Text>
            <Text style={styles.timeAgo}>{timeAgo}</Text>
            {message.distanceFromUser !== undefined && (
              <>
                <Text style={styles.metaDivider}>·</Text>
                <Text style={styles.distance}>
                  {formatDistance(message.distanceFromUser)} away
                </Text>
              </>
            )}
          </View>
        </View>
      </View>
      
      <Text style={styles.messageText}>
        {displayText}
        {shouldTruncate && (
          <Text style={styles.showMoreText}> Show more</Text>
        )}
      </Text>
      
      <View style={styles.messageActions}>
        <Text style={styles.commentsText}>💬 2 Comments</Text>
        <View style={styles.actionButtons}>
          <Text style={styles.actionButton}>👍 8</Text>
          <Text style={styles.actionButton}>👎</Text>
        </View>
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
    backgroundColor: '#f5f5f5',
  },
  feedContent: {
    padding: 16,
  },
  messageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageInfo: {
    flex: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  timeAgo: {
    fontSize: 12,
    color: '#666',
  },
  distance: {
    fontSize: 12,
    color: '#666',
  },
  metaDivider: {
    fontSize: 12,
    color: '#666',
    marginHorizontal: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  showMoreText: {
    color: '#FF6B47',
    fontSize: 15,
  },
  messageActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  commentsText: {
    fontSize: 13,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    fontSize: 13,
    color: '#666',
    marginLeft: 16,
  },
  separator: {
    height: 8,
  },
});