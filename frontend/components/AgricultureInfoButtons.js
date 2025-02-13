import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useAppContext } from "../contexts/AppContext"; // Contexte pour gérer le mode sombre

const soilCategories = ["sableux", "argileux", "limoneux"];
const shadingLevels = ["faible", "modéré", "élevé"];
const plantationDensities = ["faible", "moyenne", "élevée"];
const irrigationFrequencies = ["irrégulière", "régulière"];

const AgricultureInfoButtons = ({ data = {}, onChange }) => {
  const { theme } = useAppContext();
  const isDarkMode = theme === "dark";

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? "#1E1E1E" : "#FFF" }]}>
      {/* Température */}
      <Text style={[styles.label, { color: isDarkMode ? "#FFF" : "#000" }]}>Température (°C) :</Text>
      <TextInput
        style={[styles.input, { backgroundColor: isDarkMode ? "#333" : "#FFF", color: isDarkMode ? "#FFF" : "#000" }]}
        keyboardType="numeric"
        value={data.temperature || ""}
        onChangeText={(value) => onChange("temperature", value)}
        placeholder="Ex: 25"
        placeholderTextColor={isDarkMode ? "#BBB" : "#777"}
      />

      {/* Humidité */}
      <Text style={[styles.label, { color: isDarkMode ? "#FFF" : "#000" }]}>Humidité (%) :</Text>
      <TextInput
        style={[styles.input, { backgroundColor: isDarkMode ? "#333" : "#FFF", color: isDarkMode ? "#FFF" : "#000" }]}
        keyboardType="numeric"
        value={data.humidity || ""}
        onChangeText={(value) => onChange("humidity", value)}
        placeholder="Ex: 60"
        placeholderTextColor={isDarkMode ? "#BBB" : "#777"}
      />

      {/* Type de sol */}
      <Text style={[styles.label, { color: isDarkMode ? "#FFF" : "#000" }]}>Type de sol :</Text>
      <View style={styles.buttonGroup}>
        {soilCategories.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.button,
              data.soilType === type && (isDarkMode ? styles.selectedButtonDark : styles.selectedButton),
              data.soilType === type && { backgroundColor: "#FF5722" }, // Rouge orangé lorsque sélectionné
            ]}
            onPress={() => onChange("soilType", type)}
          >
            <Text style={[styles.buttonText, { color: data.soilType === type ? "#E3F2FD" : isDarkMode ? "#FFF" : "#000" }]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Niveau d'ombrage */}
      <Text style={[styles.label, { color: isDarkMode ? "#FFF" : "#000" }]}>Niveau d'ombrage :</Text>
      <View style={styles.buttonGroup}>
        {shadingLevels.map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.button,
              data.shadingLevel === level && (isDarkMode ? styles.selectedButtonDark : styles.selectedButton),
              data.shadingLevel === level && { backgroundColor: "#FF5722" }, // Rouge orangé lorsque sélectionné
            ]}
            onPress={() => onChange("shadingLevel", level)}
          >
            <Text style={[styles.buttonText, { color: data.shadingLevel === level ? "#E3F2FD" : isDarkMode ? "#FFF" : "#000" }]}>
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Densité de plantation */}
      <Text style={[styles.label, { color: isDarkMode ? "#FFF" : "#000" }]}>Densité de plantation :</Text>
      <View style={styles.buttonGroup}>
        {plantationDensities.map((density) => (
          <TouchableOpacity
            key={density}
            style={[
              styles.button,
              data.plantationDensity === density && (isDarkMode ? styles.selectedButtonDark : styles.selectedButton),
              data.plantationDensity === density && { backgroundColor: "#FF5722" }, // Rouge orangé lorsque sélectionné
            ]}
            onPress={() => onChange("plantationDensity", density)}
          >
            <Text style={[styles.buttonText, { color: data.plantationDensity === density ? "#E3F2FD" : isDarkMode ? "#FFF" : "#000" }]}>
              {density}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Fréquence d'irrigation */}
      <Text style={[styles.label, { color: isDarkMode ? "#FFF" : "#000" }]}>Fréquence d'irrigation :</Text>
      <View style={styles.buttonGroup}>
        {irrigationFrequencies.map((frequency) => (
          <TouchableOpacity
            key={frequency}
            style={[
              styles.button,
              data.irrigationFrequency === frequency && (isDarkMode ? styles.selectedButtonDark : styles.selectedButton),
              data.irrigationFrequency === frequency && { backgroundColor: "#FF5722" }, // Rouge orangé lorsque sélectionné
            ]}
            onPress={() => onChange("irrigationFrequency", frequency)}
          >
            <Text style={[styles.buttonText, { color: data.irrigationFrequency === frequency ? "#E3F2FD" : isDarkMode ? "#FFF" : "#000" }]}>
              {frequency}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderRadius: 15,
    margin: 10,
    backgroundColor: "#f5f5f5", // Douce couleur de fond
  },
  label: {
    fontWeight: "600",
    fontSize: 16,
    marginVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    fontWeight: "500",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    flexWrap: "wrap",
    marginVertical: 12,
  },
  button: {
    backgroundColor: "#EFEFEF", // Couleur douce de fond pour les boutons
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 25,
    margin: 8,
    elevation: 4, // Ajoute une ombre pour un effet de profondeur
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  selectedButton: {
    backgroundColor: "#FF5722", // Rouge orangé pour le bouton sélectionné
  },
  selectedButtonDark: {
    backgroundColor: "#FF7043", // Rouge orangé clair pour le mode sombre
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AgricultureInfoButtons;
