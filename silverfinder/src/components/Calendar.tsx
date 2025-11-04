import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Calendar, toDateId } from "@marceloterreiro/flash-calendar";
import { CalendarTheme } from "@marceloterreiro/flash-calendar";
import {
  addMonths,
  subMonths,
  parseISO,
  format,
  lastDayOfMonth,
} from "date-fns";

const linearAccent = "#f89f2bff";

const linearTheme: CalendarTheme = {
  rowMonth: { content: { fontSize: 0, display: "none" } },
  rowWeek: {
    container: {
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255, 255, 255, 0.1)",
      borderStyle: "solid",
    },
  },
  itemWeekName: { content: { color: "#f89f2bff" } },
  itemDayContainer: { activeDayFiller: { backgroundColor: linearAccent } },
  itemDay: {
    idle: ({ isPressed, isWeekend }) => ({
      container: {
        backgroundColor: isPressed ? linearAccent : "transparent",
        borderRadius: 4,
      },
      content: { color: isWeekend && !isPressed ? "#fdbb65ff" : "#f89f2bff" },
    }),
    today: ({ isPressed }) => ({
      container: {
        borderColor: "rgba(255, 255, 255, 0.5)",
        borderRadius: isPressed ? 4 : 30,
        backgroundColor: isPressed ? linearAccent : "transparent",
      },
      content: { color: isPressed ? "#fdbb65ff" : "#6589ff" },
    }),
    active: ({ isEndOfRange, isStartOfRange }) => ({
      container: {
        backgroundColor: linearAccent,
        borderTopLeftRadius: isStartOfRange ? 4 : 0,
        borderBottomLeftRadius: isStartOfRange ? 4 : 0,
        borderTopRightRadius: isEndOfRange ? 4 : 0,
        borderBottomRightRadius: isEndOfRange ? 4 : 0,
      },
      content: { color: "#ffffff" },
    }),
  },
};

export function BasicCalendar({
  selectedDate,
  onSelectDate,
}: {
  selectedDate: string;
  onSelectDate: (dateId: string) => void;
}) {
  const today = new Date();
  const selected = parseISO(selectedDate);
  const [currentMonth, setCurrentMonth] = useState(selected);

  useEffect(() => {
    setCurrentMonth(selected);
  }, [selectedDate]);

  const changeMonth = (delta: number) => {
    const targetMonth =
      delta > 0
        ? addMonths(currentMonth, delta)
        : subMonths(currentMonth, -delta);
    const lastDay = lastDayOfMonth(targetMonth).getDate();
    const dayToKeep = Math.min(selected.getDate(), lastDay);
    setCurrentMonth(
      new Date(targetMonth.getFullYear(), targetMonth.getMonth(), dayToKeep)
    );
  };

  const goToToday = () => {
    setCurrentMonth(today);
    onSelectDate(toDateId(today));
  };

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.monthText}>
          {format(currentMonth, "MMMM yyyy")}
        </Text>

        <View style={styles.arrowsContainer}>
          <TouchableOpacity onPress={goToToday} style={styles.arrowButton}>
            <Text style={styles.arrowText}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => changeMonth(-1)}
            style={styles.arrowButton}
          >
            <Text style={styles.arrowText}>{"<"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => changeMonth(1)}
            style={styles.arrowButton}
          >
            <Text style={styles.arrowText}>{">"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Calendar
        calendarActiveDateRanges={[
          { startId: selectedDate, endId: selectedDate },
        ]}
        calendarMonthId={toDateId(currentMonth)}
        onCalendarDayPress={onSelectDate}
        theme={linearTheme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  arrowsContainer: {
    flexDirection: "row",
    gap: 5,
  },
  arrowButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: linearAccent,
    borderRadius: 6,
  },
  arrowText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  monthText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff5f15",
  },
});
