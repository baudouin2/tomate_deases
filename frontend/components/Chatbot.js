import React, { useState } from 'react';
import { View, TextInput, Button, Text, ScrollView } from 'react-native';
import { sendMessageToChatbot } from '../services/api';

const Chatbot = () => {
  const [message, setMessage] = useState('');
  const [responses, setResponses] = useState([]);

  const handleSend = async () => {
    const response = await sendMessageToChatbot(message);
    setResponses((prev) => [...prev, { user: message, bot: response }]);
    setMessage('');
  };

  return (
    <View>
      <ScrollView>
        {responses.map((res, index) => (
          <View key={index}>
            <Text>Vous: {res.user}</Text>
            <Text>Bot: {res.bot}</Text>
          </View>
        ))}
      </ScrollView>
      <TextInput value={message} onChangeText={setMessage} placeholder="Entrez votre message" />
      <Button title="Envoyer" onPress={handleSend} />
    </View>
  );
};

export default Chatbot;
