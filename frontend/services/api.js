import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../util/constants';

// Instance Axios configurée
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Fonction générique pour envoyer des requêtes POST
const sendPostRequest = async (url, data) => {
  try {
    const response = await apiClient.post(url, data);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de l'envoi des données à ${url}:`, error?.response?.data || error.message);
    throw new Error(error?.response?.data?.detail || "Erreur réseau");
  }
};

// Gestion du token d'authentification avec expiration
const setAuthToken = async (token) => {
  if (token) {
    apiClient.defaults.headers['Authorization'] = `Bearer ${token}`;
    await AsyncStorage.setItem('access_token', token);
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 14); // Expire après 14 jours
    await AsyncStorage.setItem('token_expiration', expirationDate.toISOString());
  } else {
    delete apiClient.defaults.headers['Authorization'];
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('token_expiration');
  }
};

// Inscription utilisateur
export const registerUser = async (fullName, password) => {
  try {
    const response = await sendPostRequest('/api/authentication/authentication/', {
      full_name: fullName,
      password,
      register: true,
    });
    return response;
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    throw new Error("Impossible de s'inscrire");
  }
};

// Connexion utilisateur
export const loginUser = async (fullName, password) => {
  try {
    const response = await sendPostRequest('/api/authentication/authentication/', {
      full_name: fullName,
      password,
    });

    if (response && response.access) {
      await setAuthToken(response.access); // Stocker le token JWT avec expiration
      return response;
    } else {
      throw new Error("Authentification échouée, aucun token reçu");
    }
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    throw new Error(error.message || "Échec de l'authentification");
  }
};

// Déconnexion utilisateur
export const logoutUser = async () => {
  await setAuthToken(null);
};

// Vérification du token expiré
export const isTokenValid = async () => {
  const token = await AsyncStorage.getItem('access_token');
  const expiration = await AsyncStorage.getItem('token_expiration');

  if (!token || !expiration) return false;
  return new Date() < new Date(expiration);
};

// Fonction pour créer un FormData avec les données d'image et agricoles
const createFormData = (image, data) => {
  const formData = new FormData();
  formData.append('image', {
    uri: image.uri || image,
    type: image.type || 'image/jpeg',
    name: image.fileName || `image.${image.uri.split('.').pop()}`,
  });

  // Ajout des données agricoles
  const fields = [
    'humidity',
    'temperature',
    'soil_type',
    'shading_level',
    'plantation_density',
    'irrigation_frequency'
  ];

  fields.forEach(field => {
    formData.append(field, data[field] || data[field.replace(/_/g, '')]);
  });

  return formData;
};

// Fonction pour envoyer un formulaire avec image et données agricoles
export const uploadImageData = async (image, data, url = '/api/diagnosis/diagnosis/') => {
  const formData = createFormData(image, data);
  try {
    const response = await apiClient.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data ? response.data.diagnosis : null;
  } catch (error) {
    console.error("Erreur lors de l'upload des données:", error);
    return null;
  }
};

// Fonction pour récupérer des recommandations vidéo
export const fetchVideoRecommendations = async (query, page) => {
  try {
    const response = await apiClient.get('/api/youtube/youtube/', {
      params: { query, page },
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des recommandations vidéo:", error);
    return [];
  }
};

// Fonction pour envoyer un message au chatbot
export const sendMessageToChatbot = async (message) => {
  try {
    const response = await apiClient.post('/api/chatbot/chatbot/', { message });
    console.log("Réponse du chatbot:", response.data);

    if (response.data && (response.data.response || response.data.text)) {
      return response.data.response || response.data.text;
    } else {
      throw new Error("Réponse invalide du serveur");
    }
  } catch (error) {
    console.error("Erreur lors de la communication avec le chatbot:", error);
    throw new Error("Erreur lors de la communication avec le chatbot.");
  }
};
