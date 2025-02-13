import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import VideoRecommendations from "../components/VideoRecommendations";
import { useAppContext } from "../contexts/AppContext"; // Contexte global
import icon from "../assets/icon.png";  

const HomeScreen = ({ navigation }) => {
  const { theme } = useAppContext(); // Récupération du thème global
  const isDarkMode = theme === "dark";

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? "#0A1F44" : "#F5F5F5" }]}>
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: isDarkMode ? "#1E3A8A" : "#4A90E2" }]}>
        <Image source={icon} style={styles.icon} />
        <Text style={[styles.title, { color: "#FFF" }]}>AgroTom</Text>
      </View>

      {/* CONTENU */}
      <ScrollView contentContainerStyle={styles.content}>
        <VideoRecommendations />

        {/* BOUTON DE NAVIGATION */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: isDarkMode ? "#007BFF" : "#4A90E2" }]}
          onPress={() => navigation.navigate("ChatScreen")}
        >
          <Text style={styles.buttonText}>Accéder au Chatbot</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
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
    fontSize: 24,
    fontWeight: "bold",
  },
  content: {
    padding: 20,
    alignItems: "center",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default HomeScreen;
