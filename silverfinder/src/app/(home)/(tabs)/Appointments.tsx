// Displays the appointment screen
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { BasicCalendar } from "../../../components/Calendar";
import { EventsList } from "../../../components/EventList";
import { useState } from "react";
import { toDateId } from "@marceloterreiro/flash-calendar";
import { EventAdder } from "../../../components/EventAdder";

type Event = {
  subject: string;
  date: string;
  time: string;
  location: string;
  category: string;
  color: string;
  memo?: string;
};

export default function MainTabScreen() {
  const [selectedDate, setSelectedDate] = useState(toDateId(new Date()));
  const [events, setEvents] = useState<{ [dateId: string]: Event[] }>({});
  const handleAddEvent = (newEvent) => {
    const targetDate = newEvent.date;
    setEvents((prev) => ({
      ...prev,
      [targetDate]: [...(prev[targetDate] || []), newEvent],
    }));
  };

  const handleDeleteEvent = (eventToDelete: Event) => {
    setEvents((prev) => {
      const dateId = eventToDelete.date;
      const updatedEvents =
        prev[dateId]?.filter((ev) => ev !== eventToDelete) || [];
      return {
        ...prev,
        [dateId]: updatedEvents,
      };
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#ffd8a8" }}>
      <ScrollView style={styles.container}>
        <TouchableOpacity style={styles.emergencyButton}>
          <Text style={styles.emergencyText}>
            Press this button if you need immediate help!
          </Text>
        </TouchableOpacity>

        <View style={styles.infoSection}>
          <EventAdder onAddEvent={handleAddEvent} selectedDate={selectedDate} />
        </View>

        <View style={styles.infoSection}>
          <View>
            <BasicCalendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </View>
        </View>

        <View style={[styles.infoSectionUpcoming, {}]}>
          <Text style={styles.sectionTitle}>Upcoming</Text>
          <EventsList
            selectedDate={selectedDate}
            events={events[selectedDate] || []}
            onDeleteEvent={handleDeleteEvent}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  disabled: {
    backgroundColor: "#f2f2f2",
  },
  button: {
    backgroundColor: "#3b82f6",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonSecondary: {
    backgroundColor: "#ef4444",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  emergencyButton: {
    backgroundColor: "red",
    padding: 20,
    borderRadius: 10,
    marginVertical: 20,
    width: "75%",
    alignSelf: "center",
  },
  emergencyText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 26,
    textAlign: "center",
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    color: "#ff5f15",
  },
  infoSection: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  infoSectionUpcoming: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#ff5f15",
  },
  editButton: {
    backgroundColor: "rgba(218, 144, 55, 1)",
    padding: 10,
    borderRadius: 8,
    alignSelf: "flex-end",
    marginTop: 20,
  },
  editText: {
    color: "white",
    fontWeight: "bold",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  gridUpcoming: {
    flexDirection: "column",
    justifyContent: "space-evenly",
  },
  descriptorBox: {
    backgroundColor: "transparent",
    borderColor: "#f89f2bff",
    borderWidth: 2,
    padding: 10,
    borderRadius: 4,
    flexBasis: 300,
    marginBottom: 5,
  },
  descriptorBoxUpcoming: {
    backgroundColor: "#f7c6afc4",
    padding: 17,
    borderRadius: 20,
    width: "100%",
    marginBottom: 5,
  },
  descrLabel: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  descrLabelUpcoming: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    color: "#555",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
});
