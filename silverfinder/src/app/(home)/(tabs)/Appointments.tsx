import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { BasicCalendar } from "../../../components/Calendar";
import { EventsList } from "../../../components/EventList";
import { useState, useEffect } from "react";
import { toDateId } from "@marceloterreiro/flash-calendar";
import { EventAdder } from "../../../components/EventAdder";
import { fetchDeviceEvents } from "../../../components/calService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CalendarShare } from "../../../components/CalendarShare";
import { useAuth } from "../../../providers/AuthProvider";

type Event = {
  subject: string;
  date: string;
  time: string;
  location: string;
  category: string;
  color: string;
  memo?: string;
  isDeviceEvent?: boolean;
};

const STORAGE_KEY = "@local_events";

export default function MainTabScreen() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(toDateId(new Date()));
  const [events, setEvents] = useState<{ [dateId: string]: Event[] }>({});
  const [deviceEvents, setDeviceEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);

  useEffect(() => {
    const loadDeviceEvents = async () => {
      const start = new Date();
      start.setMonth(start.getMonth() - 1);
      const end = new Date();
      end.setMonth(end.getMonth() + 3);
      const fetched = await fetchDeviceEvents(start, end);
      setDeviceEvents(fetched);
    };
    loadDeviceEvents();
  }, []);

  useEffect(() => {
    const loadLocalEvents = async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) setEvents(JSON.parse(json));
      } catch (err) {
        console.error("Failed to load local events", err);
      }
    };
    loadLocalEvents();
  }, []);

  useEffect(() => {
    const saveLocalEvents = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
      } catch (err) {
        console.error("Failed to save local events", err);
      }
    };
    saveLocalEvents();
  }, [events]);

  useEffect(() => {
    const merged = [
      ...(events[selectedDate] || []),
      ...deviceEvents.filter((e) => e.date === selectedDate),
    ];
    setAllEvents(merged);
  }, [selectedDate, events, deviceEvents]);

  const handleAddEvent = (newEvent: Event) => {
    const targetDate = newEvent.date;
    setEvents((prev) => ({
      ...prev,
      [targetDate]: [...(prev[targetDate] || []), newEvent],
    }));
  };

  const handleDeleteEvent = (eventToDelete: Event) => {
    if (eventToDelete.isDeviceEvent) return;
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
          <BasicCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </View>

        <View style={[styles.infoSectionUpcoming]}>
          <Text style={styles.sectionTitle}>Upcoming</Text>
          <EventsList
            selectedDate={selectedDate}
            events={allEvents}
            onDeleteEvent={handleDeleteEvent}
          />
        </View>

        <View style={[styles.infoSectionUpcoming]}>
          {user?.id ? (
            <CalendarShare currentUserId={user.id} />
          ) : (
            <Text style={{ textAlign: "center", color: "#888" }}>
              No group found
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 40, padding: 12 },
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
});
