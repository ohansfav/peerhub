import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTutorBookings,
  cancelBookingAvailability,
  updateBookingAvailabilityStatus,
} from "../../lib/api/common/bookingApi";
import Spinner from "../../components/common/Spinner";
import ErrorAlert from "../../components/common/ErrorAlert";
import BookingDetailsModal from "../../components/common/BookingDetailsModal";
import {
  handleToastSuccess,
  handleToastError,
} from "../../utils/toastDisplayHandler";
import SessionStats from "../../components/common/SessionStats";
import SessionList from "../../components/common/SessionList";
import ViewModal from "../../components/tutor/ViewModal";
import RescheduleBookingModal from "../../components/common/RescheduleBookingModal";

const TutorSessionsPage = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const queryClient = useQueryClient();

  const {
    data: tutorBookingsData,
    isLoading: isLoadingTutorBookings,
    isError: isErrorTutorBookings,
    error: errorTutorBookings,
  } = useQuery({
    queryKey: ["tutorSessions"],
    queryFn: () =>
      fetchTutorBookings({
        status: ["confirmed", "completed", "cancelled", "pending"],
      }),
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, cancellationReason }) =>
      cancelBookingAvailability(id, cancellationReason),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tutorSessions"],
        exact: true,
      });
      handleToastSuccess("Booking cancelled successfully!");
      setIsDetailsModalOpen(false);
    },
    onError: (err) => {
      handleToastError(err, "Failed to cancel booking.");
    },
  });

  const updateBookingStatusMutation = useMutation({
    mutationFn: ({ availabilityId, status }) =>
      updateBookingAvailabilityStatus(availabilityId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tutorSessions"],
        exact: true,
      });
      handleToastSuccess("Booking request updated successfully!");
      setIsPendingModalOpen(false);
    },
    onError: (err) => {
      handleToastError(err, "Failed to update booking request.");
    },
  });

  const upcomingSessions =
    tutorBookingsData?.filter((b) => b.status === "confirmed") || [];
  const completedSessions =
    tutorBookingsData?.filter((b) => b.status === "completed") || [];
  const cancelledSessions =
    tutorBookingsData?.filter((b) => b.status === "cancelled") || [];
  const pendingSessions =
    tutorBookingsData?.filter((b) => b.status === "pending") || [];

  const handleViewDetails = (session) => {
    if (session.status === "pending") {
      setSelectedSession(session);
      setIsPendingModalOpen(true);
    } else {
      setSelectedSession(session);
      setIsDetailsModalOpen(true);
    }
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedSession(null);
  };

  const handleClosePendingModal = () => {
    setIsPendingModalOpen(false);
    setSelectedSession(null);
  };

  const handleCancelBooking = (cancellationReason) => {
    if (selectedSession) {
      cancelMutation.mutate({ id: selectedSession.id, cancellationReason });
    }
  };

  const handleOpenRescheduleModal = () => {
    setIsDetailsModalOpen(false);
    setIsRescheduleModalOpen(true);
  };

  const handleCloseRescheduleModal = () => {
    setIsRescheduleModalOpen(false);
    setSelectedSession(null);
  };

  if (isLoadingTutorBookings) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="large" />
      </div>
    );
  }

  if (isErrorTutorBookings) {
    return <ErrorAlert error={errorTutorBookings} />;
  }

  const sessions = {
    upcoming: upcomingSessions,
    past: completedSessions,
    pending: pendingSessions,
    cancelled: cancelledSessions,
  };

  const sessionsToDisplay = sessions[activeTab] || [];

  const noSessionsMessages = {
    upcoming: "No upcoming sessions.",
    past: "No past sessions.",
    pending: "No pending requests.",
    cancelled: "No cancelled sessions.",
  };

  const stats = [
    {
      title: "Total Sessions",
      value: tutorBookingsData?.length || 0,
    },
    {
      title: "Upcoming",
      value: upcomingSessions.length,
    },
    {
      title: "Completed",
      value: completedSessions.length,
    },
    {
      title: "Pending",
      value: pendingSessions.length,
    },
    {
      title: "Cancelled",
      value: cancelledSessions.length,
    },
  ];

  return (
    <>
      <div className="max-w-6xl mx-auto p-4 sm:p-0">
        <h1 className="text-2xl font-bold mb-4">My Sessions</h1>
        <SessionStats stats={stats} isCompact={true} />

        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-6 sm:gap-8">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "upcoming"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "past"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Past
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "pending"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab("cancelled")}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "cancelled"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>

        <SessionList
          sessions={sessionsToDisplay}
          userType="tutor"
          onViewDetails={handleViewDetails}
          noSessionsMessage={noSessionsMessages[activeTab]}
        />
      </div>
      <BookingDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        booking={selectedSession}
        userType="tutor"
        onCancel={handleCancelBooking}
        isCancelling={cancelMutation.isPending}
        onReschedule={handleOpenRescheduleModal}
        isPast={activeTab === "past" || activeTab === "cancelled"}
      />
      <RescheduleBookingModal
        isOpen={isRescheduleModalOpen}
        onClose={handleCloseRescheduleModal}
        booking={selectedSession}
        onReschedule={() =>
          queryClient.invalidateQueries({
            queryKey: ["tutorSessions"],
            exact: true,
          })
        }
      />
      <ViewModal
        isOpen={isPendingModalOpen}
        onClose={handleClosePendingModal}
        session={selectedSession}
        updateBookingStatusMutation={updateBookingStatusMutation}
      />
    </>
  );
};

export default TutorSessionsPage;
