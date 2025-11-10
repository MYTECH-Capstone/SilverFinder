
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button, StyleSheet } from 'react-native';
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
      const { data, error } = await supabase
        .from('group_members')
        .select('group_id, home_groups(group_name, join_code)')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching groups:', error);
        return;
      }

      setGroups(data || []);
    };

    fetchGroups();
  }, [user]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Groups</Text>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.group_id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.groupCard}
            onPress={() => router.push({
              pathname: '/(home)/(tabs)/CreateGroup/GroupPage',
              params: { groupId: item.group_id.toString() },
            })}
          >
            <Text style={styles.groupName}>{item.home_groups.group_name}</Text>
            <Text>Join Code: {item.home_groups.join_code}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>You’re not in any groups yet.</Text>}
      />

      <Button title="Back" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  groupCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
  },
  groupName: { fontSize: 18, fontWeight: '600' },
});
