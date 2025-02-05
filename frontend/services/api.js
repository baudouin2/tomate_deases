import axios from 'axios';
import { BASE_URL } from '../util/constants';

export const fetchVideoRecommendations = async (query, page) => {
  try {
    const response = await axios.get(`${BASE_URL}/youtube/`, {
      params: {
        query,
        page,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching video recommendations:", error);
    return [];
  }
};



export const diagnoseDisease = async (image, data) => {
  const formData = new FormData();
  formData.append('image', {
    uri: image.uri,
    type: image.type,
    name: image.fileName,
  });
  formData.append('humidity', data.humidity);
  formData.append('temperature', data.temperature);
  formData.append('soil_type', data.soil_type);

  try {
    const response = await axios.post(`${BASE_URL}/diagnosis/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.diagnosis;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const sendMessageToChatbot = async (message) => {
  try {
    const response = await axios.post(`${BASE_URL}/chatbot/`, { message });
    return response.data.response;
  } catch (error) {
    console.error(error);
    return "Erreur lors de la communication avec le chatbot.";
  }
};
