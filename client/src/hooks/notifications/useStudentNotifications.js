import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  getAllStudentBookings,
  getUpcomingSession,
} from "../../lib/api/common/bookingApi";
import { formatSessionDate } from "../../utils/time";

export function useStudentNotifications(enabled = true) {
  const upcomingSession = useQuery({
    queryKey: ["studentNotificationsUpcomingSession"],
    queryFn: getUpcomingSession,
    // staleTime: 30000,
    staleTime: 1000 * 60 * 5, // 5 mins
    cacheTime: 1000 * 60 * 10, // 10 mins
    enabled,
  });

  const bookings = useQuery({
    queryKey: ["studentNotificationsBookings"],
    queryFn: () =>
      getAllStudentBookings({ status: ["confirmed", "cancelled"] }),
    // staleTime: 30000,
    staleTime: 1000 * 60 * 5, // 5 mins
    cacheTime: 1000 * 60 * 10, // 10 mins
    enabled,
  });

  const notifications = useMemo(() => {
    if (!enabled) return [];
    const result = [];

    // Upcoming session notification
    if (upcomingSession.data) {
      const session = upcomingSession.data;
      const tutorName = session.tutor?.user?.firstName || "your tutor";
      const startTime = formatSessionDate(session.scheduledStart);

      result.push({
        id: `session-${String(session.id)}`,
        type: "session",
        sender: "System",
        message: `You have an upcoming session with ${tutorName} on ${startTime}`,
        timestamp: session.scheduledStart,
        priority: "high",
        action: {
          label: "View Details",
          link: `/student/call/${session.id}`,
        },
      });
    }

    // Booking status notifications
    if (bookings.data) {
      bookings.data.forEach((booking) => {
        const tutorName = booking.tutor?.user?.firstName || "Tutor";
        const isConfirmed = booking.status === "confirmed";

        result.push({
          id: `booking-${String(booking.id)}`,
          type: isConfirmed ? "success" : "warning",
          sender: tutorName,
          message: isConfirmed
            ? "confirmed your booking request"
            : "cancelled your booking",
          timestamp: booking.updatedAt,
          priority: "medium",
          action: {
            label: "View Booking",
            link: `/student/bookings/${booking.id}`,
          },
        });
      });
    }

    return result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [enabled, upcomingSession.data, bookings.data]);

  return {
    notifications,
    isLoading: enabled && (upcomingSession.isLoading || bookings.isLoading),
  };
}
