import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../../../lib/supabase';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../../providers/AuthProvider';

export default function CreateGroup() {
  const [groupName, setGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  const handleCreate = async () => {
    if (!groupName || !user) {
      Alert.alert('Error', 'Please enter a group name.');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const userRole = profile.role;

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setJoinCode(code);

    const { data, error } = await supabase
      .from('home_groups')
      .insert([{ group_name: groupName, join_code: code, created_by: user.id }])
      .select()
      .single();

    if (error) {
      Alert.alert('Error creating group', error.message);
      return;
    }

    await supabase.from('group_members').insert([
      { group_id: data.id, user_id: user.id, role: 'admin', user_role: userRole },
    ]);

    Alert.alert('Success', `Group "${groupName}" created!\nJoin Code: ${code}`);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a New Group</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter group name"
        value={groupName}
        onChangeText={setGroupName}
      />
      <Button title="Create Group" onPress={handleCreate} />
      {joinCode ? <Text style={styles.code}>Join Code: {joinCode}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 20,
    borderRadius: 6,
  },
  code: { textAlign: 'center', marginTop: 20, fontSize: 16, fontWeight: 'bold' },
});


/*import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../../../lib/supabase';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../../providers/AuthProvider';

export default function CreateGroup() {
  const [groupName, setGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  const handleCreate = async () => {
    if (!groupName || !user) {
      Alert.alert('Error', 'Please enter a group name.');
      return;
    }

    try {
      // Get user role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (profileError || !profile) throw profileError;
      const userRole = profile.role;

      // Generate join code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      setJoinCode(code);

      // Create group
      const { data, error } = await supabase
        .from('home_groups')
        .insert([{ group_name: groupName, join_code: code, created_by: user.id }])
        .select()
        .single();
      if (error) throw error;

      // Add creator as admin
      const { error: memberError } = await supabase
        .from('group_members')
        .insert([{ group_id: data.id, user_id: user.id, role: 'admin', user_role: userRole }]);
      if (memberError) throw memberError;

      Alert.alert('Success', `Group "${groupName}" created!\nJoin Code: ${code}`);
      router.back();
    } catch (err: any) {
      console.error('Error creating group:', err);
      Alert.alert('Error', err.message || 'Something went wrong.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a New Group</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter group name"
        value={groupName}
        onChangeText={setGroupName}
      />
      <Button title="Create Group" onPress={handleCreate} />
      {joinCode ? <Text style={styles.code}>Join Code: {joinCode}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 20,
    borderRadius: 6,
  },
  code: { textAlign: 'center', marginTop: 20, fontSize: 16, fontWeight: 'bold' },
});


/*import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../../../lib/supabase';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../../providers/AuthProvider';

export default function CreateGroup() {
  const [groupName, setGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  const handleCreate = async () => {
    if (!groupName || !user) {
      Alert.alert('Error', 'Please enter a group name.');
      return;
    }

    // 1. Get user role from profiles
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

    // 2. Generate join code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setJoinCode(code);

    // 3. Create the group
    const { data, error } = await supabase
      .from('home_groups')
      .insert([{ group_name: groupName, join_code: code, created_by: user.id }])
      .select()
      .single();

    if (error) {
      Alert.alert('Error creating group', error.message);
      return;
    }

    // 4. Add creator as admin + store their user_role
    const { error: memberError } = await supabase
      .from('group_members')
      .insert([
        {
          group_id: data.id,
          user_id: user.id,
          role: 'admin',
          user_role: userRole, // << NEW
        },
      ]);

    if (memberError) {
      console.error('Error adding member:', memberError);
      Alert.alert('Error adding you to the group', memberError.message);
      return;
    }

    Alert.alert('Success', `Group "${groupName}" created!\nJoin Code: ${code}`);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a New Group</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter group name"
        value={groupName}
        onChangeText={(text) => setGroupName(text)}
      />
      <Button title="Create Group" onPress={handleCreate} />
      {joinCode ? (
        <Text style={styles.code}>Join Code: {joinCode}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 20,
    borderRadius: 6,
  },
  code: { textAlign: 'center', marginTop: 20, fontSize: 16, fontWeight: 'bold' },
});
*/
/*
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../../../lib/supabase'
import { useRouter } from 'expo-router';
import { useAuth } from '../../../../providers/AuthProvider';



export default function CreateGroup() {
  const [groupName, setGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  const handleCreate = async () => {
    // Display fetched userID of who created group
    console.log('DEBUG user:', user);

    if (!groupName || !user) {
      Alert.alert('Error', 'Please enter a group name.');
      return;
    }

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setJoinCode(code);

    const { data, error } = await supabase
      .from('home_groups')
      .insert([{ group_name: groupName, join_code: code, created_by: user.id }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      Alert.alert('Error creating group', error.message);
      return;
    }

    // Add the user as a member
    const { error: memberError } = await supabase
      .from('group_members')
      .insert([{ group_id: data.id, user_id: user.id, role: 'admin' }]);

    if (memberError) {
      console.error('Error adding member:', memberError);
      Alert.alert('Error adding you to the group', memberError.message);
      return;
    }

    Alert.alert('Success', `Group "${groupName}" created!\nJoin Code: ${code}`);
    router.back(); // Go back to main Groups screen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a New Group</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter group name"
        value={groupName}
        onChangeText={(text) => setGroupName(text)}
      />
      <Button title="Create Group" onPress={handleCreate} />
      {joinCode ? <Text style={styles.code}>Join Code: {joinCode}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 20, borderRadius: 6 },
  code: { textAlign: 'center', marginTop: 20, fontSize: 16, fontWeight: 'bold' },
});
*/