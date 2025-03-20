import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin();
    } catch (error) {
      console.error('Login error:', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Welcome Back</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F6F5' },
  card: {
    width: '90%',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333333', textAlign: 'center', marginBottom: 20 },
  input: { height: 50, borderColor: '#CCCCCC', borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, marginBottom: 15, fontSize: 16, color: '#333333' },
  button: { backgroundColor: '#3498DB', paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
});

export default LoginScreen;