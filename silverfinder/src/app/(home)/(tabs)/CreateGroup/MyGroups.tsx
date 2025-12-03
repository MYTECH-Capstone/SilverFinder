import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../providers/AuthProvider';
import { useRouter } from 'expo-router';

export default function MyGroups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const fetchGroups = async () => {
      try {
        // Step 1 — Get list of IDs the user belongs to
        const { data: memberships, error: membershipErr } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('user_id', user.id);

        if (membershipErr) throw membershipErr;

        const groupIds = memberships.map((m) => m.group_id);

        if (groupIds.length === 0) {
          setGroups([]);
          return;
        }

        // Step 2 — Load group details
        const { data: groupData, error: groupErr } = await supabase
          .from('home_groups')
          .select('id, group_name, join_code')
          .in('id', groupIds);

        if (groupErr) throw groupErr;

        setGroups(groupData || []);
      } catch (err: any) {
        console.error('Error fetching groups:', err);
        Alert.alert('Error', err.message || 'Failed to load groups.');
      }
    };

    fetchGroups();
  }, [user]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Groups</Text>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.groupCard}
            onPress={() =>
              router.push({
                pathname: '/(home)/(tabs)/CreateGroup/GroupPage',
                params: { groupId: item.id.toString() },
              })
            }
          >
            <Text style={styles.groupName}>{item.group_name}</Text>
            <Text style={styles.joinCode}> Join Code: {item.join_code}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>You’re not in any groups yet.</Text>}
      />

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#ffd8a8' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  groupCard: {
    backgroundColor: '#ffa826a7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupName: { 
    fontSize: 18, 
    fontWeight: '700',
    color: '#333',
    marginBottom: 4, 
  },

  backButton: {
    marginTop: 20,
    backgroundColor: '#f65e0cff',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  joinCode: {
    color: '#555',
    fontSize: 14,
  },
});
/*

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../providers/AuthProvider';
import { useRouter } from 'expo-router';

export default function MyGroups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const fetchGroups = async () => {
      try {
        // Step 1 — Get list of IDs the user belongs to
        const { data: memberships, error: membershipErr } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('user_id', user.id);

        if (membershipErr) throw membershipErr;

        const groupIds = memberships.map((m) => m.group_id);

        if (groupIds.length === 0) {
          setGroups([]);
          return;
        }

        // Step 2 — Load group details
        const { data: groupData, error: groupErr } = await supabase
          .from('home_groups')
          .select('id, group_name, join_code')
          .in('id', groupIds);

        if (groupErr) throw groupErr;

        setGroups(groupData || []);
      } catch (err: any) {
        console.error('Error fetching groups:', err);
        Alert.alert('Error', err.message || 'Failed to load groups.');
      }
    };

    fetchGroups();
  }, [user]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Groups</Text>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.groupCard}
            onPress={() =>
              router.push({
                pathname: '/(home)/(tabs)/CreateGroup/GroupPage',
                params: { groupId: item.id.toString() },
              })
            }
          >
            <Text style={styles.groupName}>{item.group_name}</Text>
            <Text style={styles.joinCode}> Join Code: {item.join_code}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>You’re not in any groups yet.</Text>}
      />

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#ffd8a8' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  groupCard: {
    backgroundColor: '#ffa826a7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupName: { 
    fontSize: 18, 
    fontWeight: '700',
    color: '#333',
    marginBottom: 4, 
  },

  backButton: {
    marginTop: 20,
    backgroundColor: '#f65e0cff',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  joinCode: {
    color: '#555',
    fontSize: 14,
  },
});


*/