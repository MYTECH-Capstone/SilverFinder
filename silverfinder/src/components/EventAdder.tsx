import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { parse, isValid, format } from "date-fns";
import { toDateId } from "@marceloterreiro/flash-calendar";
import { saveToDeviceCalendar } from "./calService";

const CATEGORY_COLORS = {
  Family: "#3498db",
  Friends: "#e74c3c",
  Medical: "#f39c12",
  Other: "#27ae60",
};

export function EventAdder({ onAddEvent, selectedDate }) {
  const [step, setStep] = useState("category");
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [memo, setMemo] = useState("");

  const handleSelectCategory = (cat) => {
    setCategory(cat);
    setStep("form");
  };

  const persistEvent = async (event) => {
    try {
      const storedEvents = await AsyncStorage.getItem("events");
      let eventsObj = storedEvents ? JSON.parse(storedEvents) : {};
      const dateId = event.date;
      eventsObj[dateId] = [...(eventsObj[dateId] || []), event];
      await AsyncStorage.setItem("events", JSON.stringify(eventsObj));
    } catch (err) {
      console.log("Failed to persist events:", err);
    }
  };

  const handleAdd = async () => {
    if (!subject.trim()) return;

    const color = CATEGORY_COLORS[category] || "#ccc";

    // Parse date
    let parsedDate: Date | null = null;
    const currentYear = new Date().getFullYear();
    const dateFormats = [
      "yyyy-MM-dd",
      "MM/dd/yyyy",
      "M/d/yyyy",
      "MMM d yyyy",
      "MMMM d yyyy",
      "dd/MM/yyyy",
      "d/M/yyyy",
      "MM/dd",
      "M/d",
    ];

    for (const fmt of dateFormats) {
      let d;
      if (fmt === "MM/dd" || fmt === "M/d") {
        d = parse(`${dateInput}/${currentYear}`, `${fmt}/yyyy`, new Date());
      } else {
        d = parse(dateInput, fmt, new Date());
      }
      if (isValid(d)) {
        parsedDate = d;
        break;
      }
    }

    if (!parsedDate) {
      const [y, m, d] = selectedDate.split("-").map(Number);
      parsedDate = new Date(y, m - 1, d);
    }

    const dateId = toDateId(parsedDate);

    // Parse time safely
    let eventStart: Date;
    let eventEnd: Date;
    try {
      if (time.trim()) {
        const timeParsed = parse(time, "hh:mm a", parsedDate);
        if (!isValid(timeParsed)) throw new RangeError();
        eventStart = timeParsed;
        eventEnd = new Date(eventStart.getTime() + 60 * 60 * 1000);
      } else {
        throw new RangeError();
      }
    } catch {
      Alert.alert(
        "Invalid time",
        "Event will be saved as all-day because the time entered is invalid."
      );
      eventStart = new Date(parsedDate.setHours(0, 0, 0, 0));
      eventEnd = new Date(parsedDate.setHours(23, 59, 59, 999));
    }

    const newEvent = {
      subject,
      date: dateId,
      time: time.trim() ? format(eventStart, "hh:mm a") : "",
      location,
      category,
      color,
      memo: memo.trim() || undefined,
    };

    // Save to device calendar
    await saveToDeviceCalendar({
      ...newEvent,
      startDate: eventStart,
      endDate: eventEnd,
    });

    // Persist locally
    await persistEvent(newEvent);

    // Notify parent
    onAddEvent(newEvent);

    // Reset form
    setStep("category");
    setSubject("");
    setDateInput("");
    setTime("");
    setLocation("");
    setMemo("");
    setCategory("");
  };

  if (step === "category") {
    return (
      <View>
        <Text style={[styles.sectionTitle, { color: "#ff5f15" }]}>
          Add New Event
        </Text>
        <View style={styles.infoSection}>
          <View style={styles.grid}>
            {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
              <TouchableOpacity
                key={cat}
                style={[styles.descriptorBox, { backgroundColor: color }]}
                onPress={() => handleSelectCategory(cat)}
              >
                <Text style={styles.descrLabel}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  }

  const themeColor = CATEGORY_COLORS[category] || "#f89f2b";

  return (
    <View style={styles.infoSection}>
      <Text style={[styles.sectionTitle, { color: themeColor }]}>
        Add {category} Event
      </Text>
      <Text style={[styles.label, { color: themeColor }]}>Subject</Text>
      <TextInput
        style={styles.input}
        value={subject}
        onChangeText={setSubject}
      />

      <Text style={[styles.label, { color: themeColor }]}>Date (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="11/4/2025"
        value={dateInput}
        onChangeText={setDateInput}
      />

      <Text style={[styles.label, { color: themeColor }]}>Time</Text>
      <TextInput
        style={styles.input}
        placeholder="10:30 AM"
        value={time}
        onChangeText={setTime}
      />

      <Text style={[styles.label, { color: themeColor }]}>Location</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
      />

      <Text style={[styles.label, { color: themeColor }]}>Memo</Text>
      <TextInput style={styles.input} value={memo} onChangeText={setMemo} />

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: themeColor }]}
        onPress={handleAdd}
      >
        <Text style={styles.addButtonText}>Save Event</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setStep("category")}
      >
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  infoSection: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  descriptorBox: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 6,
    width: "48%",
    alignItems: "center",
  },
  descrLabel: { color: "#fff", fontWeight: "600", fontSize: 16 },
  label: { fontWeight: "600", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  addButton: { borderRadius: 8, paddingVertical: 10, marginTop: 8 },
  addButtonText: { color: "#fff", fontWeight: "700", textAlign: "center" },
  backButton: { marginTop: 10, alignItems: "center" },
  backText: { color: "#888", textDecorationLine: "underline" },
});
