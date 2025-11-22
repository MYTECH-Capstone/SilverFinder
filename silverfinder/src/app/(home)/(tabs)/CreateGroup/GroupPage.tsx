import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
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
      if (!user) return;

      try {
        // 1. Verify membership
        const { data: membership } = await supabase
          .from('group_members')
          .select('*')
          .eq('user_id', user.id)
          .eq('group_id', groupId)
          .single();

        if (!membership) {
          Alert.alert('Access Denied', "You don't belong to this group.");
          setLoading(false);
          return;
        }

        // 2. Fetch group info
        const { data: groupData, error: groupError } = await supabase
          .from('home_groups')
          .select('*')
          .eq('id', groupId)
          .single();

        if (groupError) throw groupError;
        setGroup(groupData);

        // 3. Fetch members
        const { data: memberData, error: memberError } = await supabase
          .from('group_members')
          .select('user_id, role')
          .eq('group_id', groupId);

        if (memberError) throw memberError;

        if (!memberData || memberData.length === 0) {
          setMembers([]);
          return;
        }

        // 4. Fetch usernames
        const userIds = memberData.map((m) => m.user_id);
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds);

        // 5. Combine members with usernames
        const membersWithUsernames = memberData.map((member) => {
          const profile = profileData.find((p) => p.id === member.user_id);
          return {
            ...member,
            username: profile ? profile.username : 'Unknown',
          };
        });

        setMembers(membersWithUsernames);
      } catch (err) {
        console.error('Error fetching group details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId, user]);

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
            <Text style={styles.memberName}>{item.username}</Text>
            <Text style={styles.role}>{item.role}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No members found.</Text>}
        
      />

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#ffd8a8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 18, marginBottom: 12 },
  memberItem: {
    backgroundColor: '#ffa826a7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,     
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  memberName: { fontSize: 18, fontWeight: '600', color: '333', marginBottom: 4 },
  role: { fontSize: 14, color: 'gray' },
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
});

/*import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
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
    if (!groupId || !user) return;

    const fetchGroup = async () => {
      try {
        // Ensure user belongs to the group
        const { data: membership, error: membershipError } = await supabase
          .from('group_members')
          .select('*')
          .eq('user_id', user.id)
          .eq('group_id', groupId)
          .single();

        if (membershipError || !membership) {
          Alert.alert('Access Denied', `You don't belong to this group.`);

          setLoading(false);
          return;
        }

        // Fetch group info
        const { data: groupData, error: groupError } = await supabase
          .from('home_groups')
          .select('*')
          .eq('id', groupId)
          .single();
        if (groupError) throw groupError;
        setGroup(groupData);

        // Fetch members
        const { data: memberData, error: memberError } = await supabase
          .from('group_members')
          .select('user_id, role')
          .eq('group_id', groupId);
        if (memberError) throw memberError;

        if (!memberData) {
          setMembers([]);
          return;
        }

        const userIds = memberData.map((m) => m.user_id);
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds);

        const membersWithUsernames = memberData.map((m) => ({
          ...m,
          username: profileData?.find((p) => p.id === m.user_id)?.username || 'Unknown',
        }));

        setMembers(membersWithUsernames);
      } catch (err) {
        console.error('Error fetching group:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId, user]);

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
            <Text style={styles.memberName}>{item.username}</Text>
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
  memberItem: { paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee' },
  memberName: { fontSize: 16, fontWeight: '500' },
  role: { fontSize: 14, color: 'gray' },
});


/*import React, { useEffect, useState } from 'react';
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
        // Dsiplay fetched group ID
        console.log('DEBUG groupId:', groupId);

        // Fetch the group info
        const { data: groupData, error: groupError } = await supabase
          .from('home_groups')
          .select('*')
          .eq('id', groupId)
          .single();

        if (groupError) throw groupError;
        setGroup(groupData);

        //  Fetch the members from group_members
        const { data: memberData, error: memberError } = await supabase
          .from('group_members')
          .select('user_id, role')
          .eq('group_id', groupId);

        if (memberError) throw memberError;
        if (!memberData || memberData.length === 0) {
          setMembers([]);
          return;
        }

        // Get the list of user_ids
        const userIds = memberData.map((m) => m.user_id);

        // Fetch usernames from profiles - CAN CHANGE TO FULLNAME if needed
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds);

        if (profileError) throw profileError;

        // Combine members with their usernames
        const membersWithUsernames = memberData.map((member) => {
          const profile = profileData.find((p) => p.id === member.user_id);
          return {
            ...member,
            username: profile ? profile.username : 'Unknown', // If not known put unknown
          };
        });

        setMembers(membersWithUsernames);
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
            <Text style={styles.memberName}>{item.username}</Text>
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
  memberName: { fontSize: 16, fontWeight: '500' },
  role: { fontSize: 14, color: 'gray' },
});

*/