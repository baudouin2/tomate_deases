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
    throw new Error(error?.response?.data?.message || "Erreur réseau");
  }
};

// Gestion du token d'authentification
const setAuthToken = async (token) => {
  if (token) {
    apiClient.defaults.headers['Authorization'] = `Bearer ${token}`;
    await AsyncStorage.setItem('access_token', token);
  } else {
    delete apiClient.defaults.headers['Authorization'];
    await AsyncStorage.removeItem('access_token');
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
    const response = await fetch('http://localhost:8000/api/authentication/authentication/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ full_name: fullName, password }),
    });

    const data = await response.json();
    console.log("Réponse du serveur:", data); // Ajoute ce log

    if (!response.ok) {
      throw new Error(data.detail || "Erreur lors de l'authentification");
    }

    return data;
  } catch (error) {
    console.error("Erreur dans loginUser:", error);
    return null;
  }
};


// Déconnexion utilisateur
export const logoutUser = async () => {
  await setAuthToken(null);
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

// Fonction générique pour diagnostiquer des maladies ou uploader des données agricoles
export const uploadImageData = async (image, data, url = '/api/diagnosis/diagnosis/') => {
  const formData = createFormData(image, data);
  const result = await sendFormData(url, formData);
  return result ? result.diagnosis : null;
};

// Fonction pour récupérer des recommandations vidéo
export const fetchVideoRecommendations = async (query, page) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/youtube/youtube/`, {
      params: { query, page },
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des recommandations vidéo:", error);
    return []; // Retourner un tableau vide en cas d'erreur
  }
};

// Fonction pour envoyer un message au chatbot
export const sendMessageToChatbot = async (message) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/chatbot/chatbot/`, { message });
    console.log("Réponse du chatbot:", response.data); // Déboguer la réponse complète
    
    // Assurez-vous que la réponse contient une structure valide
    if (response.data && (response.data.response || response.data.text)) {
      return response.data.response || response.data.text;
    } else {
      throw new Error("Réponse invalide du serveur");
    }
  } catch (error) {
    console.error("Erreur lors de la communication avec le chatbot:", error);
    throw new Error("Erreur lors de la communication avec le chatbot."); // Lancer une erreur pour la gestion en amont
  }
};
