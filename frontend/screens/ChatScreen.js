import React, { useState, useReducer, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../contexts/AppContext';
import { sendMessageToChatbot } from '../services/api';
import { ERROR_MESSAGES } from '../util/constants';

// Reducer pour la gestion des messages
const initialState = [];
const messagesReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return [...state, action.payload];
    default:
      return state;
  }
};

const ChatScreen = () => {
  const { theme } = useAppContext();
  const isDarkMode = theme === 'dark';

  const [messages, dispatch] = useReducer(messagesReducer, initialState);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  // Ajouter un message à la conversation
  const addMessage = (sender, text) => {
    const message = {
      sender,
      text,
      timestamp: new Date(),
    };
    dispatch({ type: 'ADD_MESSAGE', payload: message });
  };

  // Envoyer un message à l'IA
  const sendMessage = useCallback(async () => {
    if (userInput.trim()) {
      addMessage('user', userInput);
      setUserInput('');
      setLoading(true);

      try {
        const botText = await sendMessageToChatbot(userInput);
        addMessage('bot', botText);
      } catch (error) {
        console.error('Erreur lors de l\'obtention de la réponse du chatbot:', error);
        addMessage('bot', ERROR_MESSAGES?.API_ERROR || 'Une erreur est survenue.');
      } finally {
        setLoading(false);
      }
    }
  }, [userInput]);

  // Rendu des messages
  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === 'user'
          ? [styles.userMessage, isDarkMode && styles.userMessageDark]
          : [styles.botMessage, isDarkMode && styles.botMessageDark],
      ]}
    >
      <Text style={[styles.messageText, isDarkMode && { color: '#FFF' }]}>
        {item.text}
      </Text>
    </View>
  );

  // Faire défiler automatiquement les messages
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: isDarkMode ? '#0A1F44' : '#F5F7FA' }]}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{ paddingBottom: 20 }}
          />

          {/* Barre d'entrée du message */}
          <View style={[styles.inputContainer, isDarkMode && styles.inputContainerDark]}>
            <TextInput
              style={[styles.textInput, isDarkMode && styles.textInputDark]}
              placeholder="Écrivez votre message..."
              placeholderTextColor={isDarkMode ? '#BBB' : '#555'}
              value={userInput}
              onChangeText={setUserInput}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
              editable={!loading}
            />
            <TouchableOpacity onPress={sendMessage} disabled={loading}>
              <Ionicons
                name="send"
                size={30}
                color={loading ? '#888' : isDarkMode ? '#007BFF' : '#2D9CDB'}
                style={styles.sendIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    paddingBottom: 10,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginVertical: 5,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6', 
  },
  userMessageDark: {
    backgroundColor: '#1E90FF', 
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  botMessageDark: {
    backgroundColor: '#2C3E50',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    padding: 12,
    backgroundColor: '#FFF',
  },
  inputContainerDark: {
    backgroundColor: '#1C1C1E',
    borderTopColor: '#444',
  },
  textInput: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 20,
    paddingLeft: 15,
    fontSize: 16,
    backgroundColor: '#FFF',
    color: '#1C1C1C',
  },
  textInputDark: {
    backgroundColor: '#333',
    color: '#FFF',
    borderColor: '#555',
  },
  sendIcon: {
    marginLeft: 10,
  },
});

export default ChatScreen;
