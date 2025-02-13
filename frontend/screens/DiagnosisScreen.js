import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from "react-native";
import ImageUploader from "../components/ImageUploader";
import AgricultureInfoButtons from "../components/AgricultureInfoButtons";
import { uploadImageData } from "../services/api";
import { useAppContext } from "../contexts/AppContext"; // Utilisation du contexte global
import icon from "../assets/icon.png";

const DiagnosisScreen = () => {
  const { theme } = useAppContext(); // Récupération du thème
  const isDarkMode = theme === "dark";

  const [imageUri, setImageUri] = useState(null);
  const [agricultureData, setAgricultureData] = useState({});
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);

  const handleDiagnose = async () => {
    if (!imageUri || Object.keys(agricultureData).length === 0) {
      Alert.alert("Erreur", "Veuillez fournir une image et les données agricoles.");
      console.log("Erreur : Image ou données agricoles manquantes.");
      return;
    }

    setLoading(true);
    try {
      console.log("Diagnostic en cours...");
      const result = await uploadImageData(imageUri, agricultureData);
      setDiagnosis(result);
      console.log("Diagnostic réussi : ", result);
    } catch (error) {
      Alert.alert("Erreur", "Le diagnostic a échoué. Veuillez réessayer.");
      console.error("Erreur de diagnostic : ", error);
    } finally {
      setLoading(false);
      console.log("Chargement terminé.");
    }
  };

  const handleAgricultureDataChange = (key, value) => {
    setAgricultureData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
    console.log(`Donnée agricole modifiée : ${key} = ${value}`);
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: isDarkMode ? "#0A1F44" : "#F5F7FA" }]}>
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: isDarkMode ? "#1E3A8A" : "#4CAF50" }]}>
        <Image source={icon} style={styles.icon} />
        <Text style={[styles.title, { color: isDarkMode ? "#FFF" : "#FFF" }]}>AgroTom</Text>
      </View>

      {/* UPLOAD IMAGE */}
      <ImageUploader onImageSelected={setImageUri} />
      {imageUri && <Image source={{ uri: imageUri }} style={styles.imagePreview} />}

      <Text style={[styles.infoText, { color: isDarkMode ? "#BBB" : "#333" }]}>
        Veuillez entrer les informations relatives aux conditions de culture des tomates :
      </Text>

      {/* INPUTS AGRICULTURE */}
      <AgricultureInfoButtons onChange={handleAgricultureDataChange} data={agricultureData} />

      {/* BOUTON DE DIAGNOSTIC */}
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: isDarkMode ? "#007BFF" : "#4CAF50" },
          loading && styles.buttonDisabled,
        ]}
        onPress={handleDiagnose}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? "Analyse en cours..." : "Diagnostiquer"}</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color={isDarkMode ? "#007BFF" : "#4CAF50"} style={styles.loader} />}

      {/* AFFICHAGE DES RÉSULTATS */}
      {diagnosis && (
        <View style={[styles.resultContainer, { backgroundColor: isDarkMode ? "#1E3A8A" : "#FFF" }]}>
          <Text style={[styles.resultTitle, { color: isDarkMode ? "#FFF" : "#333" }]}>Résultat :</Text>
          <Text style={[styles.resultText, { color: isDarkMode ? "#FFF" : "#333" }]}>
            {diagnosis.class} à {diagnosis.confidence}%
          </Text>
          <Text style={[styles.resultText, { color: isDarkMode ? "#FFF" : "#333" }]}>Conseils : {diagnosis.recommendation}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  icon: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  imagePreview: {
    width: 250,
    height: 250,
    marginVertical: 20,
    borderRadius: 10,
  },
  infoText: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
  },
  button: {
    padding: 15,
    alignItems: "center",
    borderRadius: 5,
    width: "100%",
  },
  buttonDisabled: {
    backgroundColor: "#A5D6A7",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  loader: {
    marginVertical: 10,
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  resultText: {
    fontSize: 16,
  },
});

export default DiagnosisScreen;
