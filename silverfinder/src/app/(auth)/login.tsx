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
import { supabase } from '../../lib/supabase';
import { set } from 'date-fns';
import { is, se } from 'date-fns/locale';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'elderly' | 'caretaker' >();
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter an email and password.');
      return;
    }
    if (isSignUp && !role) {
      Alert.alert('Missing Role', 'Please select a role.');
      return;
    }
    try {
      setLoading(true);
      if (isSignUp) {
        const { data, error: signUpError} = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {role}
          }
        });
        if (signUpError) throw signUpError;
        const user = data.user;

        
        Alert.alert(
       'Check your email',
       'A verification link has been sent. Please verify before signing in.'
        );

        /*if (user) {

          const { error: insertError } = await supabase.from('profiles').insert([
            {
              id: user.id,
              role: role,
            },
          ]);

          if (insertError) throw insertError;
          Alert.alert('Success', 'Registration successful! Please verify your email before signing in.');
        } */
      } else {
        const {data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;

        const user = data.user;
    if (user) {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        const { error: insertError } = await supabase.from('profiles').insert([
          { id: user.id},
        ]);
        if (insertError) throw insertError;
      }
    }

        Alert.alert('Success', 'Signed in successfully!');
      }
    } catch (error: any) {
      console.error(error);

      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
    
  }
 

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>


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
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {isSignUp && (
        <View style ={styles.roleContainer}>
        <Text style={styles.roleLabel}>Select Role</Text>
        <View style={styles.roleButtons}>
          <TouchableOpacity
            style={[styles.roleButton, role === 'caretaker' && styles.selectedRoleButton]}
            onPress={() => setRole('caretaker')}
          >
            <Text style={[styles.roleText, role === 'caretaker' && styles.selectedRoleText]}>
              Caretaker
              </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleButton, role === 'elderly' && styles.selectedRoleButton]}
            onPress={() => setRole('elderly')}
          >
            <Text style={[styles.roleText, role === 'elderly' && styles.selectedRoleText]}>Elderly</Text>
          </TouchableOpacity>
        </View>
      </View>
      )}

      <TouchableOpacity style={styles.authButton} onPress={handleAuth} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.authButtonText}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
        <Text style={styles.toggleText}>
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>
    </View>
  );
  }




// ---------- STYLES ----------
const styles = StyleSheet.create({
  container: 
  { 
    flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' 
  },
  title: 
  { 
    fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 30 
  },
  
  input: 
  {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  authButton: {
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  authButtonText: { 
    color: '#fff', fontWeight: '600', fontSize: 16 
  },

  toggleText: { 
    color: '#007AFF', marginTop: 16, fontSize: 14 
  },

  roleContainer: {
    width: '100%', marginBottom: 20,
  },
  roleLabel: { 
    fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 
  },
  roleButton: {
    flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingVertical: 12, marginHorizontal: 5, alignItems: 'center',
  },
  roleButtons: { 
    flexDirection: 'row', justifyContent: 'space-between' 
  },
  selectedRoleButton: { 
    backgroundColor: '#3b82f6', borderColor: '#3b82f6' 
  },
  roleText: { 
    fontSize: 16, color: '#333'

  },
  
  selectedRoleText: { 
    color: '#fff', fontWeight: '700' 
  },
  
});