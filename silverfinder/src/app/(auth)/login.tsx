import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../../lib/supabase';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'caretaker' | 'elderly'>('caretaker');
  const [isSignUp, setIsSignUp] = useState(false);

  async function signIn() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) Alert.alert('Sign In Error', error.message);
    else Alert.alert('Signed in successfully!');
  }

  async function signUp() {
    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) throw signUpError;

      const user = data.user;
      if (!user) throw new Error('User not created');

      // Insert role into profiles table
      const { error: insertError } = await supabase.from('profiles').insert([
        {
          id: user.id,
          email,
          role,
        },
      ]);

      if (insertError) throw insertError;

      Alert.alert(
        'Registration Successful',
        'Please verify your email before signing in.'
      );
    } catch (err: any) {
      Alert.alert('Sign Up Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        autoCapitalize="none"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {isSignUp && (
        <>
    <Text style={styles.label}>Select Role</Text>
    <View style={styles.pickerWrapper}>
      <Picker
        selectedValue={role}
        onValueChange={(itemValue) => setRole(itemValue as 'caretaker' | 'elderly')}
        style={styles.pickerStyle} 
        dropdownIconColor="#000" 
      >
        <Picker.Item label="Caretaker" value="caretaker" />
        <Picker.Item label="Elderly" value="elderly" />
      </Picker>
    </View>
  </>
      )}

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={isSignUp ? signUp : signIn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => setIsSignUp(!isSignUp)}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {isSignUp ? 'Switch to Sign In' : 'Switch to Sign Up'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ---------- STYLES ----------
const styles = StyleSheet.create({
  container: 
  { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: 
  { fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 30 },
  label: 
  { fontSize: 16, fontWeight: '500', marginBottom: 6, color: '#333' },
  input: 
  {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 12, fontSize: 16, marginBottom: 16,
  },
  pickerContainer: 
  { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 16, overflow: 'hidden',      
  height: 50, justifyContent: 'center' },
  picker: 
  {height: 50, width: '100%'},
  pickerWrapper: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 16, overflow: 'hidden', backgroundColor: '#fff',},
pickerStyle: { height: 50, width: '100%',},
  button: 
  { backgroundColor: '#3b82f6', padding: 14, borderRadius: 8, alignItems: 'center', marginVertical: 6 },
  secondaryButton: 
  { backgroundColor: '#10b981' },
  buttonText: 
  { color: '#fff', fontWeight: '600', fontSize: 16 },
}); 
