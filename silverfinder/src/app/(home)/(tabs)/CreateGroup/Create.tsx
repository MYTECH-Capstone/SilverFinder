import React, { useState } from 'react';
import {
  View, TextInput, Text, StyleSheet,
  Alert, TouchableOpacity, StatusBar, ActivityIndicator,
} from 'react-native';
import { supabase } from '../../../../lib/supabase';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '../../../../providers/AuthProvider';
import { AntDesign } from '@expo/vector-icons';

export default function CreateGroup() {
  const [groupName, setGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleCreate = async () => {
    if (!groupName || !user) {
      Alert.alert('Error', 'Please enter a group name.');
      return;
    }
    try {
      setLoading(true);
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', user.id).single();
      const userRole = profile.role;
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      setJoinCode(code);
      const { data, error } = await supabase
        .from('home_groups')
        .insert([{ group_name: groupName, join_code: code, created_by: user.id }])
        .select().single();
      if (error) { Alert.alert('Error creating group', error.message); return; }
      await supabase.from('group_members').insert([
        { group_id: data.id, user_id: user.id, role: 'admin', user_role: userRole },
      ]);
      Alert.alert('Success', `Group "${groupName}" created!\nJoin Code: ${code}`);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>

      <Stack.Screen options={{ headerShown: false }} />

      <StatusBar barStyle="dark-content" />

      <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}> ← Back</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <AntDesign name="edit" size={32} color="#e85d04" />
        </View>
        <Text style={styles.title}>Create a New Group</Text>
        <Text style={styles.subtitle}>To get started, give your new group a name</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.card}>
        <Text style={styles.fieldLabel}>Group Name</Text>
        <TextInput
          style={[styles.input, isFocused && styles.inputFocused]}
          placeholder="e.g. The Silver Family"
          placeholderTextColor="#bfa090"
          value={groupName}
          onChangeText={setGroupName}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        <TouchableOpacity
          style={[styles.createBtn, loading && { opacity: 0.6 }]}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.createBtnText}>Create Group</Text>
          }
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff8f3',
    paddingHorizontal: 20,
    paddingTop: 72,
  },
  header: { 
    alignItems: 'center', 
    gap: 8, 
    marginBottom: 24, 
    paddingTop: 120,
  },
  headerIcon: {
    width: 64, 
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e85d040f',
    borderWidth: 1.5,
    borderColor: '#f0d5be',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
    elevation: 2,
    shadowColor: '#e85d04',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  title: { 
    fontSize: 26, 
    fontWeight: '700', 
    color: '#1a1a1a', 
    textAlign: 'center',
    textTransform: 'uppercase',
    paddingHorizontal: 4,
   },
  subtitle: { 
    fontSize: 14, 
    color: '#7a5c45', 
    textAlign: 'center' 
  },

  divider: { 
    height: 1.5, 
    backgroundColor: '#f0d5be', 
    marginBottom: 24 },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#f0d5be',
    gap: 12,
    shadowColor: '#e85d04',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },

  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#9d4f1a',
    marginBottom: 2,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#f0d5be',
    backgroundColor: '#fff4ec',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: '#1a1a1a',
  },
  inputFocused: {
    borderColor: '#e85d04',
    backgroundColor: '#ffffff',
  },
  createBtn: {
    backgroundColor: '#e85d04',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  createBtnText: { 
    color: '#fff', 
    fontSize: 17, 
    fontWeight: '700'
   },
    backBtn: {
    flexDirection: 'row',
    width: 60,
    color: '#e85d04',
    fontSize: 20,
    fontWeight: '600',
    paddingVertical: 11,
    minWidth: 72,
    position: 'absolute',
    paddingTop:20.
  },
});