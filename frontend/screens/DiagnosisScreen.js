import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import ImageUploader from "../components/ImageUploader";
import AgricultureInfoButtons from "../components/AgricultureInfoButtons";
import { diagnoseDisease } from "../services/api";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../util/constants";

// Import du icon (assurez-vous que le chemin du icon est correct)
import icon from "../assets/icon.png";  

const DiagnosisScreen = () => {
  const [diagnosis, setDiagnosis] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [agricultureData, setAgricultureData] = useState({});
  const [loading, setLoading] = useState(false);

  const handleDiagnose = async () => {
    if (!imageUri || Object.keys(agricultureData).length === 0) {
      Alert.alert("Erreur", "Veuillez fournir une image et les données agricoles.");
      return;
    }

    setLoading(true);
    try {
      const { humidity, temperature, soilType, shadingLevel, plantationDensity, irrigationFrequency } = agricultureData;

      if (!humidity || !temperature || !soilType || !shadingLevel || !plantationDensity || !irrigationFrequency) {
        Alert.alert("Erreur", "Veuillez remplir tous les champs des données agricoles.");
        setLoading(false);
        return;
      }

      const response = await diagnoseDisease(imageUri, {
        humidity,
        temperature,
        soil_type: soilType,
        shading_level: shadingLevel,
        plantation_density: plantationDensity,
        irrigation_frequency: irrigationFrequency,
      });

      setDiagnosis(response.data);
      Alert.alert("Succès", SUCCESS_MESSAGES.DIAGNOSIS_SUCCESS);
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", ERROR_MESSAGES.DIAGNOSIS_FAILED);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* En-tête avec icon */}
      <View style={styles.header}>
        <Image source={icon} style={styles.icon} />
        <Text style={styles.title}>AgroTom</Text>
      </View>

      <ImageUploader onImageSelect={setImageUri} />
      <AgricultureInfoButtons onChange={setAgricultureData} />

      {/* Bouton stylisé */}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleDiagnose}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? "Analyse en cours..." : "Diagnostiquer"}</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#00AAFF" style={styles.loader} />}

      {diagnosis && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Résultat du Diagnostic :</Text>
          <Text style={styles.resultText}>{diagnosis.result}</Text>
          <Text style={styles.resultText}>Conseils : {diagnosis.recommendation}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4A90E2",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    marginBottom: 15,
    elevation: 3, // Ombre Android
    shadowColor: "#000", // Ombre iOS
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  icon: {
    width: 50,
    height: 50,
    resizeMode: "contain",
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  button: {
    backgroundColor: "#4A90E2",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  buttonDisabled: {
    backgroundColor: "#A9CCE3",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  loader: {
    marginVertical: 15,
  },
  resultContainer: {
    backgroundColor: "#E8F4F8",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    width: "100%",
    elevation: 2,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#007ACC",
  },
  resultText: {
    fontSize: 16,
    color: "#333333",
    marginBottom: 5,
  },
});

export default DiagnosisScreen;
