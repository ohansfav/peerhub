import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  fetchTutorBookings,
  getUpcomingSession,
} from "../../lib/api/common/bookingApi";
import { formatTimeRemaining } from "../../utils/time";

export function useTutorNotifications(enabled = true) {
  const bookings = useQuery({
    queryKey: ["tutorNotificationsBookings"],
    queryFn: () => fetchTutorBookings({ status: ["pending", "confirmed"] }),
    // staleTime: 30000, // 30 secs
    staleTime: 1000 * 60 * 5, // 5 mins
    cacheTime: 1000 * 60 * 10, // 10 mins
    enabled,
  });

  const sessions = useQuery({
    queryKey: ["tutorNotificationsUpcomingSessions"],
    queryFn: getUpcomingSession,
    staleTime: 1000 * 60 * 5, // 5 mins
    cacheTime: 1000 * 60 * 10, // 10 mins
    enabled,
  });

  const notifications = useMemo(() => {
    if (!enabled) return [];
    const result = [];

    if (bookings.data) {
      bookings.data
        .filter((b) => b.status === "pending")
        .forEach((booking) => {
          const studentName = booking.student?.user?.firstName || "A student";

          result.push({
            id: `booking-${String(booking.id)}`,
            type: "request",
            sender: studentName,
            message: "sent you a new booking request",
            timestamp: booking.updatedAt,
            priority: "high",
            action: {
              label: "Review Request",
              link: `/tutor/booking-requests`,
            },
          });
        });
    }

    if (sessions.data) {
      const session = sessions.data;
      const start = new Date(session.scheduledStart);
      const now = new Date();
      const hoursDiff = (start - now) / (1000 * 60 * 60);

      if (hoursDiff > 0 && hoursDiff < 2) {
        const studentName = session.student?.user?.firstName || "a student";
        const msUntil = hoursDiff * 60 * 60 * 1000;
        const timeRemaining = formatTimeRemaining(msUntil);

        result.push({
          id: `session-${String(session.id)}`,
          type: "session",
          sender: "System",
          message: `Your session with ${studentName} starts in ${timeRemaining}`,
          timestamp: session.scheduledStart,
          priority: "high",
          action: {
            label: "Join Session",
            link: `/tutor/call/${session.id}`,
          },
        });
      }
    }

    return result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [enabled, bookings.data, sessions.data]);

  return {
    notifications,
    isLoading: enabled && (bookings.isLoading || sessions.isLoading),
  };
}
