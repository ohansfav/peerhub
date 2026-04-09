import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  cancelStudentBooking,
  getAllStudentBookings,
} from "../../lib/api/common/bookingApi";
import Spinner from "../../components/common/Spinner";
import ErrorAlert from "../../components/common/ErrorAlert";
import BookingDetailsModal from "../../components/common/BookingDetailsModal";
import RescheduleBookingModal from "../../components/common/RescheduleBookingModal";
import {
  handleToastSuccess,
  handleToastError,
} from "../../utils/toastDisplayHandler";
import SessionStats from "../../components/common/SessionStats";
import SessionList from "../../components/common/SessionList";

const StudentSessionsPage = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const queryClient = useQueryClient();
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState(null);

  const {
    data: studentBookingsData,
    isLoading: isLoadingStudentBookingsData,
    isError: isErrorStudentBookingsData,
    error: errorStudentBookingsData,
  } = useQuery({
    queryKey: ["studentSessions"],
    queryFn: () =>
      getAllStudentBookings({
        status: ["confirmed", "completed", "pending", "cancelled"],
      }),
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, cancellationReason }) =>
      cancelStudentBooking(id, cancellationReason),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["studentSessions"],
        exact: true,
      });
      handleToastSuccess("Booking cancelled successfully!");
      setIsDetailsModalOpen(false);
    },
    onError: (err) => {
      handleToastError(err, "Failed to cancel booking.");
    },
  });

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedBooking(null);
  };

  const handleCancelBooking = (cancellationReason) => {
    if (selectedBooking) {
      cancelMutation.mutate({
        id: selectedBooking.id,
        cancellationReason,
      });
    }
  };
  if (isLoadingStudentBookingsData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="large" />
      </div>
    );
  }

  if (isErrorStudentBookingsData) {
    return <ErrorAlert error={errorStudentBookingsData?.message} />;
  }

  const upcomingBookings =
    studentBookingsData?.filter((b) => b.status === "confirmed") || [];
  const pastBookings =
    studentBookingsData?.filter((b) => b.status === "completed") || [];
  const pendingBookings =
    studentBookingsData?.filter((b) => b.status === "pending") || [];
  const cancelledBookings =
    studentBookingsData?.filter((b) => b.status === "cancelled") || [];

  const sessions = {
    upcoming: upcomingBookings,
    past: pastBookings,
    pending: pendingBookings,
    cancelled: cancelledBookings,
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
      value: studentBookingsData?.length || 0,
    },
    {
      title: "Upcoming",
      value: upcomingBookings.length,
    },
    {
      title: "Completed",
      value: pastBookings.length,
    },
    {
      title: "Pending",
      value: pendingBookings.length,
    },
    {
      title: "Cancelled",
      value: cancelledBookings.length,
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
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "past"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Past
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "pending"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab("cancelled")}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "cancelled"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>
        <SessionList
          sessions={sessionsToDisplay}
          userType="student"
          onViewDetails={handleViewDetails}
          noSessionsMessage={noSessionsMessages[activeTab]}
        />
      </div>
      <BookingDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        booking={selectedBooking}
        userType="student"
        onCancel={handleCancelBooking}
        isCancelling={cancelMutation.isPending}
        isPast={activeTab === "past" || activeTab === "cancelled"}
      />
    </>
  );
};

export default StudentSessionsPage;
