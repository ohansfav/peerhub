import BookingCard from "../../components/tutor/BookingCard";
import { formatDate, formatDateTime, formatTimeRange } from "../../utils/time";
import StudentIcon from "../../assets/tutor-dashboard-icons/students.svg?react";
import RatingsIcon from "../../assets/tutor-dashboard-icons/ratings.svg?react";
import CalendarIcon from "../../assets/tutor-dashboard-icons/calendar.svg?react";
import { Link } from "react-router-dom";
import renderIcon from "../../components/tutor/RenderRecentActivityIcon";

export default function ActiveLayout({
  tutor,
  pendingBookingRequests,
  handleView,
  recentActivities,
  isLoadingActivities,
}) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <StudentIcon />
            </div>
            {/* <ChevronRight className="w-4 h-4 text-gray-400" /> */}
          </div>
          <p className="text-sm text-gray-600">Total Students</p>
          <p className="text-2xl font-bold">
            {tutor?.stats?.totalStudents ?? 0}
          </p>
        </div>

        <div className="bg-white rounded-lg border shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CalendarIcon />
            </div>
            {/* <ChevronRight className="w-4 h-4 text-gray-400" /> */}
          </div>
          <p className="text-sm text-gray-600">Weekly Sessions</p>
          <p className="text-2xl font-bold">
            {tutor?.stats?.totalWeeklySessions ?? 0}
          </p>
        </div>

        <div className="bg-white rounded-lg border shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <RatingsIcon />
            </div>
            {/* <ChevronRight className="w-4 h-4 text-gray-400" /> */}
          </div>
          <p className="text-sm text-gray-600">Ratings</p>
          <p className="text-2xl font-bold">{tutor.stats.averageRating ?? 0}</p>
        </div>
      </div>

      {/* Booking Requests */}
      <div className="bg-white rounded-lg border shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Booking Requests</h2>
          <Link
            to="/tutor/booking-requests"
            className="text-primary text-sm font-medium hover:underline"
          >
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 text-sm font-medium">
                  Student
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium hidden sm:table-cell">
                  Subject
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium hidden md:table-cell">
                  Date
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium hidden md:table-cell">
                  Time
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {pendingBookingRequests?.length > 0 ? (
                pendingBookingRequests.map((session, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-3 px-2">
                      <BookingCard session={session} />
                    </td>
                    <td className="py-3 px-2 text-sm hidden sm:table-cell">
                      {session?.subject?.name}
                    </td>
                    <td className="py-3 px-2 text-sm hidden md:table-cell">
                      {formatDate(session?.scheduledStart)}
                    </td>
                    <td className="py-3 px-2 text-sm hidden md:table-cell">
                      {formatTimeRange(
                        session?.scheduledStart,
                        session?.scheduledEnd
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <button
                        onClick={() => handleView(session)}
                        className="text-primary hover:underline font-medium text-sm"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    No pending booking requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>

        {isLoadingActivities ? (
          <p className="text-gray-500 text-sm text-center py-4">
            Loading activity...
          </p>
        ) : recentActivities.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            No recent activity yet.
          </p>
        ) : (
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                {renderIcon(activity.type)}
                <div className="flex-1">
                  <p className="text-sm">
                    {activity.sender ?? activity.sender} {activity.message}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDateTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
