import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button, StyleSheet, Alert, StatusBar } from 'react-native';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../providers/AuthProvider';
import { useRouter, Stack } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

export default function MyGroups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const fetchGroups = async () => {
      try {
        // Get list of IDs the user belongs to
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

        // Load group details
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
      <Stack.Screen options={{ headerShown: false }} />

      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}> ← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Groups</Text>
        <View style={{ width: 60 }} /> 
      </View>

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

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff8f3' },
  title: { 
    fontSize: 24, 
    fontWeight: '800', 
    marginBottom: 20,
    paddingTop: 60, 
  },
  groupCard: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 14,
    borderColor: '#f0d5be',
    borderWidth: 2,
    gap: 12,
    marginBottom: 12,
    shadowColor: '#e85d04',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  groupName: { 
    fontSize: 18, 
    fontWeight: '700',
    color: '#333',
    marginBottom: 4, 
  },

  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
    color: '#e85d04',
    fontSize: 20,
    fontWeight: '600',
    paddingVertical: 11,
    minWidth: 72,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderColor: '#f0d5be',
    borderBottomWidth: 1.5,
    paddingBottom: 1,
    paddingTop: 20,
  },
});