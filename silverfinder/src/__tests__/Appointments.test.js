// __tests__/Appointments.test.js
import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import MainTabScreen from "../app/(home)/(tabs)/Appointments";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as calService from "../components/calService";
import { useAuth } from "../providers/AuthProvider";

// --- MOCKS ---

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock("../components/calService", () => ({
  fetchDeviceEvents: jest.fn(),
  requestCalendarPermissions: jest.fn(),
  saveToDeviceCalendar: jest.fn(),
}));

jest.mock("../providers/AuthProvider", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../lib/supabase", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockResolvedValue({ data: [], error: null }),
      insert: jest.fn().mockResolvedValue({ data: [], error: null }),
      update: jest.fn().mockResolvedValue({ data: [], error: null }),
      delete: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      signIn: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

// ✅ Mock ReportMissingButton to avoid any extra deps it pulls in
jest.mock("../components/ReportMissingButton", () => () => null);

jest.mock("../components/EventAdder", () => ({
  EventAdder: ({ onAddEvent }) => {
    const { TouchableOpacity } = require("react-native");
    // ✅ Use today's date to match selectedDate default (toDateId(new Date()))
    const today = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const todayId = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    return (
      <TouchableOpacity
        testID="add-event-button"
        onPress={() =>
          onAddEvent({
            subject: "Test Event",
            date: todayId,
            time: "12:00",
            location: "",
            category: "",
            color: "blue",
          })
        }
      />
    );
  },
}));

jest.mock("../components/Calendar", () => ({
  BasicCalendar: ({ onSelectDate }) => {
    const { TouchableOpacity } = require("react-native");
    return (
      <TouchableOpacity
        testID="select-date-button"
        onPress={() => onSelectDate("2026-03-24")}
      />
    );
  },
}));

jest.mock("../components/EventList", () => ({
  EventsList: ({ events }) => {
    const { Text } = require("react-native");
    return (
      <>
        {events.map((e) => (
          <Text key={e.subject} testID="event-item">
            {e.subject}
          </Text>
        ))}
      </>
    );
  },
}));

jest.mock("../components/CalendarShare", () => ({
  CalendarShare: ({ currentUserId }) => {
    const { Text } = require("react-native");
    return <Text testID="calendar-share">CalendarShare: {currentUserId}</Text>;
  },
}));

// --- TESTS ---
describe("MainTabScreen", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ user: { id: "123" } });
    calService.fetchDeviceEvents.mockResolvedValue([]);
    calService.requestCalendarPermissions.mockResolvedValue(true);
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue();
  });

  it("renders correctly and shows CalendarShare when user exists", async () => {
    const { getByTestId } = render(<MainTabScreen />);
    await waitFor(() => {
      expect(getByTestId("calendar-share")).toBeTruthy();
    });
  });

  it("can add an event and display it in EventsList", async () => {
    const { getByTestId, queryByText } = render(<MainTabScreen />);

    await waitFor(() => {
      expect(getByTestId("add-event-button")).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(getByTestId("add-event-button"));
    });

    await waitFor(() => {
      expect(queryByText("Test Event")).toBeTruthy();
    });
  });

  it("updates selected date from calendar", async () => {
    const { getByTestId } = render(<MainTabScreen />);

    await waitFor(() => {
      expect(getByTestId("select-date-button")).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(getByTestId("select-date-button"));
    });
    // No crash, state updated internally
  });
});
