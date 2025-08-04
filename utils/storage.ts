import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message } from '../types';

const MESSAGES_KEY = 'flurfunk_messages';

export const saveMessages = async (messages: Message[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error('Error saving messages:', error);
  }
};

export const loadMessages = async (): Promise<Message[]> => {
  try {
    const messagesJson = await AsyncStorage.getItem(MESSAGES_KEY);
    return messagesJson ? JSON.parse(messagesJson) : [];
  } catch (error) {
    console.error('Error loading messages:', error);
    return [];
  }
};

export const addMessage = async (message: Message): Promise<void> => {
  try {
    const existingMessages = await loadMessages();
    const updatedMessages = [message, ...existingMessages];
    await saveMessages(updatedMessages);
  } catch (error) {
    console.error('Error adding message:', error);
  }
};