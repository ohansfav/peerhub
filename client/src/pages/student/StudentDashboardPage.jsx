import Calendar from "../../components/Calendar";
import streakIcon from "../../assets/Student-icon/streak.svg";
import quizIcon from "../../assets/Student-icon/quiz.svg";
import scoreIcon from "../../assets/Student-icon/score.svg";
import greaterThanIcon from "../../assets/Student-icon/greater-than.svg";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getRecommendedTutors } from "../../lib/api/tutor/tutorApi";
import { Link } from "react-router-dom";
import OverviewPanel from "../../components/student/OverviewPanel";
import { endOfMonth, parseISO } from "date-fns";
import {
  cancelStudentBooking,
  getUpcomingSession,
  getAllStudentBookings,
} from "../../lib/api/common/bookingApi";
import Spinner from "../../components/common/Spinner";
import HorizontalScrollTutors from "../../components/student/HorizontalScrollTutors";
import UpcomingSessionsCard from "../../components/student/UpcomingSessionCard";
import { useMemo, useState } from "react";
import BookingDetailsModal from "../../components/common/BookingDetailsModal";
import {
  handleToastError,
  handleToastSuccess,
} from "../../utils/toastDisplayHandler";
import { formatCalendarDate, formatDate } from "../../utils/time";
import { useUserProfile } from "../../hooks/profile/useUserProfile";

const StudentDashboardPage = () => {
  const { data: user } = useUserProfile();
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(
    formatCalendarDate(new Date(), "yyyy-MM") // e.g. "2025-09"
  );

  const queryClient = useQueryClient();

  // Recommended tutors query
  const { data, isLoading, error } = useQuery({
    queryKey: ["recommendedTutors"],
    queryFn: () => getRecommendedTutors(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  // Monthly bookings query - fetch bookings for the current month
  const { data: monthBookings = [], isLoading: monthLoading } = useQuery({
    queryKey: ["studentBookings", currentMonth],
    queryFn: () => {
      const start = `${currentMonth}-01`;
      const end = formatCalendarDate(endOfMonth(parseISO(start)), "yyyy-MM-dd");
      return getAllStudentBookings({
        start,
        end,
        status: ["confirmed"],
      });
    },
    keepPreviousData: true,
  });

  // Global upcoming sessions query - for default display
  const {
    data: upcomingSessions,
    isLoading: upcomingSessionsLoading,
    error: upcomingSessionsError,
  } = useQuery({
    queryKey: ["studentUpcomingSession"],
    queryFn: getUpcomingSession,
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, cancellationReason }) =>
      cancelStudentBooking(id, cancellationReason),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["studentUpcomingSession"],
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: ["studentBookings"],
        exact: true,
      });
      handleToastSuccess("Booking cancelled successfully!");
      setIsDetailsModalOpen(false);
    },
    onError: (err) => {
      handleToastError(err, "Failed to cancel booking.");
    },
  });

  // Event handlers
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
      cancelMutation.mutate({ id: selectedBooking.id, cancellationReason });
    }
  };

  // Calendar handlers
  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleMonthChange = (month) => {
    setCurrentMonth(month);
    if (selectedDate && !selectedDate.startsWith(month)) {
      setSelectedDate(null);
    }
  };

  // Computed values
  const bookedDates = monthBookings.map((session) =>
    formatCalendarDate(new Date(session.scheduledStart), "yyyy-MM-dd")
  );

  const selectedDayBookings = useMemo(() => {
    if (!selectedDate) return [];
    return monthBookings.filter(
      (session) =>
        formatCalendarDate(new Date(session.scheduledStart), "yyyy-MM-dd") ===
        selectedDate
    );
  }, [selectedDate, monthBookings]);

  const sessionsToDisplay = useMemo(() => {
    if (selectedDate) {
      // Always return selectedDayBookings, even if it's empty
      return selectedDayBookings;
    }
    // No date selected → show upcoming sessions
    return upcomingSessions ? [upcomingSessions] : [];
  }, [selectedDate, selectedDayBookings, upcomingSessions]);

  return (
    <>
      <div className="space-y-4 w-full max-w-[420px] sm:max-w-xl md:max-w-7xl mx-auto">
        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-2 md:space-y-6">
            <h1 className="text-2xl mb-4 font-semibold pl-2 md:pl-0">
              Welcome back, {user?.firstName || "Student"}
            </h1>

            {/* Overview */}
            <div className="">
              {/* <h2 className="text-lg font-semibold mb-4 pl-2 md:pl-0">
                Overview
              </h2> */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <OverviewPanel icon={streakIcon} text="Daily Streak" />
                <OverviewPanel icon={quizIcon} text="Quizzes" />
                <OverviewPanel icon={scoreIcon} text="Average Score" />
              </div>
            </div>

            {/* Upcoming Sessions */}
            <div className="bg-white rounded-lg border shadow p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">
                  {selectedDate
                    ? `Sessions for ${formatDate(selectedDate)}`
                    : "Upcoming Sessions"}
                </h3>
                {selectedDate && (
                  <Link
                    to="/student/sessions"
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Show all upcoming
                  </Link>
                )}
              </div>

              {(upcomingSessionsLoading || monthLoading) && (
                <div className="flex flex-col justify-center items-center py-8">
                  <Spinner />
                  <p className="text-gray-600">Loading sessions...</p>
                </div>
              )}

              {upcomingSessionsError && !selectedDate && (
                <div className="flex justify-center items-center py-8">
                  <p className="font-semibold text-red-600">
                    Error loading upcoming sessions
                  </p>
                </div>
              )}

              {!(upcomingSessionsLoading || monthLoading) &&
                !upcomingSessionsError && (
                  <UpcomingSessionsCard
                    upcomingSessions={sessionsToDisplay}
                    onViewDetails={handleViewDetails}
                    selectedDate={selectedDate}
                  />
                )}
            </div>
          </div>

          <div className="bg-[#F9FAFB] border rounded-lg shadow p-2 md:p-4 space-y-4 flex flex-col self-start">
            {/* Calendar */}
            <div className="flex-none">
              <Calendar
                compact={true}
                bookingDates={bookedDates}
                onDateClick={handleDateClick}
                onMonthChange={handleMonthChange}
              />
            </div>

            <hr className="border-t border-gray-300" />

            {/* Currently Enrolled */}
            <div className="flex-none px-2 sm:px-0">
              <h3 className="font-semibold text-lg mb-4">Currently Enrolled</h3>
              <div className="flex items-center justify-between w-full">
                <p className="text-gray-500 text-sm font-semibold">
                  No subject
                </p>
                <img
                  src={greaterThanIcon}
                  alt=">"
                  className="w-3 h-3 opacity-70"
                />
              </div>

              <p className="text-sm text-gray-500 mt-1">Progress 0%</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-blue-600 h-2 rounded-full w-0"></div>
              </div>
              <div className="flex justify-center mt-4">
                <button
                  disabled
                  className="bg-blue-600 text-white px-4 py-1 border rounded-xl font-medium w-full disabled:opacity-50 disabled:cursor-not-allowed italic"
                >
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Tutors */}
        <div className="bg-[#F9FAFB] rounded-lg p-0 md:p-4 w-full mx-auto border shadow-md">
          <div className="flex items-center justify-between mb-4 px-4 pt-4">
            <h3 className="font-semibold text-lg">Recommended Tutors</h3>
            <Link
              to="/student/tutors"
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              View All
            </Link>
          </div>

          {isLoading && (
            <div className="flex flex-col justify-center items-center py-8 px-4">
              <Spinner />
              <p className="text-gray-600">Loading tutors...</p>
            </div>
          )}

          {error && (
            <div className="flex justify-center items-center py-8 px-4">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-red-600">
                    Error loading tutors
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    Please try again later
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isLoading && !error && data?.length === 0 && (
            <div className="flex justify-center items-center py-8">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <p className="font-bold text-gray-600">No tutors found.</p>
              </div>
            </div>
          )}

          {!isLoading && !error && data?.length > 0 && (
            <HorizontalScrollTutors tutors={data} />
          )}
        </div>
      </div>

      <BookingDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        booking={selectedBooking}
        userType="student"
        onCancel={handleCancelBooking}
        isCancelling={cancelMutation.isPending}
      />
    </>
  );
};

export default StudentDashboardPage;
