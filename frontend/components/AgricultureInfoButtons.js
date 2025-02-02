import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

// Nouvelle définition des catégories
const soilCategories = ["Sableux", "Argileux", "Humifère"]; // Exemple de types de sol
const shadingLevels = ["Faible", "Modéré", "Élevé"];  // Exemple de niveaux d'ombrage
const plantationDensities = ["Faible", "Moyenne", "Élevée"];  // Exemple de densités de plantation
const irrigationFrequencies = ["Irrégulière", "Régulière"];  // Exemple de fréquences d'irrigation

const AgricultureInfoButtons = ({ data, onChange }) => {
  return (
    <View style={styles.container}>
      {/* Champ Température */}
      <Text style={styles.label}>Température (°C) :</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={data.temperature}
        onChangeText={(value) => onChange("temperature", value)}
        placeholder="Ex: 25"
      />

      {/* Champ Humidité */}
      <Text style={styles.label}>Humidité (%) :</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={data.humidity}
        onChangeText={(value) => onChange("humidity", value)}
        placeholder="Ex: 60"
      />

      {/* Sélecteur de Type de Sol */}
      <Text style={styles.label}>Type de sol :</Text>
      <View style={styles.buttonGroup}>
        {soilCategories.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.button,
              data.soilType === type && styles.selectedButton,
            ]}
            onPress={() => onChange("soilType", type)}
          >
            <Text style={styles.buttonText}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sélecteur de Niveau d'Ombrage */}
      <Text style={styles.label}>Niveau d'ombrage :</Text>
      <View style={styles.buttonGroup}>
        {shadingLevels.map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.button,
              data.shadingLevel === level && styles.selectedButton,
            ]}
            onPress={() => onChange("shadingLevel", level)}
          >
            <Text style={styles.buttonText}>{level}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sélecteur de Densité de Plantation */}
      <Text style={styles.label}>Densité de plantation :</Text>
      <View style={styles.buttonGroup}>
        {plantationDensities.map((density) => (
          <TouchableOpacity
            key={density}
            style={[
              styles.button,
              data.plantationDensity === density && styles.selectedButton,
            ]}
            onPress={() => onChange("plantationDensity", density)}
          >
            <Text style={styles.buttonText}>{density}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sélecteur de Fréquence d'Irrigation */}
      <Text style={styles.label}>Fréquence d'irrigation :</Text>
      <View style={styles.buttonGroup}>
        {irrigationFrequencies.map((frequency) => (
          <TouchableOpacity
            key={frequency}
            style={[
              styles.button,
              data.irrigationFrequency === frequency && styles.selectedButton,
            ]}
            onPress={() => onChange("irrigationFrequency", frequency)}
          >
            <Text style={styles.buttonText}>{frequency}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10 },
  label: { fontWeight: "bold", marginVertical: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonGroup: { flexDirection: "row", justifyContent: "space-around" },
  button: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 5,
    margin: 5,
  },
  selectedButton: {
    backgroundColor: "#4CAF50",
  },
  buttonText: {
    color: "#000",
  },
});

export default AgricultureInfoButtons;
