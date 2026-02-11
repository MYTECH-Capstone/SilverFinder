import { useEffect, useState } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { supabase } from "../../../../../lib/supabase";
import AddTimelineEvent from "../../../../../components/AddTimelineEvent";
import { useAuth } from "../../../../../providers/AuthProvider";
import { OverlayProvider } from "stream-chat-expo";

//  Config

const EDITABLE_TYPES = ["spotted", "contacted", "custom"];
const LOCKED_TYPES = ["missing", "found", "police_contacted"];

const ICONS: Record<string, any> = {
  missing: "report",
  found: "check-circle",
  police_contacted: "local-police",
  spotted: "visibility",
  contacted: "phone",
  custom: "edit",
};

const COLORS: Record<string, string> = {
  missing: "#dc2626",
  found: "#16a34a",
  police_contacted: "#2563eb",
  spotted: "#d97706",
  contacted: "#7c3aed",
  custom: "#374151",
};

//  Types

type TimelineEvent = {
  id: string;
  user_id: string;
  group_id: string;
  type: string;
  label: string;
  details: string | null;
  created_at: string;
};

type TimelineAudit = {
  id: string;
  timeline_event_id: string;
  group_id: string;
  actor_user_id: string | null;
  action: "insert" | "update" | "delete";
  old_data: any | null;
  new_data: any | null;
  created_at: string;
};

//  Screen

export default function TimelineScreen() {
  const { groupId, groupName } = useLocalSearchParams();
  const { user } = useAuth();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [auditLog, setAuditLog] = useState<TimelineAudit[]>([]);
  //  Initial fetch

  useEffect(() => {
    fetchEvents();
    fetchAuditLog();
  }, []);

  async function fetchEvents() {
    const { data, error } = await supabase
      .from("timeline_events")
      .select("*")
      .eq("group_id", groupId as string as string)
      .order("created_at", { ascending: false });

    if (error) {
      Alert.alert("Error loading timeline");
      return;
    }

    setEvents(data ?? []);
  }

  async function fetchAuditLog() {
    const { data } = await supabase
      .from("timeline_event_audit")
      .select("*")
      .eq("group_id", groupId as string)
      .order("created_at", { ascending: false })
      .limit(50);

    setAuditLog(data ?? []);
  }

  //  timeline

  useEffect(() => {
    const channel = supabase
      .channel("timeline-events")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "timeline_events",
          filter: `group_id=eq.${groupId as string}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setEvents((prev) => [payload.new as TimelineEvent, ...prev]);
          }

          if (payload.eventType === "UPDATE") {
            setEvents((prev) =>
              prev.map((e) =>
                e.id === payload.new.id ? (payload.new as TimelineEvent) : e,
              ),
            );
          }

          if (payload.eventType === "DELETE") {
            setEvents((prev) => prev.filter((e) => e.id !== payload.old.id));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId as string]);

  //  audit

  useEffect(() => {
    const auditChannel = supabase
      .channel("timeline-audit")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "timeline_event_audit",
          filter: `group_id=eq.${groupId as string}`,
        },
        (payload) => {
          setAuditLog((prev) => [payload.new as TimelineAudit, ...prev]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(auditChannel);
    };
  }, [groupId as string]);

  // update
  async function updateDetails(id: string, details: string) {
    if (!details.trim()) return;

    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, details } : e)));

    const { error } = await supabase
      .from("timeline_events")
      .update({ details })
      .eq("id", id);

    if (error) {
      Alert.alert("Failed to save update");
    }
  }

  // undo
  async function undoLastEdit(audit: TimelineAudit) {
    if (!audit.old_data) return;

    await supabase
      .from("timeline_events")
      .update({
        details: audit.old_data.details,
      })
      .eq("id", audit.timeline_event_id);
  }

  // render
  return (
    <OverlayProvider>
      <Stack.Screen
        options={{
          title: (groupName as string) || "Timeline",
          headerBackTitle: "Back",
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TimelineItem event={item} onUpdate={updateDetails} />
          )}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<EmptyTimeline />}
          // ListFooterComponent={
          //   <AuditLog auditLog={auditLog} onUndo={undoLastEdit} />
          // }
        />
        <AddTimelineEvent group_ID={groupId as string} userId={user.id} />
      </KeyboardAvoidingView>
    </OverlayProvider>
  );
}

// timeline items
function TimelineItem({
  event,
  onUpdate,
}: {
  event: TimelineEvent;
  onUpdate: (id: string, details: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(event.details ?? "");

  const isEditable =
    EDITABLE_TYPES.includes(event.type) && !LOCKED_TYPES.includes(event.type);

  function save() {
    setEditing(false);
    if (value !== event.details) {
      onUpdate(event.id, value);
    }
  }

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <MaterialIcons
          name={ICONS[event.type]}
          size={24}
          color={COLORS[event.type]}
        />
        <View style={styles.line} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>{event.label}</Text>

        {isEditable && editing ? (
          <TextInput
            value={value}
            onChangeText={setValue}
            autoFocus
            multiline
            onBlur={save}
            blurOnSubmit
            onSubmitEditing={Platform.OS === "ios" ? save : undefined}
            style={styles.input}
          />
        ) : (
          <Pressable
            disabled={!isEditable}
            onPress={() => isEditable && setEditing(true)}
          >
            <Text
              style={[
                styles.details,
                { color: isEditable ? "#2563eb" : "#374151" },
              ]}
            >
              {event.details || (isEditable ? "Tap to add details…" : "")}
            </Text>
          </Pressable>
        )}

        <Text style={styles.time}>
          {new Date(event.created_at).toLocaleString()}
        </Text>
      </View>
    </View>
  );
}

function EmptyTimeline() {
  return (
    <View style={{ padding: 32, alignItems: "center" }}>
      <MaterialIcons name="timeline" size={48} color="#9ca3af" />
      <Text
        style={{
          marginTop: 12,
          fontSize: 16,
          fontWeight: "600",
          color: "#374151",
        }}
      >
        No updates yet
      </Text>
      <Text
        style={{
          marginTop: 6,
          fontSize: 14,
          color: "#6b7280",
          textAlign: "center",
        }}
      >
        Timeline updates will appear here as they’re added.
      </Text>
    </View>
  );
}

//  Audit Log

function AuditLog({
  auditLog,
  onUndo,
}: {
  auditLog: TimelineAudit[];
  onUndo: (audit: TimelineAudit) => void;
}) {
  return (
    <View style={styles.audit}>
      <Text style={styles.auditTitle}>Activity</Text>

      {auditLog.slice(0, 10).map((a) => (
        <View key={a.id} style={styles.auditRow}>
          <Text style={styles.auditText}>{formatAuditEntry(a)}</Text>

          {a.action === "update" && a.old_data && (
            <Pressable onPress={() => onUndo(a)}>
              <Text style={styles.undo}>Undo</Text>
            </Pressable>
          )}

          <Text style={styles.auditTime}>
            {new Date(a.created_at).toLocaleString()}
          </Text>
        </View>
      ))}
    </View>
  );
}

function formatAuditEntry(a: TimelineAudit) {
  const actor = a.actor_user_id ? a.actor_user_id.slice(0, 6) : "System";

  if (a.action === "insert") return `${actor} added an event`;
  if (a.action === "update") return `${actor} edited an event`;
  if (a.action === "delete") return `${actor} deleted an event`;

  return "";
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingVertical: 12,
  },
  left: {
    width: 36,
    alignItems: "center",
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: "#e5e7eb",
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingLeft: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  details: {
    marginTop: 4,
    fontSize: 15,
  },
  input: {
    marginTop: 4,
    fontSize: 15,
    borderBottomWidth: 1,
    borderColor: "#2563eb",
    paddingVertical: 4,
  },
  time: {
    marginTop: 4,
    fontSize: 12,
    color: "#6b7280",
  },
  audit: {
    marginTop: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
  },
  auditTitle: {
    fontWeight: "700",
    marginBottom: 8,
  },
  auditRow: {
    marginBottom: 8,
  },
  auditText: {
    fontSize: 13,
    color: "#374151",
  },
  auditTime: {
    fontSize: 11,
    color: "#6b7280",
  },
  undo: {
    fontSize: 12,
    color: "#2563eb",
    marginTop: 2,
  },
});
