//frontend\screens\ChatScreen.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, Button, FlatList, KeyboardAvoidingView, Platform, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sendMessageToBot, getChatbotResponse } from '../services/api';  // Importation des fonctions d'API

// Importation des constantes et messages
import { ERROR_MESSAGES } from '../util/constants';

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);  // État pour stocker les messages
  const [userInput, setUserInput] = useState('');  // État pour la saisie de l'utilisateur
  const flatListRef = useRef(null);  // Référence pour le FlatList, afin de faire défiler automatiquement

  // Fonction pour envoyer le message de l'utilisateur au chatbot et obtenir une réponse
  const sendMessage = useCallback(async () => {
    if (userInput.trim()) {
      // Ajouter le message de l'utilisateur à la liste
      const newMessage = {
        sender: 'user',
        text: userInput,
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setUserInput('');  // Réinitialiser le champ de saisie

      try {
        // Appel à la fonction API pour obtenir la réponse du chatbot
        const response = await getChatbotResponse(userInput);
        const botMessage = {
          sender: 'bot',
          text: response.text,  // Réponse du chatbot
          timestamp: new Date(),
        };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      } catch (error) {
        console.error('Erreur lors de l\'obtention de la réponse du chatbot:', error);
        // Message d'erreur en cas de problème avec l'API
        const errorMessage = {
          sender: 'bot',
          text: ERROR_MESSAGES.API_ERROR,  // Message d'erreur
          timestamp: new Date(),
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      }
    }
  }, [userInput]);  // Ré-création de la fonction seulement lorsque userInput change

  // Fonction pour rendre chaque message dans la liste de chat
  const renderItem = ({ item }) => (
    <View style={[styles.messageContainer, item.sender === 'user' ? styles.userMessage : styles.botMessage]}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  // Faire défiler automatiquement la liste jusqu'à la fin quand il y a un nouveau message
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.innerContainer}>
          {/* Liste des messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            inverted={true}  // Inverser l'ordre des messages pour afficher les plus récents en bas
          />

          {/* Zone de saisie pour l'utilisateur */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Écrivez votre message..."
              value={userInput}
              onChangeText={setUserInput}
              onSubmitEditing={sendMessage}  // Permet d'envoyer le message lorsque l'utilisateur appuie sur Entrée
            />
            <TouchableWithoutFeedback onPress={sendMessage}>
              <Ionicons name="send" size={30} color="blue" style={styles.sendIcon} />
            </TouchableWithoutFeedback>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

// Styles pour l'interface
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 10,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
    paddingBottom: 10,
  },
  textInput: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 20,
    paddingLeft: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  sendIcon: {
    marginLeft: 10,
  },
});

export default ChatScreen;
