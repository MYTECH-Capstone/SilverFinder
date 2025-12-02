// calendarService.ts
import * as Calendar from "expo-calendar";
import { toDateId } from "@marceloterreiro/flash-calendar";

type CalendarEvent = {
  subject: string;
  date: string;
  time?: string;
  location?: string;
  memo?: string;
  startDate?: Date;
  endDate?: Date;
};

export async function requestCalendarPermissions() {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  return status === "granted";
}

export async function getDefaultCalendarId() {
  const calendars = await Calendar.getCalendarsAsync(
    Calendar.EntityTypes.EVENT
  );
  const defaultCalendar =
    calendars.find((c) => c?.source?.isLocalAccount) ?? calendars[0];
  return defaultCalendar?.id ?? null;
}

export async function fetchDeviceEvents(start: Date, end: Date) {
  const calendars = await Calendar.getCalendarsAsync(
    Calendar.EntityTypes.EVENT
  );
  const events = await Calendar.getEventsAsync(
    calendars.map((c) => c.id),
    start,
    end
  );
  return events.map((event) => ({
    id: event.id,
    subject: event.title,
    date: toDateId(new Date(event.startDate)),
    time: new Date(event.startDate).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    location: event.location ?? "",
    category: "Device",
    color: "#8e44ad",
    memo: event.notes ?? "",
    isDeviceEvent: true,
  }));
}

export async function saveToDeviceCalendar(event: CalendarEvent) {
  const granted = await requestCalendarPermissions();
  if (!granted) return null;

  const calendarId = await getDefaultCalendarId();
  if (!calendarId) return null;

  let eventStart: Date;
  let eventEnd: Date;

  try {
    if (event.startDate && event.endDate) {
      // Use explicitly provided start/end
      eventStart = event.startDate;
      eventEnd = event.endDate;
    } else if (event.date && event.time) {
      // Try parsing date + time
      const parsed = new Date(`${event.date} ${event.time}`);
      if (isNaN(parsed.getTime())) throw new RangeError();
      eventStart = parsed;
      eventEnd = new Date(eventStart.getTime() + 60 * 60 * 1000); // default 1-hour duration
    } else {
      // Only date provided, make all-day
      eventStart = new Date(event.date);
      eventStart.setHours(0, 0, 0, 0);
      eventEnd = new Date(event.date);
      eventEnd.setHours(23, 59, 59, 999);
    }
  } catch {
    // Fallback: treat as all-day if any error occurs
    const fallbackDate = event.startDate || new Date(event.date);
    eventStart = new Date(fallbackDate);
    eventStart.setHours(0, 0, 0, 0);
    eventEnd = new Date(fallbackDate);
    eventEnd.setHours(23, 59, 59, 999);
  }

  const id = await Calendar.createEventAsync(calendarId, {
    title: event.subject,
    notes: event.memo || "",
    location: event.location || "",
    startDate: eventStart,
    endDate: eventEnd,
    allDay:
      eventStart.getHours() === 0 &&
      eventStart.getMinutes() === 0 &&
      eventEnd.getHours() === 23 &&
      eventEnd.getMinutes() === 59,
  });

  return id;
}
