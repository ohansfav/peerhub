import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { createBroadcastMessage } from "../../lib/api/broadcast/broadcastApi";
import { startOfflineClass } from "../../lib/api/common/offlineClassApi";

const TutorSessionsPage = () => {
  const navigate = useNavigate();
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

  const startVirtualClassMutation = useMutation({
    mutationFn: createBroadcastMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broadcastMessages"] });
      handleToastSuccess("Virtual class started. Everyone online has been alerted.");
    },
    onError: (error) => {
      handleToastError(error, "Failed to alert users about class start.");
    },
  });

  const startOpenOfflineClassMutation = useMutation({
    mutationFn: startOfflineClass,
    onError: (error) => {
      handleToastError(error, "Failed to start open offline class.");
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

  const handleStartVirtualClass = async (session) => {
    const studentName = session?.student?.user?.firstName || "student";
    const subjectName = session?.subject?.name || "class";

    await startVirtualClassMutation.mutateAsync({
      title: "Virtual class is live now",
      message: `A tutor has started a live ${subjectName} class with ${studentName}. Join now with class ID ${session.id}.`,
      targetRole: null,
    });

    navigate(`/tutor/call/${session.id}`);
  };

  const handleStartOpenOfflineClass = async () => {
    const liveClass = await startOpenOfflineClassMutation.mutateAsync({
      title: "Open Offline Class",
    });

    if (liveClass.createdNew) {
      await startVirtualClassMutation.mutateAsync({
        title: "Open offline class is live now",
        message: `A tutor has started an open offline class. Join now with offline class ID ${liveClass.id}.`,
        targetRole: null,
      });
    }

    navigate(`/tutor/live-class/${liveClass.id}`);
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
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h1 className="text-2xl font-bold">My Sessions</h1>
          <button
            onClick={handleStartOpenOfflineClass}
            disabled={startOpenOfflineClassMutation.isPending || startVirtualClassMutation.isPending}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
          >
            Start Open Offline Class
          </button>
        </div>
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
          onStartVirtualClass={
            activeTab === "upcoming" ? handleStartVirtualClass : undefined
          }
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
