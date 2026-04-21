import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  getAllStudentBookings,
  getUpcomingSession,
} from "../../lib/api/common/bookingApi";
import { getBroadcastMessages } from "../../lib/api/broadcast/broadcastApi";
import { formatSessionDate } from "../../utils/time";

export function useStudentNotifications(enabled = true) {
  const upcomingSession = useQuery({
    queryKey: ["studentNotificationsUpcomingSession"],
    queryFn: getUpcomingSession,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
    enabled,
  });

  const bookings = useQuery({
    queryKey: ["studentNotificationsBookings"],
    queryFn: () =>
      getAllStudentBookings({ status: ["confirmed", "cancelled"] }),
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
            ? `/student/live-class/${offlineClassId}`
            : classId && isOfflineOrClassroomAnnouncement
            ? `/student/classroom-chat/${classId}`
            : classId
            ? `/student/call/${classId}`
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
  }, [enabled, upcomingSession.data, bookings.data, broadcasts.data]);

  return {
    notifications,
    isLoading:
      enabled &&
      (upcomingSession.isLoading || bookings.isLoading || broadcasts.isLoading),
  };
}
