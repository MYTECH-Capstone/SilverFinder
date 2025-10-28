import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../providers/AuthProvider';

export default function GroupPage() {
  const { groupId } = useLocalSearchParams();
  const [members, setMembers] = useState<any[]>([]);
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        // Fetch group info
        const { data: groupData, error: groupError } = await supabase
          .from('home_groups')
          .select('*')
          .eq('id', groupId)
          .single();

        if (groupError) throw groupError;
        setGroup(groupData);

        // Fetch members with email or username from auth.users
        const { data: memberData, error: memberError } = await supabase
          .from('group_members')
          .select('user_id, role, auth_users(email)')
          .eq('group_id', groupId)
          .returns<{
            user_id: string;
            role: string;
            auth_users: { email: string };
          }[]>();

        if (memberError) throw memberError;

        setMembers(memberData || []);
      } catch (err) {
        console.error('Error fetching group details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading group...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{group?.group_name}</Text>
      <Text style={styles.subtitle}>Members:</Text>

      <FlatList
        data={members}
        keyExtractor={(item) => item.user_id}
        renderItem={({ item }) => (
          <View style={styles.memberItem}>
            <Text style={styles.memberName}>
              {item.auth_users?.email || 'Unknown user'}
            </Text>
            <Text style={styles.role}>{item.role}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No members found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 18, marginBottom: 12 },
  memberItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  memberName: { fontSize: 16 },
  role: { fontSize: 14, color: 'gray' },
});
