// ========================================
// DISPLAY HELPERS (formatting stored dates/times)
// ========================================

/**
 * Format a start/end ISO string into "h:mm AM - h:mm PM".
 */
export function formatTimeRange(startISO, endISO) {
  const formatter = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const start = formatter.format(new Date(startISO));
  const end = formatter.format(new Date(endISO));
  return `${start} - ${end}`;
}

/**
 * Format notification timestamps
 */
export const formatDateTime = (dateISO) => {
  const date = new Date(dateISO);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${day}-${month}-${year}, ${hours}:${minutes}`;
};

/**
 * Format a date ISO string into "MMM DD, YYYY".
 */
export function formatDate(dateISO) {
  const formatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return formatter.format(new Date(dateISO));
}

/**
 * Formats a JavaScript Date object into a specific string format for calendar or API use.
 * Currently supports 'yyyy-MM-dd' and 'yyyy-MM'.
 * * @param {Date} date - The JavaScript Date object to format.
 * @param {'yyyy-MM-dd' | 'yyyy-MM'} format - The desired output format string.
 * @returns {string} The formatted date string, or the result of date.toISOString() if the format is unsupported.
 */
export const formatCalendarDate = (date, format) => {
  if (format === "yyyy-MM-dd") {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  if (format === "yyyy-MM") {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }
  return date.toISOString(); // only when you need to send to backend
};

/**
 * Format duration between two ISO strings into "Xhrs, Ymin".
 */
export function formatDuration(startISO, endISO) {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const diff = end.getTime() - start.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  let duration = "";
  if (hours > 0) duration += `${hours}hr${hours > 1 ? "s" : ""}`;
  if (minutes > 0) duration += duration ? `, ${minutes}min` : `${minutes}min`;
  return duration;
}

/**
 * Format a session date into:
 * - "Weekday, h:mm AM" if within 7 days
 * - "Month Day{st/nd/rd/th}, h:mm AM" if later
 */
export const formatSessionDate = (scheduledStart) => {
  const sessionDate = new Date(scheduledStart);
  const today = new Date();
  const oneWeekFromToday = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  if (sessionDate >= today && sessionDate < oneWeekFromToday) {
    const weekday = sessionDate.toLocaleDateString("en-US", {
      weekday: "long",
    });
    const time = sessionDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${weekday}, ${time}`;
  } else {
    const month = sessionDate.toLocaleDateString("en-US", { month: "long" });
    const day = sessionDate.getDate();
    const time = sessionDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    // Day suffix
    let suffix = "th";
    if ([1, 21, 31].includes(day)) suffix = "st";
    else if ([2, 22].includes(day)) suffix = "nd";
    else if ([3, 23].includes(day)) suffix = "rd";

    return `${month} ${day}${suffix}, ${time}`;
  }
};

// Helper to format time from raw slot data
export const formatSlotTime = (slot) => {
  if (!slot) return "";
  return `${new Date(slot.start).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })} - ${new Date(slot.end).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })}`;
};

/**
 * Converts a millisecond difference into the largest readable unit
 * (e.g., "5 days", "3 hours", "10 minutes").
 */
export const formatTimeRemaining = (ms) => {
  const MS_PER_MINUTE = 1000 * 60;
  const MS_PER_HOUR = MS_PER_MINUTE * 60;
  const MS_PER_DAY = MS_PER_HOUR * 24;
  const MS_PER_WEEK = MS_PER_DAY * 7;

  let time, unit;
  if (ms >= MS_PER_WEEK) {
    time = Math.ceil(ms / MS_PER_WEEK);
    unit = "week";
  } else if (ms >= MS_PER_DAY) {
    time = Math.ceil(ms / MS_PER_DAY);
    unit = "day";
  } else if (ms >= MS_PER_HOUR) {
    time = Math.ceil(ms / MS_PER_HOUR);
    unit = "hour";
  } else {
    time = Math.ceil(ms / MS_PER_MINUTE);
    unit = "minute";
  }

  return `${time} ${unit}${time === 1 ? "" : "s"}`;
};

// ========================================
// DROPDOWN HELPERS (date/time options for pickers)
// ========================================

/**
 * Format a time into "h:mm AM/PM" for dropdown labels.
 */
export const formatTime = (hour, minute) => {
  const h = ((hour + 11) % 12) + 1;
  const m = minute.toString().padStart(2, "0");
  const suffix = hour < 12 ? "AM" : "PM";
  return `${h}:${m} ${suffix}`;
};

/**
 * Generate next 30 days as { value, label } options.
 */
export const generateDateOptions = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const value = `${year}-${month}-${day}`;

    const label = date.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    dates.push({ value, label });
  }
  return dates;
};

/**
 * Generate 15-min time slots between 6 AM – 10 PM.
 */
export const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 6; hour < 22; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const value = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      slots.push({ value, label: formatTime(hour, minute) });
    }
  }
  return slots;
};

/**
 * Generate possible end times (15–60 mins after start).
 */
export const getAvailableEndTimes = (startTime) => {
  if (!startTime) return [];
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const startTotalMinutes = startHour * 60 + startMinute;

  const endTimes = [];
  for (let duration = 15; duration <= 60; duration += 15) {
    const endTotalMinutes = startTotalMinutes + duration;
    if (endTotalMinutes >= 22 * 60) break;

    const endHour = Math.floor(endTotalMinutes / 60);
    const endMinute = endTotalMinutes % 60;
    const value = `${endHour.toString().padStart(2, "0")}:${endMinute
      .toString()
      .padStart(2, "0")}`;

    endTimes.push({
      value,
      label: `${formatTime(endHour, endMinute)} (${duration} min session)`,
    });
  }
  return endTimes;
};

/**
 * Calculate duration in minutes between two "HH:mm" strings.
 */
export const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  return endHour * 60 + endMinute - (startHour * 60 + startMinute);
};

// ========================================
// BACKEND PAYLOAD HELPERS (for API calls)
// ========================================

/**
 * Convert local "YYYY-MM-DD" + "HH:mm" into UTC ISO string.
 */
export function toUtcIso(dateStr, timeStr) {
  const localDate = new Date(`${dateStr}T${timeStr}:00`);
  return localDate.toISOString();
}

/**
 * Availability payload (with tutorNotes).
 */
export function makeAvailabilityPayload(
  dateStr,
  startTime,
  endTime,
  tutorNotes = ""
) {
  return {
    scheduledStart: toUtcIso(dateStr, startTime),
    scheduledEnd: toUtcIso(dateStr, endTime),
    tutorNotes,
  };
}

/**
 * Reschedule payload (no tutorNotes).
 */
export function makeReschedulePayload(dateStr, startTime, endTime) {
  return {
    scheduledStart: toUtcIso(dateStr, startTime),
    scheduledEnd: toUtcIso(dateStr, endTime),
  };
}

/**
 * Convert UTC ISO string into local parts { date, time }.
 */
export function fromUtcToLocalParts(isoString) {
  const d = new Date(isoString);
  const date = d.toLocaleDateString("en-CA"); // YYYY-MM-DD
  const time = d.toTimeString().slice(0, 5); // HH:mm
  return { date, time };
}
