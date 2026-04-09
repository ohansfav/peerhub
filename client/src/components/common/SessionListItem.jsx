import { formatDate, formatTimeRange } from "../../utils/time";

const SessionListItem = ({ session, userType, onViewDetails }) => {
  const isTutor = userType === "tutor";
  const user = isTutor ? session.student?.user : session.tutor?.user;
  const profileImageUrl =
    user?.profileImageUrl ||
    `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=random&color=fff`;

  const getStatusClass = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "completed":
        return "bg-gray-100 text-gray-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div
      className="transition-colors hover:bg-gray-50 cursor-pointer"
      onClick={() => onViewDetails(session)}
    >
      {/* Desktop Table Row */}
      <div className="hidden md:grid md:grid-cols-6 gap-4 p-4 items-center">
        <div className="flex items-center gap-3 col-span-2">
          <img
            src={profileImageUrl}
            alt={`${user?.firstName} ${user?.lastName}`}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div>
            <div className="font-medium text-gray-800">{`${
              user?.firstName || ""
            } ${user?.lastName || ""}`}</div>
            <div className="text-xs text-gray-500">{session.subject?.name}</div>
          </div>
        </div>
        <div className="flex items-center text-gray-700">
          {session.subject?.name}
        </div>
        <div className="flex items-center text-gray-700">
          {formatDate(session.scheduledStart)}
        </div>
        <div className="flex items-center text-gray-700">
          {formatTimeRange(session.scheduledStart, session.scheduledEnd)}
        </div>
        <div className="flex items-center justify-between">
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusClass(
              session.status
            )}`}
          >
            {session.status}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(session);
            }}
            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
          >
            View Details
          </button>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img
              src={profileImageUrl}
              alt={`${user?.firstName} ${user?.lastName}`}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div className="font-medium text-gray-800">{`${user?.firstName} ${user?.lastName}`}</div>
              <div className="text-sm text-gray-600">
                {session.subject?.name}
              </div>
            </div>
          </div>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(
              session.status
            )}`}
          >
            {session.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Date:</span>
            <div className="text-gray-700 font-medium">
              {formatDate(session.scheduledStart)}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Time:</span>
            <div className="text-gray-700 font-medium">
              {formatTimeRange(session.scheduledStart, session.scheduledEnd)}
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(session);
            }}
            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionListItem;
