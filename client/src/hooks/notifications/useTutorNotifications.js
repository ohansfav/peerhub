import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  fetchTutorBookings,
  getUpcomingSession,
} from "../../lib/api/common/bookingApi";
import { getBroadcastMessages } from "../../lib/api/broadcast/broadcastApi";
import { formatTimeRemaining } from "../../utils/time";

export function useTutorNotifications(enabled = true) {
  const bookings = useQuery({
    queryKey: ["tutorNotificationsBookings"],
    queryFn: () => fetchTutorBookings({ status: ["pending", "confirmed"] }),
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
    enabled,
  });

  const sessions = useQuery({
    queryKey: ["tutorNotificationsUpcomingSessions"],
    queryFn: getUpcomingSession,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
    enabled,
  });

  const broadcasts = useQuery({
    queryKey: ["broadcastMessages"],
    queryFn: getBroadcastMessages,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
    refetchInterval: enabled ? 15000 : false,
    refetchIntervalInBackground: false,
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

    // Broadcast messages
    if (broadcasts.data) {
      broadcasts.data.forEach((msg) => {
        const senderName = msg.sender
          ? `${msg.sender.firstName} ${msg.sender.lastName}`
          : "System";

        const offlineClassIdMatch = msg.message?.match(
          /offline class ID ([a-f0-9-]{8,})/i,
        );
        const classIdMatch = msg.message?.match(/class ID ([a-f0-9-]{8,})/i);
        const offlineClassId = offlineClassIdMatch?.[1];
        const classId = classIdMatch?.[1];
        const isOfflineOrClassroomAnnouncement =
          /classroom/i.test(String(msg?.message || "")) ||
          /class is in session/i.test(String(msg?.title || ""));

        const offlineOrClassroomLink =
          offlineClassId
            ? `/tutor/live-class/${offlineClassId}`
            : classId && isOfflineOrClassroomAnnouncement
            ? `/tutor/classroom-chat/${classId}`
            : classId
            ? `/tutor/call/${classId}`
            : null;

        result.push({
          id: `broadcast-${String(msg.id)}`,
          type: "announcement",
          sender: senderName,
          message: `${msg.title}: ${msg.message}`,
          timestamp: msg.createdAt,
          priority: "medium",
          ...(offlineOrClassroomLink && {
            action: {
              label: isOfflineOrClassroomAnnouncement
                ? "Join Classroom"
                : "Join Live Class",
              link: offlineOrClassroomLink,
            },
          }),
        });
      });
    }

    return result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [enabled, bookings.data, sessions.data, broadcasts.data]);

  return {
    notifications,
    isLoading:
      enabled &&
      (bookings.isLoading || sessions.isLoading || broadcasts.isLoading),
  };
}
