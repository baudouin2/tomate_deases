import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import ImageUploader from './ImageUploader';
import { diagnoseDisease } from '../services/api';

const DiseaseDiagnosis = () => {
  const [image, setImage] = useState(null);
  const [humidity, setHumidity] = useState('');
  const [temperature, setTemperature] = useState('');
  const [soilType, setSoilType] = useState('');
  const [shadingLevel, setShadingLevel] = useState('');
  const [plantationDensity, setPlantationDensity] = useState('');
  const [irrigationFrequency, setIrrigationFrequency] = useState('');

  const handleDiagnosis = async () => {
    if (!image || !humidity || !temperature || !soilType || !shadingLevel || !plantationDensity || !irrigationFrequency) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    // Appel à l'API avec tous les paramètres
    const result = await diagnoseDisease(image, {
      humidity,
      temperature,
      soil_type: soilType,
      shading_level: shadingLevel,
      plantation_density: plantationDensity,
      irrigation_frequency: irrigationFrequency
    });

    Alert.alert('Résultat', `Maladie: ${result.class}, Confiance: ${result.confidence}`);
  };

  return (
    <View style={styles.container}>
      {/* Sélecteur d'image */}
      <ImageUploader onImageSelected={setImage} />

      {/* Champ Humidité */}
      <TextInput
        style={styles.input}
        placeholder="Humidité (%)"
        value={humidity}
        onChangeText={setHumidity}
        keyboardType="numeric"
      />

      {/* Champ Température */}
      <TextInput
        style={styles.input}
        placeholder="Température (°C)"
        value={temperature}
        onChangeText={setTemperature}
        keyboardType="numeric"
      />

      {/* Champ Type de sol */}
      <TextInput
        style={styles.input}
        placeholder="Type de sol"
        value={soilType}
        onChangeText={setSoilType}
      />

      {/* Champ Niveau d'Ombrage */}
      <TextInput
        style={styles.input}
        placeholder="Niveau d'ombrage"
        value={shadingLevel}
        onChangeText={setShadingLevel}
      />

      {/* Champ Densité de Plantation */}
      <TextInput
        style={styles.input}
        placeholder="Densité de plantation"
        value={plantationDensity}
        onChangeText={setPlantationDensity}
      />

      {/* Champ Fréquence d'Irrigation */}
      <TextInput
        style={styles.input}
        placeholder="Fréquence d'irrigation"
        value={irrigationFrequency}
        onChangeText={setIrrigationFrequency}
      />

      {/* Bouton de diagnostic */}
      <TouchableOpacity style={styles.button} onPress={handleDiagnosis}>
        <Text style={styles.buttonText}>Diagnostiquer</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 5, borderRadius: 5 },
  button: { backgroundColor: '#4CAF50', padding: 15, alignItems: 'center', borderRadius: 5, marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default DiseaseDiagnosis;
