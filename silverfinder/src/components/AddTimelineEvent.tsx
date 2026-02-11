import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Modal,
} from "react-native";
import { supabase } from "../lib/supabase";

type AddTimelineEventProps = {
  group_ID: any;
  userId: string;
  onEventAdded?: () => void; // optional callback
};

const EVENT_TYPES = [
  { value: "missing", label: "Report Missing" },
  { value: "found", label: "Found" },
  { value: "police_contacted", label: "Police Contacted" },
  { value: "spotted", label: "Spotted At..." },
  { value: "contacted", label: "Contacted..." },
  { value: "custom", label: "Custom" },
];

export default function AddTimelineEvent({
  group_ID,
  userId,
  onEventAdded,
}: AddTimelineEventProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [type, setType] = useState<string>("missing");
  const [label, setLabel] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  if (!group_ID) {
    group_ID = "none";
  }
  console.log(group_ID);
  function openModal(defaultType: string = "missing") {
    setType(defaultType);
    setLabel(EVENT_TYPES.find((e) => e.value === defaultType)?.label ?? "");
    setDetails("");
    setModalVisible(true);
  }

  async function submitEvent() {
    if (!type || !label.trim()) {
      Alert.alert("Label is required");
      return;
    }

    const { error } = await supabase.from("timeline_events").insert([
      {
        group_id: group_ID,
        user_id: userId,
        type,
        label,
        details: details || null,
      },
    ]);

    if (error) {
      Alert.alert("Failed to add timeline event", error.message);
    } else {
      setModalVisible(false);
      onEventAdded?.();
    }
  }

  return (
    <View>
      <Pressable style={styles.button} onPress={() => openModal("missing")}>
        <Text style={styles.buttonText}>Report Missing</Text>
      </Pressable>

      <Pressable
        style={[styles.button, { backgroundColor: "#2563eb" }]}
        onPress={() => openModal("custom")}
      >
        <Text style={styles.buttonText}>Add Timeline Event</Text>
      </Pressable>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Timeline Event</Text>

            {/* Type selector */}
            <View style={{ marginBottom: 12 }}>
              {EVENT_TYPES.map((e) => (
                <Pressable
                  key={e.value}
                  style={[
                    styles.typeButton,
                    type === e.value && styles.typeButtonSelected,
                  ]}
                  onPress={() => {
                    setType(e.value);
                    setLabel(e.label);
                  }}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      type === e.value && { fontWeight: "700" },
                    ]}
                  >
                    {e.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Label input */}
            <TextInput
              value={label}
              onChangeText={setLabel}
              placeholder="Event label"
              style={styles.input}
            />

            {/* Details input */}
            <TextInput
              value={details}
              onChangeText={setDetails}
              placeholder="Optional details"
              style={[styles.input, { height: 80 }]}
              multiline
            />

            {/* Actions */}
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Pressable
                onPress={() => setModalVisible(false)}
                style={[
                  styles.button,
                  { backgroundColor: "#9ca3af", flex: 1, marginRight: 8 },
                ]}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={submitEvent}
                style={[styles.button, { flex: 1 }]}
              >
                <Text style={styles.buttonText}>Add</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

//  Styles

const styles = StyleSheet.create({
  button: {
    padding: 12,
    backgroundColor: "#dc2626",
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    padding: 16,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
    fontSize: 15,
  },
  typeButton: {
    padding: 8,
    borderRadius: 6,
    marginBottom: 4,
    backgroundColor: "#f3f4f6",
  },
  typeButtonSelected: {
    backgroundColor: "#2563eb",
  },
  typeButtonText: {
    color: "#111827",
  },
});
