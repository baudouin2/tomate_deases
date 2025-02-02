import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen';
import DiagnosisScreen from './screens/DiagnosisScreen';
import ChatScreen from './screens/ChatScreen';
import { AppProvider } from './contexts/AppContext';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name="Accueil" component={HomeScreen} />
          <Tab.Screen name="Diagnostic" component={DiagnosisScreen} />
          <Tab.Screen name="Chatbot" component={ChatScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}
