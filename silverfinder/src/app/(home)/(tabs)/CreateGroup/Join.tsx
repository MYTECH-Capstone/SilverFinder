import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../../../lib/supabase';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../../providers/AuthProvider';

export default function JoinGroup() {
  const [joinCode, setJoinCode] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleJoin = async () => {
    if (!joinCode || !user) {
      Alert.alert('Error', 'Please enter a join code.');
      return;
    }

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

    // 2. Elderly users can't be in more than 1 group (enforced by RLS too)
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

    // 3. Get group by join code
    const { data: group, error: groupError } = await supabase
      .from('home_groups')
      .select('id, group_name')
      .eq('join_code', joinCode)
      .single();

    if (groupError || !group) {
      Alert.alert('Error', 'No group found with that code.');
      return;
    }

    // 4. Join group
    const { error: memberError } = await supabase
      .from('group_members')
      .insert([
        { group_id: group.id, user_id: user.id, role: 'member', user_role: userRole },
      ]);

    if (memberError) {
      Alert.alert('Error joining group', memberError.message);
      return;
    }

    Alert.alert('Success', `Joined "${group.group_name}"!`);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join a Group</Text>
      <TextInput
        style={[
          styles.input,
          isFocused ? styles.inputFocused : styles.inputBlurred
        ]}
        placeholder="Enter join code"
        value={joinCode}
        onChangeText={setJoinCode}
        autoCapitalize="characters"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
       
      />
      <TouchableOpacity style={styles.joinButton} onPress={handleJoin}>
        <Text style={styles.joinButtonText}>Join Group</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#ffd8a8' },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 20, fontWeight: 600, },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 20,
    borderRadius: 10,
    height: 50,
  },
  inputFocused: {
    borderColor: '#f65e0cff',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  inputBlurred: {
    backgroundColor: 'transparent',
  },
  joinButton: {
    backgroundColor: '#ffa726ff',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,  
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
});