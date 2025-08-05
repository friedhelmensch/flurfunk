import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Location } from '../types';

interface ComposeModalProps {
  visible: boolean;
  userLocation: Location | null;
  onPost: (text: string, location: Location) => Promise<void>;
  onClose: () => void;
}

export const ComposeModal: React.FC<ComposeModalProps> = ({
  visible,
  userLocation,
  onPost,
  onClose,
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
      onClose();
      Alert.alert('Success', 'Message posted anonymously!');
    } catch (error) {
      Alert.alert('Error', 'Failed to post message');
    } finally {
      setIsPosting(false);
    }
  };

  const handleClose = () => {
    setText('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>New Message</Text>
          <TouchableOpacity
            style={styles.postButton}
            onPress={handlePost}
            disabled={isPosting || !text.trim()}
          >
            <Text style={[styles.postButtonText, (!text.trim() || isPosting) && styles.postButtonTextDisabled]}>
              {isPosting ? 'Posting...' : 'Post'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.subtitle}>Share what's happening around you</Text>
          <TextInput
            style={styles.textInput}
            placeholder="What's going on here?"
            value={text}
            onChangeText={setText}
            multiline
            maxLength={280}
            autoFocus
            textAlignVertical="top"
            editable={!isPosting}
          />
          <View style={styles.footer}>
            <Text style={styles.charCount}>{text.length}/280</Text>
            <Text style={styles.locationText}>📍 Posted anonymously at your location</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingTop: 50, // Account for status bar
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  postButton: {
    padding: 8,
  },
  postButtonText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 16,
  },
  postButtonTextDisabled: {
    color: '#8E8E93',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    color: '#333',
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  charCount: {
    fontSize: 12,
    color: '#666',
  },
  locationText: {
    fontSize: 12,
    color: '#007AFF',
    flex: 1,
    textAlign: 'right',
  },
});