import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import ImageUploader from "../components/ImageUploader";
import AgricultureInfoButtons from "../components/AgricultureInfoButtons";
import { diagnoseDisease } from "../services/api";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../util/constants";

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

      // Vérification si tous les champs nécessaires sont remplis
      if (!humidity || !temperature || !soilType || !shadingLevel || !plantationDensity || !irrigationFrequency) {
        Alert.alert("Erreur", "Veuillez remplir tous les champs des données agricoles.");
        setLoading(false);
        return;
      }

      // Appel à l'API avec tous les paramètres nécessaires
      const response = await diagnoseDisease(imageUri, {
        humidity,
        temperature,
        soil_type: soilType,
        shading_level: shadingLevel,
        plantation_density: plantationDensity,
        irrigation_frequency: irrigationFrequency
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
      <Text style={styles.title}>Diagnostic des maladies des tomates</Text>

      <ImageUploader onImageSelect={setImageUri} />

      <AgricultureInfoButtons onSelect={setAgricultureData} />

      <View style={styles.buttonContainer}>
        <Button title="Diagnostiquer" onPress={handleDiagnose} disabled={loading} />
      </View>

      {loading && <ActivityIndicator size="large" color="#00AAFF" />}

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
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#333",
  },
  buttonContainer: {
    marginVertical: 20,
  },
  resultContainer: {
    backgroundColor: "#E8F4F8",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  resultText: {
    fontSize: 16,
    color: "#333",
  },
});

export default DiagnosisScreen;
