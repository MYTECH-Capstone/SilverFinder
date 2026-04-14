import React, { useState } from 'react';
import { 
  View, TextInput, TouchableOpacity, Text, StyleSheet, 
  Alert, StatusBar, ActivityIndicator 
} from 'react-native';
import { supabase } from '../../../../lib/supabase';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '../../../../providers/AuthProvider';
import { AntDesign } from '@expo/vector-icons';

export default function JoinGroup() {
  const [joinCode, setJoinCode] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleJoin = async () => {
    if (!joinCode || !user) {
      Alert.alert('Error', 'Please enter a join code.');
      return;
    }

    try {
      setLoading(true);
      // 1. Fetch user's role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        Alert.alert('Error', 'Could not verify user role.');
        return;
      }

      const userRole = profile.role;

      // 2. Elderly check removed! RLS handles the membership limit on the server.
      /*
      if (userRole === 'elderly') {
        const { data: existingGroups } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('user_id', user.id);

        if (existingGroups.length >= 1) {
          Alert.alert('Limit Reached', 'Elderly users may only belong to one group.');
          return;
        }
      }
      */

      // 3. Get group by join code
      const { data: group, error: groupError } = await supabase
        .from('home_groups')
        .select('id, group_name')
        .eq('join_code', joinCode.trim().toUpperCase())
        .single();

      if (groupError || !group) {
        Alert.alert('Error', 'No group found with that code.');
        return;
      }

      // 4. Join group - RLS will block elderly users if they are already in a group
      const { error: memberError } = await supabase
        .from('group_members')
        .insert([
          { group_id: group.id, user_id: user.id, role: 'member', user_role: userRole },
        ]);

      if (memberError) {
        // Customize the error message for clarity if the RLS limit is hit
        if (memberError.code === '42501' || memberError.message.includes('RLS')) {
           Alert.alert('Error joining group', 'Access Denied: Elderly users may only belong to one group. Caretakers may join any group.');
        } else {
          Alert.alert('Error joining group', memberError.message);
        }
        return;
      }

      Alert.alert('Success', `Joined "${group.group_name}"!`);
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
          <AntDesign name="login" size={32} color="#e85d04" />
        </View>
        <Text style={styles.title}>Join a Group</Text>
        <Text style={styles.subtitle}>Enter a join code to connect with your group</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.card}>
        <Text style={styles.fieldLabel}>Join Code</Text>
        <TextInput
          style={[styles.input, isFocused && styles.inputFocused]}
          placeholder="e.g. P1V2S3"
          placeholderTextColor="#bfa090"
          value={joinCode}
          onChangeText={setJoinCode}
          autoCapitalize="characters"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        <TouchableOpacity
          style={[styles.joinBtn, loading && { opacity: 0.6 }]}
          onPress={handleJoin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.joinBtnText}>Join Group</Text>
          )}
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
    alignItems: 'center', 
    justifyContent: 'center',
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
    marginBottom: 24 
  },
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
    letterSpacing: 0.5,
  },
  inputFocused: {
    borderColor: '#e85d04',
    backgroundColor: '#ffffff',
  },
  joinBtn: {
    backgroundColor: '#e85d04',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  joinBtnText: { 
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