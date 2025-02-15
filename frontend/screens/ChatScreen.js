import React, { useState, useReducer, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Clipboard,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAppContext } from '../contexts/AppContext';
import { sendMessageToChatbot } from '../services/api';
import { ERROR_MESSAGES } from '../util/constants';

// Reducer pour la gestion des messages
const initialState = [];
const messagesReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return [...state, action.payload];
    case 'REMOVE_MESSAGES':
      return state.filter((_, index) => !action.payload.includes(index));
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
  const [selectedMessages, setSelectedMessages] = useState([]);
  const flatListRef = useRef(null);

  // Ajouter un message
  const addMessage = (sender, text) => {
    dispatch({
      type: 'ADD_MESSAGE',
      payload: { sender, text, timestamp: new Date() },
    });
  };

  // Supprimer les messages sélectionnés
  const removeSelectedMessages = () => {
    dispatch({ type: 'REMOVE_MESSAGES', payload: selectedMessages });
    setSelectedMessages([]); // Désélectionner après suppression
  };

  // Copier les messages sélectionnés
  const copySelectedMessages = () => {
    const textsToCopy = selectedMessages.map(index => messages[index]?.text).join('\n');
    Clipboard.setString(textsToCopy);
    Alert.alert('Copié', 'Les messages sélectionnés ont été copiés.');
    setSelectedMessages([]); // Désélectionner après copie
  };

  // Gérer la sélection d’un message (appui long)
  const toggleMessageSelection = (index) => {
    setSelectedMessages((prevSelected) =>
      prevSelected.includes(index)
        ? prevSelected.filter(i => i !== index) // Désélectionner
        : [...prevSelected, index] // Sélectionner
    );
  };

  // Envoyer un message
  const sendMessage = useCallback(async () => {
    if (!userInput.trim()) return;

    addMessage('user', userInput);
    setUserInput('');
    setLoading(true);

    try {
      const botText = await sendMessageToChatbot(userInput);
      addMessage('bot', botText);
    } catch (error) {
      console.error('Erreur du chatbot:', error);
      addMessage('bot', ERROR_MESSAGES?.API_ERROR || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }, [userInput]);

  // Défilement automatique
  useEffect(() => {
    if (flatListRef.current) {
      setTimeout(() => flatListRef.current.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  // Rendu des messages
  const renderItem = ({ item, index }) => {
    const isSelected = selectedMessages.includes(index);

    return (
      <TouchableOpacity
        onLongPress={() => toggleMessageSelection(index)}
        style={[
          styles.messageWrapper,
          isSelected && styles.selectedMessage,
        ]}
      >
        {isSelected && (
          <MaterialIcons name="check-circle" size={22} color="#00A6FF" style={styles.checkbox} />
        )}
        <View
          style={[
            styles.messageContainer,
            item.sender === 'user' ? styles.userMessage : styles.botMessage,
            isDarkMode && (item.sender === 'user' ? styles.userMessageDark : styles.botMessageDark),
          ]}
        >
          <Text style={[styles.messageText, isDarkMode && { color: '#FFF' }]}>{item.text}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, isDarkMode && { backgroundColor: '#0A192F' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{ flexGrow: 1, justifyContent: messages.length ? 'flex-start' : 'center' }}
            keyboardShouldPersistTaps="handled"
          />

          {selectedMessages.length > 0 && (
            <View style={styles.actionsContainer}>
              <TouchableOpacity onPress={copySelectedMessages} style={styles.actionButton}>
                <MaterialIcons name="content-copy" size={24} color="white" />
                <Text style={styles.actionText}>Copier</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={removeSelectedMessages} style={[styles.actionButton, styles.deleteButton]}>
                <MaterialIcons name="delete" size={24} color="white" />
                <Text style={styles.actionText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          )}

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
                size={28}
                color={loading ? '#888' : isDarkMode ? '#00A6FF' : '#2D9CDB'}
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
