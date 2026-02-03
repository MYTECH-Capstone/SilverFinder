// CalendarShare.tsx
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { supabase } from "../lib/supabase";

type Member = {
  user_id: string;
  username: string;
  role: string;
};

type Group = {
  group_id: string;
  group_name: string;
  members: Member[];
  expanded: boolean;
};

type CalendarShareProps = {
  currentUserId: string;
};

export function CalendarShare({ currentUserId }: CalendarShareProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroupsAndMembers = async () => {
      if (!currentUserId) return;

      try {
        const { data: memberships } = await supabase
          .from("group_members")
          .select("group_id")
          .eq("user_id", currentUserId);

        if (!memberships || memberships.length === 0) {
          setGroups([]);
          return;
        }

        const groupIds = [...new Set(memberships.map((m) => m.group_id))];

        const { data: groupMembers } = await supabase
          .from("group_members")
          .select("user_id, role, group_id")
          .in("group_id", groupIds);

        const userIds = [...new Set(groupMembers.map((m) => m.user_id))];

        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", userIds);

        const { data: groupData } = await supabase
          .from("home_groups")
          .select("id, group_name")
          .in("id", groupIds);

        const grouped: Group[] = groupIds.map((gid) => {
          const gMembers = groupMembers
            .filter((m) => m.group_id === gid)
            .map((m) => ({
              user_id: m.user_id,
              role: m.role,
              username:
                profiles?.find((p) => p.id === m.user_id)?.username ??
                "Unknown",
            }))
            // <-- filter out current user here
            .filter((m) => m.user_id !== currentUserId);

          return {
            group_id: gid,
            group_name:
              groupData?.find((g) => g.id === gid)?.group_name ?? "Unknown",
            members: gMembers,
            expanded: true,
          };
        });

        setGroups(grouped);
      } catch (err) {
        console.error("Failed to fetch groups and members:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupsAndMembers();
  }, [currentUserId]);

  const toggleSelectMember = (userId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleGroupExpand = (groupId: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.group_id === groupId ? { ...g, expanded: !g.expanded } : g
      )
    );
  };

  const handleShare = () => {
    if (selectedMemberIds.length === 0) {
      Alert.alert("Select at least one member first");
      return;
    }
    Alert.alert(
      "Calendar shared!",
      `Shared with user IDs: ${selectedMemberIds.join(", ")}`
    );
  };

  if (loading) return <Text>Loading groups...</Text>;
  if (groups.length === 0) return <Text>No groups found</Text>;

  return (
    <View style={styles.container}>
      {groups.map((group) => (
        <View key={group.group_id} style={styles.groupContainer}>
          <TouchableOpacity
            style={styles.groupHeader}
            onPress={() => toggleGroupExpand(group.group_id)}
          >
            <Text style={styles.groupTitle}>{group.group_name}</Text>
            <Text>{group.expanded ? "▲" : "▼"}</Text>
          </TouchableOpacity>

          {group.expanded &&
            group.members.map((member) => {
              const selected = selectedMemberIds.includes(member.user_id);
              return (
                <TouchableOpacity
                  key={`${group.group_id}-${member.user_id}`}
                  style={[styles.memberButton, selected && styles.selected]}
                  onPress={() => toggleSelectMember(member.user_id)}
                >
                  <Text
                    style={[styles.memberText, selected && { color: "#fff" }]}
                  >
                    {member.username} ({member.role})
                  </Text>
                </TouchableOpacity>
              );
            })}
        </View>
      ))}

      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Text style={styles.shareButtonText}>Share Calendar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10 },
  groupContainer: { marginBottom: 12 },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#ffd8a8",
    padding: 10,
    borderRadius: 8,
  },
  groupTitle: { fontWeight: "bold", fontSize: 16 },
  memberButton: {
    padding: 10,
    backgroundColor: "#eee",
    borderRadius: 8,
    marginVertical: 4,
    marginLeft: 10,
  },
  selected: { backgroundColor: "#3498db" },
  memberText: { color: "#000" },
  shareButton: {
    marginTop: 10,
    backgroundColor: "#ff5f15",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  shareButtonText: { color: "#fff", fontWeight: "bold" },
});
