import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';  // Assurez-vous d'importer l'écran de connexion
import DiagnosisScreen from './screens/DiagnosisScreen';
import ChatScreen from './screens/ChatScreen';
import { AppProvider, useAppContext, lightTheme, darkTheme } from './contexts/AppContext';
import Icon from 'react-native-vector-icons/Feather'; // Import des icônes

const Tab = createBottomTabNavigator();

const ThemedApp = () => {
  const { theme, toggleTheme } = useAppContext();
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Vérifier le token de l'utilisateur au démarrage
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        setIsAuthenticated(true);  // Utilisateur déjà connecté
      } else {
        setIsAuthenticated(false);  // Aucun token, donc non connecté
      }
    };
    checkAuth();
  }, []);

  return (
    <NavigationContainer>
      <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
        {isAuthenticated ? (
          <Tab.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: currentTheme.background },
              headerTintColor: currentTheme.text,
              tabBarStyle: { backgroundColor: currentTheme.background },
              tabBarActiveTintColor: currentTheme.button,
              headerRight: () => (
                <TouchableOpacity onPress={toggleTheme} style={styles.themeButton}>
                  <Icon
                    name={theme === 'light' ? 'moon' : 'sun'} // Soleil pour le mode clair, lune pour le mode sombre
                    size={24}
                    color={currentTheme.text}
                  />
                </TouchableOpacity>
              ),
            }}
          >
            <Tab.Screen name="Accueil" component={HomeScreen} />
            <Tab.Screen name="Diagnostic" component={DiagnosisScreen} />
            <Tab.Screen name="Chatbot" component={ChatScreen} />
          </Tab.Navigator>
        ) : (
          // Si l'utilisateur n'est pas connecté, rediriger vers l'écran de connexion
          <LoginScreen />
        )}
      </View>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AppProvider>
      <ThemedApp />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  themeButton: { marginRight: 15 },
});
