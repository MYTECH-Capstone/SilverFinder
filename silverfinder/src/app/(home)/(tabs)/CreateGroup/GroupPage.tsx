import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
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
      {/* HEADER & TIMELINE BUTTON ONLY — does not affect layout */}
      <Stack.Screen
        options={{
          title: group?.group_name ?? "Group",
          headerRight: () => (
            <>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/(home)/(tabs)/CreateGroup/Chat",
                    params: { groupId: group.id, groupName: group.group_name },
                  })
                }
                style={{ marginRight: 12 }}
              >
                <AntDesign name="message" size={24} color="black" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/(home)/(tabs)/CreateGroup/Timeline",
                    params: { groupId: group.id, groupName: group.group_name },
                  })
                }
                style={{ marginRight: 12 }}
              >
                <AntDesign name="alert" size={24} color="red" />
              </TouchableOpacity>
            </>
          ),
        }}
      />

      <View style={styles.container}>
        <Text style={styles.title}>{group?.group_name}</Text>
        <ReportMissingButton />
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

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#ffd8a8" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 18, marginBottom: 12 },
  memberItem: {
    backgroundColor: "#ffa826a7",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  memberName: {
    fontSize: 18,
    fontWeight: "600",
    color: "333",
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
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
