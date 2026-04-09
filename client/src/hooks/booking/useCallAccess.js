import { formatTimeRemaining } from "../../utils/time";
import { useAuth } from "../useAuthContext";

const useCallAccess = (booking) => {
  const { authUser } = useAuth();

  if (!booking || !authUser) {
    return {
      canAccess: false,
      reason: "Booking or user information is missing.",
      dashboardLink:
        authUser?.role === "student"
          ? "/student/dashboard"
          : "/tutor/dashboard",
    };
  }

  const isStudent = authUser.role === "student";
  const isTutor = authUser.role === "tutor";

  const sessionStartTime = new Date(booking.scheduledStart);
  const sessionEndTime = new Date(booking.scheduledEnd);

  const now = new Date();

  const fifteenMinutesBefore = new Date(
    sessionStartTime.getTime() - 15 * 60 * 1000
  );
  const fifteenMinutesAfter = new Date(
    sessionEndTime.getTime() + 15 * 60 * 1000
  ); // Allow joining up to 15 minutes after session ends

  // Check if the current user is part of the booking
  const isUserInBooking =
    (isStudent && booking?.student?.user.id === authUser.id) ||
    (isTutor && booking?.tutor?.user?.id === authUser.id);

  if (!isUserInBooking) {
    return {
      canAccess: false,
      reason: "You are not authorized to join this session.",
      dashboardLink: isStudent ? "/student/dashboard" : "/tutor/dashboard",
    };
  }

  // Check session status
  if (booking.status !== "confirmed") {
    return {
      canAccess: false,
      reason: `Session is not confirmed. Current status: ${booking.status}.`,
      dashboardLink: isStudent ? "/student/dashboard" : "/tutor/dashboard",
    };
  }

  // Check time-based access (15 minutes before to 15 minutes after start)
  if (now < fifteenMinutesBefore) {
    const timeDifferenceMs = fifteenMinutesBefore.getTime() - now.getTime();

    const timeRemainingString = formatTimeRemaining(timeDifferenceMs);

    return {
      canAccess: false,
      reason: `You can join the call in ${timeRemainingString}.`,
      dashboardLink: isStudent ? "/student/dashboard" : "/tutor/dashboard",
    };
  }

  if (now > fifteenMinutesAfter) {
    return {
      canAccess: false,
      reason: "The session has already ended.",
      dashboardLink: isStudent ? "/student/dashboard" : "/tutor/dashboard",
    };
  }

  return {
    canAccess: true,
    reason: null,
    dashboardLink: isStudent ? "/student/dashboard" : "/tutor/dashboard",
  };
};

export default useCallAccess;
