import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
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
import ReportMissingButton from "../../../components/ReportMissingButton";
import { requestCalendarPermissions } from "../../../components/calService";
import AntDesign from "@expo/vector-icons/AntDesign";

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
  const [calendarGranted, setCalendarGranted] = useState(false);
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(toDateId(new Date()));
  const [events, setEvents] = useState<{ [dateId: string]: Event[] }>({});
  const [deviceEvents, setDeviceEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);

  useEffect(() => {
    (async () => {
      const granted = await requestCalendarPermissions();
      setCalendarGranted(granted);
    })();
  }, []);
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
    <View style={{ flex: 1, backgroundColor: "#fff8f3" }}>
     <StatusBar barStyle="dark-content" /> 
     <ScrollView style={styles.container}>
     <View style={styles.topBar}>
             <View style={styles.topBarSpacer} />
             <Text style={styles.topBarTitle}>Appointments</Text>
             <View style={styles.topBarSpacer} />
           </View>
     
        
        <ReportMissingButton />

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
          <Text style={styles.sectionTitle}>Share Calendar</Text>
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
    borderColor: "#f0d5be",
    borderWidth: 2,
    shadowColor: "#e85d04",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  infoSectionUpcoming: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderColor: "#f0d5be",
    borderWidth: 2,
    shadowColor: "#e85d04",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 5,
    color: "#1a1a1a",
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1.5,
    borderColor: '#f0d5be',
  }, 
  topBarTitle: { 
    color: '#1a1a1a', 
    fontSize: 22, 
    fontWeight: '700' 
  },
  topBarSpacer: { 
    width: 50 ,
  }
});
