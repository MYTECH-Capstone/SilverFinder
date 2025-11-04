import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { parse, isValid } from "date-fns";
import { toDateId } from "@marceloterreiro/flash-calendar";

const CATEGORY_COLORS: Record<string, string> = {
  Family: "#3498db", // Blue
  Friends: "#e74c3c", // Red
  Medical: "#f39c12", // Orange
  Other: "#27ae60", // Green
};

type Props = {
  selectedDate: string;
  onAddEvent: (event: {
    subject: string;
    date: string;
    time: string;
    location: string;
    category: string;
    color: string;
    memo?: string;
  }) => void;
};

export function EventAdder({ onAddEvent, selectedDate }: Props) {
  const [step, setStep] = useState<"category" | "form">("category");
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [memo, setMemo] = useState("");

  const handleSelectCategory = (cat: string) => {
    setCategory(cat);
    setStep("form");
  };

  const handleAdd = () => {
    if (!subject.trim()) return;

    const color = CATEGORY_COLORS[category] || "#ccc";
    const input = dateInput.trim();
    let parsedDate: Date | null = null;
    const currentYear = new Date().getFullYear();

    const possibleFormats = [
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

    for (const fmt of possibleFormats) {
      let candidate: Date;
      if (fmt === "MM/dd" || fmt === "M/d") {
        candidate = parse(`${input}/${currentYear}`, `${fmt}/yyyy`, new Date());
      } else {
        candidate = parse(input, fmt, new Date());
      }

      if (isValid(candidate)) {
        parsedDate = candidate;
        break;
      }
    }

    // Fallback to selected calendar date
    if (!parsedDate) {
      const [year, month, day] = selectedDate.split("-").map(Number);
      parsedDate = new Date(year, month - 1, day);
    }

    const normalizedDateId = toDateId(parsedDate);

    onAddEvent({
      subject,
      date: normalizedDateId,
      time,
      location,
      category,
      color,
      memo: memo.trim() || undefined,
    });

    // Reset form
    setSubject("");
    setDateInput("");
    setTime("");
    setLocation("");
    setMemo("");
    setCategory("");
    setStep("category");
  };

  // Category selection
  if (step === "category") {
    return (
      <View>
        <Text
          style={[
            styles.sectionTitle,
            { color: "#ff5f15", margin: 0, fontWeight: "bold" },
          ]}
        >
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

  // Event form step
  const themeColor = CATEGORY_COLORS[category] || "#f89f2b";

  return (
    <View style={styles.infoSection}>
      <Text style={[styles.sectionTitle, { color: themeColor }]}>
        Add {category} Event
      </Text>

      <View style={[styles.descriptorBoxUpcoming, { borderColor: themeColor }]}>
        <Text style={[styles.descrLabelUpcoming, { color: themeColor }]}>
          Subject
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Subject"
          value={subject}
          onChangeText={setSubject}
        />

        <Text style={[styles.descrLabelUpcoming, { color: themeColor }]}>
          Date (optional)
        </Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 11/4/2025 or Nov 4 2025"
          value={dateInput}
          onChangeText={setDateInput}
        />

        <Text style={[styles.descrLabelUpcoming, { color: themeColor }]}>
          Time
        </Text>
        <TextInput
          style={styles.input}
          placeholder="XX:XX AM"
          value={time}
          onChangeText={setTime}
        />

        <Text style={[styles.descrLabelUpcoming, { color: themeColor }]}>
          Location
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Location"
          value={location}
          onChangeText={setLocation}
        />

        <Text style={[styles.descrLabelUpcoming, { color: themeColor }]}>
          Memo (optional)
        </Text>
        <TextInput
          style={styles.input}
          placeholder="notes"
          value={memo}
          onChangeText={setMemo}
        />

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
          <Text style={styles.backButtonText}>Back to Categories</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  infoSection: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
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
  descriptorBoxUpcoming: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  descrLabelUpcoming: {
    fontWeight: "600",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  addButton: {
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 8,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
  },
  backButton: { marginTop: 10, alignItems: "center" },
  backButtonText: { color: "#888", textDecorationLine: "underline" },
});
