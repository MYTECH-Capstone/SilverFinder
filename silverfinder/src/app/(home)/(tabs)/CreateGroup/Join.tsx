import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../../../lib/supabase'
import { useRouter } from 'expo-router';
import { useAuth } from '../../../../providers/AuthProvider';


export default function JoinGroup() {
  const [joinCode, setJoinCode] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  const handleJoin = async () => {
    if (!joinCode || !user) {
      Alert.alert('Error', 'Please enter a join code.');
      return;
    }

    const { data: group, error } = await supabase
      .from('home_groups')
      .select('id, group_name')
      .eq('join_code', joinCode)
      .single();

    if (error || !group) {
      Alert.alert('Error', 'No group found with that code.');
      return;
    }

    // Add user as a member (if not already)
    const { error: memberError } = await supabase
      .from('group_members')
      .insert([{ group_id: group.id, user_id: user.id, role: 'member' }])
      .select();

    if (memberError) {
      console.error('Error joining group:', memberError);
      Alert.alert('Error joining group', memberError.message);
      return;
    }

    Alert.alert('Success', `Joined "${group.group_name}"!`);
    router.back(); // Go back to Groups home
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join a Group</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter join code"
        value={joinCode}
        onChangeText={setJoinCode}
        autoCapitalize="characters"
      />
      <Button title="Join Group" onPress={handleJoin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 20, borderRadius: 6 },
});
