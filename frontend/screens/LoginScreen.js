import React, { useState } from 'react';
import { 
  View, TextInput, Button, Text, StyleSheet, ActivityIndicator, 
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert 
} from 'react-native';
import { useAppContext } from '../contexts/AppContext';
import { loginUser, registerUser } from '../services/api';

const LoginScreen = ({ navigation }) => {
  const { login } = useAppContext();
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const validatePassword = (password) => /^\d{5}$/.test(password);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await loginUser(fullName, password);
      
      if (response?.access) {
        await login(response.user, response.access); // Stocke le token et met à jour le contexte
        navigation.replace('Home');
      } else {
        setError(response?.detail || 'Identifiants incorrects');
      }
    } catch (err) {
      console.error("Erreur lors de la connexion:", err);
      setError(err.message || "Impossible de contacter le serveur.");
    }

    setLoading(false);
  };

  const handleRegister = async () => {
    if (!fullName || !password) {
      setError("Nom complet et mot de passe sont obligatoires");
      return;
    }
    if (!validatePassword(password)) {
      setError("Le mot de passe doit être un entier à 5 chiffres");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Envoi des données d'inscription:", { full_name: fullName, password, register: true });
      const response = await registerUser(fullName, password);

      if (response?.message) {
        setIsRegistering(false);
        setFullName('');
        setPassword('');
        setConfirmPassword('');
        Alert.alert("Succès", "Compte créé avec succès !");
      } else {
        setError(response?.detail || "Erreur lors de l'enregistrement");
      }
    } catch (err) {
      console.error("Erreur lors de l'inscription:", err);
      setError(err.message || "Impossible de contacter le serveur.");
    }

    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          <Text style={styles.title}>{isRegistering ? 'Créer un compte' : 'Connexion'}</Text>
          
          <InputField label="Nom complet" value={fullName} onChangeText={setFullName} />
          
          <InputField label="Mot de passe (5 chiffres)" value={password} onChangeText={setPassword} keyboardType="numeric" secureTextEntry />
          
          {isRegistering && (
            <>
              <InputField label="Confirmer le mot de passe" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
              <Button title="Créer un compte" onPress={handleRegister} />
            </>
          )}

          {!isRegistering && <Button title="Se connecter" onPress={handleLogin} />}

          {error && <Text style={styles.error}>{error}</Text>}

          <Text style={styles.toggleText} onPress={() => { 
            setIsRegistering(!isRegistering); 
            setError(null); 
            setConfirmPassword('');
          }}>
            {isRegistering ? 'Vous avez déjà un compte ? Connectez-vous' : 'Pas de compte ? Créez-en un'}
          </Text>

          {loading && <ActivityIndicator size="large" color="#3498db" style={styles.loader} />}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

// Composant réutilisable pour les champs de saisie
const InputField = ({ label, ...props }) => (
  <View style={styles.inputWrapper}>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={styles.input} {...props} />
  </View>
);

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f7f7f7' },
  innerContainer: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'white', borderRadius: 10, elevation: 5 },
  title: { fontSize: 26, fontWeight: '600', marginBottom: 30, textAlign: 'center', color: '#333' },
  inputWrapper: { marginBottom: 20 },
  label: { fontSize: 16, color: '#333', marginBottom: 5 },
  input: { height: 50, borderColor: '#ddd', borderWidth: 1, borderRadius: 8, paddingLeft: 15, fontSize: 16, backgroundColor: '#f9f9f9' },
  error: { color: '#e74c3c', marginBottom: 20, textAlign: 'center', fontSize: 14 },
  toggleText: { color: '#3498db', textAlign: 'center', marginTop: 20, fontSize: 16, textDecorationLine: 'underline' },
  loader: { marginTop: 20 }
});

export default LoginScreen;
