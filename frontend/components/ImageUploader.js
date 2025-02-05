import React, { useState } from 'react';
import { Button, View, StyleSheet, Alert, ImageBackground } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// Fonction pour détecter le type MIME de l'image
const getMimeType = (uri) => {
  const extension = uri.split('.').pop().toLowerCase();
  const mimeTypes = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    bmp: 'image/bmp',
  };
  return mimeTypes[extension] || 'image/jpeg'; // Retourne 'image/jpeg' par défaut
};

const ImageUploader = ({ onImageSelected }) => {
  const [imageUri, setImageUri] = useState(null);

  // Demande d'autorisation d'accès à la galerie
  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Vous devez donner l\'autorisation pour accéder à la galerie.');
      return false;
    }
    return true;
  };

  // Sélectionner une image depuis la galerie
  const pickImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaType: ImagePicker.MediaTypeOptions.Photo,
      quality: 1,
    });

    if (result.cancelled) {
      console.log('Sélection annulée par l’utilisateur');
    } else {
      // Mise à jour de l'URI de l'image et appel du callback onImageSelected
      setImageUri(result.uri);
      onImageSelected(result.uri);
      uploadImage(result.uri);
    }
  };

  // Fonction pour uploader l'image via FormData
  const uploadImage = async (uri) => {
    const formData = new FormData();
    const mimeType = getMimeType(uri); // Détecte le type MIME de l'image
    const imageName = `image.${uri.split('.').pop()}`; // Nom de l'image avec extension

    formData.append('image', {
      uri,
      type: mimeType,
      name: imageName,
    });

    try {
      const response = await fetch('YOUR_BACKEND_URL_HERE', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi de l\'image');
      }

      const result = await response.json();
      console.log('Réponse de l\'API:', result);
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors du téléchargement de l\'image.');
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Choisir une image" onPress={pickImage} />
      {imageUri && (
        <ImageBackground
          source={{ uri: imageUri }}
          style={styles.image}
          imageStyle={{ borderRadius: 10 }}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Button title="Image chargée" disabled />
          </View>
        </ImageBackground>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
});

export default ImageUploader;
