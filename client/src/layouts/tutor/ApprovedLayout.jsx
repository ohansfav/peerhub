import { Calendar1Icon, CalendarSyncIcon } from "lucide-react";
import renderIcon from "../../components/tutor/RenderRecentActivityIcon";
import { formatDateTime } from "../../utils/time";

export default function ApprovedLayout({
  tutor,
  recentActivities,
  isLoadingActivities,
}) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center">
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
            <div className="w-10 h-10 rounded-fullflex items-center justify-center">
              <CalendarSyncIcon />
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
            <div className="w-10 h-10 rounded-full flex items-center justify-center">
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
        <h2 className="text-lg font-semibold mb-4">Booking Requests</h2>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Calendar1Icon className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center max-w-md">
            <h3 className="text-lg font-semibold mb-2">
              No booking requests yet
            </h3>
            <p className="text-gray-600 text-sm">
              Your requests will appear here once students start booking
              sessions with you
            </p>
          </div>
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
