import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { router, useLocalSearchParams, Stack } from "expo-router";
import { supabase } from "../../../../lib/supabase";
import { useAuth } from "../../../../providers/AuthProvider";
import AntDesign from "@expo/vector-icons/AntDesign";
import ReportMissingButton from "../../../../components/ReportMissingButton";

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
          .from("group_members")
          .select("*")
          .eq("user_id", user.id)
          .eq("group_id", groupId)
          .maybeSingle();

        if (!membership) {
          Alert.alert("Access Denied", "You don't belong to this group.");
          setLoading(false);
          return;
        }

        // 2. Load group info
        const { data: groupData, error: groupError } = await supabase
          .from("home_groups")
          .select("*")
          .eq("id", groupId)
          .single();

        if (groupError) throw groupError;

        setGroup(groupData);

        // 3. Get group members
        const { data: mData, error: mErr } = await supabase
          .from("group_members")
          .select("user_id, role")
          .eq("group_id", groupId);

        if (mErr) throw mErr;

        const userIds = mData.map((m) => m.user_id);

        // 4. Fetch usernames
        const { data: pData } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", userIds);

        const combined = mData.map((m) => ({
          ...m,
          username:
            pData.find((p) => p.id === m.user_id)?.username ?? "Unknown",
        }));

        setMembers(combined);
      } catch (err) {
        console.error("Error fetching group:", err);
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
    <>
      <Stack.Screen
        options={{
          title: group?.group_name ?? "Group",
          headerRight: () => (
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                onPress={() => router.push({
                  pathname: "/(home)/(tabs)/CreateGroup/Chat",
                  params: { groupId: group.id, groupName: group.group_name },
                })}
                style={{ marginRight: 12 }}
              >
                <AntDesign name="message" size={24} color="black" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push({
                  pathname: "/(home)/(tabs)/CreateGroup/Timeline",
                  params: { groupId: group.id, groupName: group.group_name },
                })}
                style={{ marginRight: 12 }}
              >
                <AntDesign name="alert" size={24} color="red" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <ReportMissingButton />

        <Text style={styles.title}>{group?.group_name}</Text>
        
        <View style={styles.subtitleRow}>
          <Text style={styles.subtitle}>Members </Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{members.length}</Text>
          </View>
        </View>

        <FlatList
          data={members}
          keyExtractor={(item) => item.user_id}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View style={styles.memberItem}>
              <View style={styles.memberInfo}>
                <View style={styles.nameContainer}>
                  <Text style={styles.memberName}>{item.username}</Text>
                </View>
                <View style={[
                  styles.roleBadge, 
                  item.role === 'admin' ? styles.adminBadge : styles.memberBadge
                ]}>
                  <Text style={[
                    styles.roleBadgeText, 
                    item.role === 'admin' ? styles.adminText : styles.memberText
                  ]}>
                    {item.role}
                  </Text>
                </View>
              </View>
            </View>
            
          )}
        />
        <TouchableOpacity 
          style={styles.stickyFooter} 
          onPress={() => router.back()}
          >
          <Text style={styles.backBtn}>Back</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff8f3" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 18, fontWeight: '600', },
  subtitleRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 15,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 14,
    borderColor: "#f0d5be",
    borderWidth: 1.5,
    marginBottom: 12,
    shadowColor: "#e85d04",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  memberInfo: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10 
  },
  memberName: {
    fontSize: 18,
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  role: { fontSize: 14, color: "gray" },
  backButton: {
    marginTop: 20,
    backgroundColor: "#f65e0cff",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  adminBadge: { backgroundColor: '#e85d04', borderColor: '#e85d04' },
  adminText: { color: '#ffffff' },
  memberBadge: { backgroundColor: '#f0d5be1a', borderColor: '#f0d5be' },
  memberText: { color: '#7a5c45' },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  countBadge: {
    backgroundColor: '#e85d04',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0d5be'
  },
  countText: { 
    color: '#ffffff', 
    fontWeight: 'bold', 
    fontSize: 12 ,
  },
  nameContainer: {
    flex: 1,
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
  stickyFooter: {
    position: 'absolute',
    bottom: 15, 
    left: 60,
    right: 30,
    paddingVertical: 50,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
});
