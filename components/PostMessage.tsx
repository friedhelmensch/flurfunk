import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Location } from '../types';

interface PostMessageProps {
  userLocation: Location | null;
  onPost: (text: string, location: Location) => Promise<void>;
}

export const PostMessage: React.FC<PostMessageProps> = ({
  userLocation,
  onPost,
}) => {
  const [text, setText] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (!text.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    if (!userLocation) {
      Alert.alert('Error', 'Location not available. Please enable location services.');
      return;
    }

    setIsPosting(true);
    try {
      await onPost(text.trim(), userLocation);
      setText('');
      Alert.alert('Success', 'Message posted anonymously!');
    } catch (error) {
      Alert.alert('Error', 'Failed to post message');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Post anonymously</Text>
      <TextInput
        style={styles.textInput}
        placeholder="What's happening around here?"
        value={text}
        onChangeText={setText}
        multiline
        maxLength={280}
        editable={!isPosting}
      />
      <View style={styles.footer}>
        <Text style={styles.charCount}>{text.length}/280</Text>
        <TouchableOpacity
          style={[styles.postButton, isPosting && styles.postButtonDisabled]}
          onPress={handlePost}
          disabled={isPosting || !text.trim()}
        >
          <Text style={styles.postButtonText}>
            {isPosting ? 'Posting...' : 'Post'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  charCount: {
    fontSize: 12,
    color: '#666',
  },
  postButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  postButtonDisabled: {
    backgroundColor: '#ccc',
  },
  postButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});