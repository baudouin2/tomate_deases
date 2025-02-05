import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import VideoRecommendations from '../components/VideoRecommendations';

// Remplacez le chemin de l'image par le vôtre
import icon from '../assets/icon.png';  

const HomeScreen = ({ navigation }) => (
  <View style={styles.container}>
    {/* En-tête avec le icon et le titre */}
    <View style={styles.header}>
      <Image source={icon} style={styles.icon} />
      <Text style={styles.title}>AgroTom</Text>
    </View>

    {/* Contenu défilable */}
    <ScrollView contentContainerStyle={styles.content}>
      <VideoRecommendations />

      {/* Bouton de navigation */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ChatScreen')}
      >
        <Text style={styles.buttonText}>Accéder au Chatbot</Text>
      </TouchableOpacity>
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5, // ombre sur Android
    shadowColor: '#000', // ombre sur iOS
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  icon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 20,
    elevation: 3, // ombre sur Android
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
