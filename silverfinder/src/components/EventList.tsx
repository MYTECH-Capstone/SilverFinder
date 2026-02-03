import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

export function EventsList({ selectedDate, events, onDeleteEvent }) {
  const hexToRgba = (hex, alpha = 0.15) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(_, i) => i.toString()}
        ListEmptyComponent={
          <Text style={styles.empty}>No events for this date.</Text>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.eventBox,
              {
                borderLeftColor: item.color,
                backgroundColor: hexToRgba(item.color),
              },
            ]}
          >
            <View style={styles.headerRow}>
              <Text style={[styles.title, { color: item.color }]}>
                {item.subject}
              </Text>

              <Text style={[styles.category, { color: item.color }]}>
                {item.category}
              </Text>
            </View>

            <Text style={styles.value}>{item.time || "No time"}</Text>
            <Text style={styles.value}>{item.location || "No location"}</Text>
            {item.memo && <Text style={styles.memo}>{item.memo}</Text>}

            <TouchableOpacity
              disabled={!!item.isDeviceEvent}
              style={[
                styles.deleteButton,
                item.isDeviceEvent && { backgroundColor: "#ccc" },
              ]}
              onPress={() => onDeleteEvent(item)}
            >
              <Text style={styles.deleteText}>
                {item.isDeviceEvent ? "Device Event" : "Delete"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 14 },
  eventBox: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 5,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between" },
  title: { fontWeight: "700", fontSize: 18 },
  category: { fontSize: 14, fontStyle: "italic" },
  value: { fontSize: 16, color: "#555" },
  memo: { fontStyle: "italic", color: "#333", marginTop: 4 },
  deleteButton: {
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#ff4d4d",
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  deleteText: { color: "#fff", fontWeight: "700" },
  empty: { fontStyle: "italic", color: "#777" },
});
