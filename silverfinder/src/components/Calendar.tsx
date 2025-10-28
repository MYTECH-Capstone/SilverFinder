import {
  Calendar,
  CalendarActiveDateRange,
  toDateId,
} from "@marceloterreiro/flash-calendar";
import { CalendarTheme } from "@marceloterreiro/flash-calendar";
import { useCallback, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { add, sub } from "date-fns";

const today = toDateId(new Date());

export function BasicCalendar() {
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date());

  const handlePreviousMonth = useCallback(() => {
    setCurrentCalendarMonth(sub(currentCalendarMonth, { months: 1 }));
  }, [currentCalendarMonth]);

  const handleNextMonth = useCallback(() => {
    setCurrentCalendarMonth(add(currentCalendarMonth, { months: 1 }));
  }, [currentCalendarMonth]);

  // const calendarActiveDateRanges = useMemo<CalendarActiveDateRange[]>(
  //   () => [
  //     {
  //       startId: toDateId(selectedDate),
  //       endId: toDateId(selectedDate),
  //     },
  //   ],
  //   [selectedDate]
  // );

  return (
    <View>
      <Calendar
        calendarActiveDateRanges={[
          {
            startId: selectedDate,
            endId: selectedDate,
          },
        ]}
        calendarMonthId={today}
        onCalendarDayPress={setSelectedDate}
        theme={linearTheme}
        // onNextMonthPress={handleNextMonth}
        // onPreviousMonthPress={handlePreviousMonth}
      />
    </View>
  );
}

const linearAccent = "#f89f2bff";

const linearTheme: CalendarTheme = {
  rowMonth: {
    content: {
      fontSize: 16,
      textAlign: "left",
      color: "#ff5f15",
      fontWeight: "700",
    },
  },
  rowWeek: {
    container: {
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255, 255, 255, 0.1)",
      borderStyle: "solid",
    },
  },
  itemWeekName: { content: { color: "#f89f2bff" } },
  itemDayContainer: {
    activeDayFiller: {
      backgroundColor: linearAccent,
    },
  },
  itemDay: {
    idle: ({ isPressed, isWeekend }) => ({
      container: {
        backgroundColor: isPressed ? linearAccent : "transparent",
        borderRadius: 4,
      },
      content: {
        color: isWeekend && !isPressed ? "#fdbb65ff" : "#f89f2bff",
      },
    }),
    today: ({ isPressed }) => ({
      container: {
        borderColor: "rgba(255, 255, 255, 0.5)",
        borderRadius: isPressed ? 4 : 30,
        backgroundColor: isPressed ? linearAccent : "transparent",
      },
      content: {
        color: isPressed ? "#fdbb65ff" : "#6589ff",
      },
    }),
    active: ({ isEndOfRange, isStartOfRange }) => ({
      container: {
        backgroundColor: linearAccent,
        borderTopLeftRadius: isStartOfRange ? 4 : 0,
        borderBottomLeftRadius: isStartOfRange ? 4 : 0,
        borderTopRightRadius: isEndOfRange ? 4 : 0,
        borderBottomRightRadius: isEndOfRange ? 4 : 0,
      },
      content: {
        color: "#ffffff",
      },
    }),
  },
};
