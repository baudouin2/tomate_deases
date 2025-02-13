import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);  // Nouveau state pour stocker l'utilisateur
  const [token, setToken] = useState(null);  // Nouveau state pour le token JWT

  // Charger les informations sauvegardées au démarrage
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        const savedToken = await AsyncStorage.getItem('access_token');
        const savedUser = await AsyncStorage.getItem('user');

        if (savedTheme) setTheme(savedTheme);
        if (savedToken) setToken(savedToken);
        if (savedUser) setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
      }
    };

    loadData();
  }, []);

  // Fonction pour basculer le thème
  const toggleTheme = async () => {
    try {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error("Erreur lors du changement de thème :", error);
    }
  };

  // Fonction de connexion
  const login = async (userData, token) => {
    try {
      setUser(userData);
      setToken(token);
      await AsyncStorage.setItem('access_token', token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      setUser(null);
      setToken(null);
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  return (
    <AppContext.Provider value={{ theme, toggleTheme, isLoading, setIsLoading, user, token, login, logout }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

// Thèmes améliorés
export const lightTheme = {
  background: '#F5F7FA', // Gris très clair
  text: '#1C1C1C', // Noir doux
  button: '#2D9CDB', // Bleu professionnel
};

export const darkTheme = {
  background: '#0A1F44', // Bleu foncé professionnel
  text: '#FFFFFF', // Texte blanc
  button: '#007BFF', // Bleu clair
};
