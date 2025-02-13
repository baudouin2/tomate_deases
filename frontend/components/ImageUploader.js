import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, Alert, TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAppContext } from "../contexts/AppContext"; // Pour gérer le mode sombre

const ImageUploader = ({ onImageSelected }) => {
  const [imageUri, setImageUri] = useState(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasGalleryPermission, setHasGalleryPermission] = useState(null);
  const { theme } = useAppContext();
  const isDarkMode = theme === "dark";

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        setHasCameraPermission(cameraStatus.status === "granted");
        setHasGalleryPermission(galleryStatus.status === "granted");
      } catch (error) {
        Alert.alert("Erreur", "Échec de la demande de permission");
        console.error("Erreur de permission : ", error);
      }
    };

    checkPermissions();
  }, []);

  const selectImageFromGallery = async () => {
    if (!hasGalleryPermission) {
      Alert.alert("Permission refusée", "L'application n'a pas la permission d'accéder à la galerie.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    handleImageResult(result);
  };

  const takePhoto = async () => {
    if (!hasCameraPermission) {
      Alert.alert("Permission refusée", "L'application n'a pas la permission d'utiliser la caméra.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    handleImageResult(result);
  };

  const handleImageResult = (result) => {
    if (result.canceled || !result.assets?.length) {
      console.log("Sélection d'image annulée.");
      return;
    }

    const selectedImageUri = result.assets[0].uri;
    setImageUri(selectedImageUri);
    onImageSelected({
      uri: selectedImageUri,
      type: getMimeType(selectedImageUri),
      fileName: `image.${selectedImageUri.split('.').pop()}`,
    });
    console.log("Image sélectionnée : ", selectedImageUri);
  };

  const getMimeType = (uri) => {
    const extension = uri.split(".").pop();
    const mimeTypes = {
      jpg: "image/jpeg",
      png: "image/png",
      jpeg: "image/jpeg",
    };
    return mimeTypes[extension] || "image/jpeg";
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? "#1E1E1E" : "#FFF" }]}>
      <TouchableOpacity style={[styles.button, isDarkMode && styles.buttonDark]} onPress={takePhoto}>
        <Text style={styles.buttonText}>📷 Prendre une photo</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, isDarkMode && styles.buttonDark]} onPress={selectImageFromGallery}>
        <Text style={styles.buttonText}>🖼️ Choisir depuis la galerie</Text>
      </TouchableOpacity>

      {imageUri && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
    borderRadius: 10,
  },
  button: {
    backgroundColor: "#4A90E2",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginVertical: 5,
    alignItems: "center",
    width: 250,
  },
  buttonDark: {
    backgroundColor: "#81C784",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  imageContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  image: {
    width: 250,
    height: 250,
    marginTop: 10,
    borderRadius: 10,
  },
});

export default ImageUploader;
