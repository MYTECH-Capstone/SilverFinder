import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

type Event = {
  subject: string;
  date: string;
  time: string;
  location: string;
  category: string;
  color: string;
  memo?: string;
};

export function EventsList({
  selectedDate,
  events,
  onDeleteEvent,
}: {
  selectedDate: string;
  events: Event[];
  onDeleteEvent: (event: Event) => void;
}) {
  const hexToRgba = (hex, alpha = 0.15) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };
  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>Events for {selectedDate}</Text> */}

      <FlatList
        data={events}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.descriptorBoxUpcoming,
              {
                borderLeftColor: item.color,
                backgroundColor: hexToRgba(item.color),
              },
            ]}
          >
            <View style={styles.headerRow}>
              <Text style={[styles.descrLabelUpcoming, { color: item.color }]}>
                {item.subject}
              </Text>
              <Text style={[styles.categoryLabel, { color: item.color }]}>
                {item.category}
              </Text>
            </View>
            <Text style={styles.value}>{item.date || "No date"}</Text>
            <Text style={styles.value}>{item.time || "No time"}</Text>
            <Text style={styles.value}>{item.location || "No location"}</Text>
            {item.memo ? <Text style={styles.memo}>{item.memo}</Text> : null}

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => onDeleteEvent(item)}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No events yet for this date.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  descriptorBoxUpcoming: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 5,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  descrLabelUpcoming: {
    fontWeight: "700",
    fontSize: 18,
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: "500",
    fontStyle: "italic",
  },
  value: {
    fontSize: 16,
    color: "#555",
  },
  memo: {
    fontStyle: "italic",
    color: "#333",
    marginTop: 4,
  },
  deleteButton: {
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#ff4d4d",
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  deleteText: {
    color: "#fff",
    fontWeight: "700",
  },
  empty: {
    fontStyle: "italic",
    color: "#999",
  },
});
