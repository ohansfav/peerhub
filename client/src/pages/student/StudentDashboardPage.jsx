import Calendar from "../../components/Calendar";
import streakIcon from "../../assets/Student-icon/streak.svg";
import quizIcon from "../../assets/Student-icon/quiz.svg";
import scoreIcon from "../../assets/Student-icon/score.svg";
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
import { getStudentStats } from "../../lib/api/quiz/quizApi";
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
import { getMyCourses } from "../../lib/api/course/courseApi";
import { BookOpen, GraduationCap } from "lucide-react";

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

  // Student stats query (streak, quizzes, avg score)
  const { data: stats } = useQuery({
    queryKey: ["studentStats"],
    queryFn: getStudentStats,
    staleTime: 1000 * 60 * 5,
  });

  // Registered courses query
  const { data: myCourses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ["myCourses"],
    queryFn: getMyCourses,
    staleTime: 1000 * 60 * 5,
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
                <OverviewPanel icon={streakIcon} text="Daily Streak" value={stats?.streak ? `${stats.streak} 🔥` : "0"} />
                <OverviewPanel icon={quizIcon} text="Quizzes" value={stats?.quizzesTaken ?? 0} />
                <OverviewPanel icon={scoreIcon} text="Average Score" value={stats?.averageScore ? `${stats.averageScore}%` : "0%"} />
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

            {/* Learning Progress */}
            <div className="flex-none px-2 sm:px-0">
              <h3 className="font-semibold text-lg mb-4">Learning Progress</h3>
              
              {/* Course Progress Items */}
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between w-full">
                    <p className="text-gray-700 text-sm font-semibold">
                      Sessions Completed
                    </p>
                    <span className="text-xs text-blue-600 font-medium">
                      {upcomingSessions ? "1+" : "0"} sessions
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: upcomingSessions ? "15%" : "0%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between w-full">
                    <p className="text-gray-700 text-sm font-semibold">
                      Course Materials
                    </p>
                    <span className="text-xs text-blue-600 font-medium">
                      Explore
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-blue-500 h-2 rounded-full w-0"></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between w-full">
                    <p className="text-gray-700 text-sm font-semibold">
                      Overall Progress
                    </p>
                    <span className="text-xs text-gray-500 font-medium">
                      0%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-yellow-500 h-2 rounded-full w-0"></div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-4">
                <Link
                  to="/student/library"
                  className="bg-blue-600 text-white px-4 py-2 border rounded-xl font-medium w-full text-center hover:bg-blue-700 transition-colors text-sm"
                >
                  Browse Course Materials
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Registered Courses */}
        <div className="bg-white rounded-lg border shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              My Registered Courses
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                {myCourses.length} course{myCourses.length !== 1 ? "s" : ""}
              </span>
              <Link
                to="/student/my-courses"
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                View All
              </Link>
            </div>
          </div>

          {coursesLoading ? (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          ) : myCourses.length === 0 ? (
            <div className="text-center py-6">
              <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No courses registered yet</p>
              <Link
                to="/student/courses"
                className="text-blue-600 text-sm font-medium hover:underline mt-1 inline-block"
              >
                Browse Course Catalog
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {myCourses.slice(0, 6).map((course) => (
                <div
                  key={course.id}
                  className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-blue-700 text-xs">
                      {course.courseCode}
                    </span>
                    <span className="text-xs text-gray-400">
                      {course.creditUnits} CU
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 line-clamp-1">
                    {course.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 capitalize">
                    {course.level}L · {course.semester} Semester
                  </p>
                </div>
              ))}
            </div>
          )}
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
