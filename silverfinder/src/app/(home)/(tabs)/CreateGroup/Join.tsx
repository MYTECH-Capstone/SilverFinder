import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../../../lib/supabase';
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 20,
    borderRadius: 6,
  },
});


/*import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../../../lib/supabase';
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

    try {
      // Get user role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) throw profileError;
      const userRole = profile.role;

      // Find group by join code
      const { data: group, error: groupError } = await supabase
        .from('home_groups')
        .select('id, group_name')
        .eq('join_code', joinCode)
        .single();

      if (groupError || !group) {
        Alert.alert('Error', 'No group found with that code.');
        return;
      }

      // Insert membership (RLS enforces caretaker/elderly rules)
      const { error: memberError } = await supabase
        .from('group_members')
        .insert([{ group_id: group.id, user_id: user.id, role: 'member', user_role: userRole }]);

      if (memberError) {
        Alert.alert('Cannot join group', memberError.message);
        return;
      }

      Alert.alert('Success', `Joined "${group.group_name}"!`);
      router.back();
    } catch (err: any) {
      console.error('Join group error:', err);
      Alert.alert('Error', err.message || 'Something went wrong.');
    }
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 20,
    borderRadius: 6,
  },
});


/*import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../../../lib/supabase';
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

    // 1. Fetch the user's role
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

    // 2. Elderly users can only join ONE group
    if (userRole === 'elderly') {
      const { data: existingGroups, error: groupCheckError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

      if (groupCheckError) {
        Alert.alert('Error', 'Could not check your current groups.');
        return;
      }

      if (existingGroups.length >= 1) {
        Alert.alert('Limit Reached', 'Elderly users may only belong to one group.');
        return;
      }
    }

    // 3. Find group by join code
    const { data: group, error: groupError } = await supabase
      .from('home_groups')
      .select('id, group_name')
      .eq('join_code', joinCode)
      .single();

    if (groupError || !group) {
      Alert.alert('Error', 'No group found with that code.');
      return;
    }

    // 4. Add the user as a member with user_role stored
    const { error: memberError } = await supabase
      .from('group_members')
      .insert([
        {
          group_id: group.id,
          user_id: user.id,
          role: 'member',
          user_role: userRole, // << NEW
        },
      ])
      .select();

    if (memberError) {
      console.error('Error joining group:', memberError);
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 20,
    borderRadius: 6,
  },
});
*/
/*import React, { useState } from 'react';
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
*/