import {
  Clock,
  Check,
  CalendarOffIcon,
  AlertCircle,
  CheckCircle2,
  Calendar1Icon,
} from "lucide-react";
import ViewModal from "../../components/tutor/ViewModal";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  updateBookingAvailabilityStatus,
  cancelBookingAvailability,
  fetchTutorBookings,
} from "../../lib/api/common/bookingApi";
import Spinner from "../../components/common/Spinner";
import ErrorAlert from "../../components/common/ErrorAlert";
import { formatDuration } from "../../utils/time";
import { Link } from "react-router-dom";
import {
  handleToastError,
  handleToastSuccess,
} from "../../utils/toastDisplayHandler";
import BookingDetailsModal from "../../components/common/BookingDetailsModal";
import RescheduleBookingModal from "../../components/common/RescheduleBookingModal";
import PendingLayout from "../../layouts/tutor/PendingLayout";
import RejectedLayout from "../../layouts/tutor/RejectedLayout";
import ApprovedLayout from "../../layouts/tutor/ApprovedLayout";
import ActiveLayout from "../../layouts/tutor/ActiveLayout";
import { useNotifications } from "../../hooks/notifications/useNotfications";
import { useTutorStatus } from "../../hooks/auth/useUserRoles";
import { useTutorDashboard } from "../../hooks/tutor/useTutorProfile";

const TutorDashboardPage = () => {
  const [selectedSession, setSelectedSession] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const {
    profile: user,
    isLoadingProfileQuery: isLoadingUser,
    isErrorUser,
    errorProfileQuery: errorUser,
  } = useTutorDashboard();

  const {
    data: tutorBookingsData,
    isLoading: isLoadingTutorBookings,
    isError: isErrorTutorBookings,
    error: errorTutorBookings,
  } = useQuery({
    queryKey: ["tutorBookings"],
    queryFn: () => fetchTutorBookings({ status: ["confirmed", "pending"] }),
    enabled: !!user,
  });

  const updateBookingStatusMutation = useMutation({
    mutationFn: ({ availabilityId, status }) =>
      updateBookingAvailabilityStatus(availabilityId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tutorBookings"],
        exact: true,
      });
      handleToastSuccess("Booking request updated successfully!");
    },
    onError: (err) => {
      handleToastError(err, "Failed to update booking request.");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, cancellationReason }) =>
      cancelBookingAvailability(id, cancellationReason),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tutorBookings"],
        exact: true,
      });
      handleToastSuccess("Booking cancelled successfully!");
      setIsDetailsModalOpen(false);
    },
    onError: (err) => {
      handleToastError(err, "Failed to cancel booking.");
    },
  });

  const { notifications, isLoading: activityLoading } = useNotifications(
    user?.role
  );

  // Filter only the most recent activities
  const recentActivities = notifications?.slice(0, 5) || [];

  const upcomingSessions =
    tutorBookingsData?.filter((b) => b.status === "confirmed") || [];
  const pendingBookingRequests =
    tutorBookingsData?.filter((b) => b.status === "pending") || [];

  const tutor = user?.tutor;
  const tutorStatus = useTutorStatus();

  const handleView = (session) => {
    setSelectedSession(session);
    setModalOpen(true);
  };

  const handleViewDetails = (session) => {
    setSelectedSession(session);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedSession(null);
  };

  const handleOpenRescheduleModal = () => {
    setIsDetailsModalOpen(false);
    setIsRescheduleModalOpen(true);
  };

  const handleCloseRescheduleModal = () => {
    setIsRescheduleModalOpen(false);
    setSelectedSession(null);
  };

  const handleCancelBooking = (cancellationReason) => {
    if (selectedSession) {
      cancelMutation.mutate({ id: selectedSession.id, cancellationReason });
    }
  };

  const profileStatus = {
    pending: {
      icon: <Clock className="w-5 h-5" style={{ color: "#BB6927" }} />,
      title: "Pending Approval",
      subtitle: "Awaiting Verification",
      btnMessage: "Check Status",
      bgColor: "bg-amber-100",
      color: "text-amber-600",
      sessionMessage: (
        <p className="text-sm text-gray-600">
          Sorry, there are no upcoming sessions yet until your verification is
          approved
        </p>
      ),
      sessionIcon: <CalendarOffIcon className="w-12 h-12 text-gray-400" />,
      progress: 0,
    },
    rejected: {
      icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      title: "Verification Rejected",
      subtitle: "Please check details",
      btnMessage: "Resubmit",
      bgColor: "bg-red-100",
      color: "text-red-500",
      sessionMessage: (
        <p className="text-sm text-gray-600">
          Sorry, there are no upcoming sessions yet until your verification is
          approved
        </p>
      ),
      sessionIcon: <CalendarOffIcon className="w-12 h-12 text-gray-400" />,
      progress: 0,
    },
    approved: {
      icon: <CheckCircle2 className="w-5 h-5 text-green-900" />,
      title: "Verified Tutor",
      subtitle: "Your Profile is approved",
      btnMessage: "View Profile",
      bgColor: "bg-blue-100",
      color: "text-green-900",
      sessionMessage: (
        <p className="text-sm text-gray-600">
          Your upcoming session would appear here
        </p>
      ),
      sessionIcon: <Calendar1Icon className="w-12 h-12 text-gray-400" />,
      progress: 100,
    },
    active: {
      icon: <CheckCircle2 className="w-5 h-5 text-green-900" />,
      title: "Verified Tutor",
      subtitle: "Your Profile is approved",
      btnMessage: "View Profile",
      bgColor: "bg-blue-100",
      color: "text-green-900",
      sessionMessage: (
        <div className="w-full space-y-3">
          {upcomingSessions?.length > 0 ? ( // Added conditional check here
            upcomingSessions.map((session, i) => (
              <SessionCard
                key={i}
                session={session}
                onClick={() => handleViewDetails(session)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center text-center">
              <Calendar1Icon className="w-12 h-12 text-gray-400 mb-4" />{" "}
              {/* Using Calendar1Icon from lucide-react */}
              <p className="text-lg font-semibold text-gray-700 mb-2">
                No Upcoming Sessions
              </p>
              <p className="text-sm text-gray-500">
                You're all caught up! Manage your availability to get more
                bookings.
              </p>
            </div>
          )}
          <Link
            to="/tutor/availability"
            className="btn bg-white border border-gray-700 w-full rounded-full hover:bg-[#4CA1F0]"
          >
            Manage Schedule
          </Link>
        </div>
      ),
      progress: 100,
    },
  };

  if (isLoadingUser || isLoadingTutorBookings) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="large" />
      </div>
    );
  }

  if (isErrorUser) {
    return <ErrorAlert error={errorUser.message} />;
  }

  if (isErrorTutorBookings) {
    return <ErrorAlert error={errorTutorBookings.message} />;
  }

  const {
    icon,
    title,
    subtitle,
    btnMessage,
    bgColor,
    color,
    sessionMessage,
    sessionIcon,
    progress,
  } = profileStatus[tutorStatus] || profileStatus.pending;

  const renderProfileButton = () => {
    if (tutorStatus === "pending") {
      return (
        <button
          onClick={() => window.location.reload()}
          className="btn bg-primary hover:bg-primary-focus text-white  w-full mt-4 rounded-full"
        >
          {btnMessage}
        </button>
      );
    }

    if (tutorStatus === "rejected") {
      return (
        <button disabled className="btn btn-primary w-full mt-4 rounded-full">
          {btnMessage}
        </button>
      );
    }

    return (
      <Link
        to={`/tutor/profile`}
        className="btn bg-primary hover:bg-primary-focus text-white w-full mt-4 rounded-full"
      >
        {btnMessage}
      </Link>
    );
  };

  return (
    <>
      <div className="p-2 sm:p-0 space-y-4 w-full max-w-[420px] sm:max-w-xl md:max-w-6xl mx-auto">
        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-2 md:space-y-6">
            <h1 className="text-2xl md:mb-4 font-semibold">
              Welcome back, {user?.firstName || "Tutor"}
            </h1>

            {/* Status-specific Layout */}
            {tutorStatus === "pending" && <PendingLayout />}
            {tutorStatus === "rejected" && <RejectedLayout />}
            {tutorStatus === "approved" && (
              <ApprovedLayout
                tutor={tutor}
                recentActivities={recentActivities}
                isLoadingActivities={activityLoading}
              />
            )}
            {tutorStatus === "active" && (
              <ActiveLayout
                tutor={tutor}
                pendingBookingRequests={pendingBookingRequests}
                handleView={handleView}
                recentActivities={recentActivities}
                isLoadingActivities={activityLoading}
              />
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4 flex flex-col">
            {/* Profile Status */}
            <div className="bg-white rounded-lg border shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Profile Status</h2>
              <div
                className={`flex items-center gap-3 rounded-lg p-3 ${bgColor}`}
              >
                {icon}
                <div>
                  <p className={`font-semibold ${color}`}>{title}</p>
                  <p className="text-xs text-gray-600">{subtitle}</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium">Profile Completion</p>
                  <span className="text-sm text-gray-600">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: "#4CA1F0",
                    }}
                  ></div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    {tutorStatus === "approved" || tutorStatus === "active" ? (
                      <Check className="w-4 h-4 text-blue-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-red-500" />
                    )}{" "}
                    <span>Identity Verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {tutorStatus === "approved" || tutorStatus === "active" ? (
                      <Check className="w-4 h-4 text-blue-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-red-500" />
                    )}{" "}
                    <span>Education Verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {tutorStatus === "approved" || tutorStatus === "active" ? (
                      <Check className="w-4 h-4 text-blue-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-red-500" />
                    )}
                    <span>Background Check</span>
                  </div>
                </div>

                {renderProfileButton()}
              </div>
            </div>

            {/* Upcoming Sessions */}
            <div className="bg-white rounded-lg border shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Upcoming Sessions</h2>
              <div className="flex flex-col items-center justify-center py-2 text-center">
                {sessionIcon}
                {sessionMessage}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ViewModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        session={selectedSession}
        updateBookingStatusMutation={updateBookingStatusMutation}
      />
      <BookingDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        booking={selectedSession}
        userType="tutor"
        onCancel={handleCancelBooking}
        isCancelling={cancelMutation.isPending}
        onReschedule={handleOpenRescheduleModal}
      />
      <RescheduleBookingModal
        isOpen={isRescheduleModalOpen}
        onClose={handleCloseRescheduleModal}
        booking={selectedSession}
        onReschedule={() =>
          queryClient.invalidateQueries({
            queryKey: ["tutorBookings"],
            exact: true,
          })
        }
      />
    </>
  );
};

export default TutorDashboardPage;

function SessionCard({ session, onClick }) {
  return (
    <div
      className="flex items-center justify-between border rounded-lg p-3 w-full cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <img
          src={session?.student?.user?.profileImageUrl}
          alt={`${session?.student?.user?.firstName} profile`}
          className="w-8 h-8 rounded-full"
        />
        <div className="flex flex-col items-start">
          <p className="font-medium text-sm">{`${session?.student?.user?.firstName} ${session?.student?.user?.lastName}`}</p>
          <p className="text-xs text-gray-500">{session?.subject?.name}</p>
          <p className="text-xs text-gray-500">
            {formatDuration(session?.scheduledStart, session?.scheduledEnd)}
          </p>
        </div>
      </div>
      <button
        className="btn btn-sm rounded-full"
        style={{ backgroundColor: "#E6F4EA", color: "#34A853" }}
      >
        Confirmed
      </button>
    </div>
  );
}
