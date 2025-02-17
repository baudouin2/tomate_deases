import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import DiagnosisScreen from './screens/DiagnosisScreen';
import ChatScreen from './screens/ChatScreen';
import { AppProvider, useAppContext, lightTheme, darkTheme } from './contexts/AppContext';
import Icon from 'react-native-vector-icons/Feather';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TOKEN_EXPIRATION_DAYS = 14;

const isTokenExpired = async () => {
  const expiration = await AsyncStorage.getItem('token_expiration');
  if (!expiration) return true;
  return new Date() > new Date(expiration);
};

const MainTabs = () => {
  const { theme, toggleTheme } = useAppContext();
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: currentTheme.background },
        headerTintColor: currentTheme.text,
        tabBarStyle: { backgroundColor: currentTheme.background },
        tabBarActiveTintColor: currentTheme.button,
        headerRight: () => (
          <TouchableOpacity onPress={toggleTheme} style={styles.themeButton}>
            <Icon name={theme === 'light' ? 'moon' : 'sun'} size={24} color={currentTheme.text} />
          </TouchableOpacity>
        ),
      }}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Diagnostic" component={DiagnosisScreen} />
      <Tab.Screen name="Chatbot" component={ChatScreen} />
    </Tab.Navigator>
  );
};

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
  </Stack.Navigator>
);

const ThemedApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('access_token');
      const expired = await isTokenExpired();

      if (token && !expired) {
        setIsAuthenticated(true);
      } else {
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('token_expiration');
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AppProvider>
      <ThemedApp />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  themeButton: { marginRight: 15 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
