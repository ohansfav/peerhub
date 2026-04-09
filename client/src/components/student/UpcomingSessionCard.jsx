import Upcoming from "../../assets/Student-icon/upcoming.svg";
import clockIcon from "../../assets/Student-icon/clock.svg";
import { Link } from "react-router-dom";
import useCallAccess from "../../hooks/booking/useCallAccess";
import { formatSessionDate } from "../../utils/time";

const UpcomingSessionsCard = ({
  upcomingSessions = [],
  onViewDetails,
  selectedDate,
}) => {
  const firstSession = upcomingSessions?.[0];
  const { canAccess, reason } = useCallAccess(firstSession);

  // Conditional check to handle the empty state
  if (!upcomingSessions.length) {
    return (
      <div className="flex flex-row items-center justify-center p-4 bg-gray-100 rounded-2xl shadow-md h-44 w-full text-center">
        <div className="flex flex-col items-center justify-center h-full">
          {selectedDate ? (
            <p className="text-gray-600 mb-4">
              No sessions scheduled for this date
            </p>
          ) : (
            <>
              <h3 className="font-semibold text-lg text-gray-800">
                No Upcoming Sessions
              </h3>
              <p className="text-gray-500 mb-4 mt-1">You're all caught up!</p>
            </>
          )}

          <Link
            to="/student/tutors"
            className="bg-primary text-white px-6 py-2 rounded-full font-semibold transition-colors hover:bg-primary-focus"
          >
            Book a Session
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Show count if multiple sessions */}
      {upcomingSessions.length > 1 && (
        <p className="text-sm text-gray-600 mb-2">
          Showing first of {upcomingSessions.length} sessions for this date
        </p>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between rounded-lg p-4 gap-4 bg-white shadow w-full">
        {/* Left side */}
        <div className="flex flex-col justify-between flex-1 min-w-0">
          <div>
            <p className="text-blue-600 font-semibold truncate">
              {firstSession?.subject?.name}
            </p>
            <p className="text-gray-800 truncate">
              {firstSession.tutor?.user?.firstName}{" "}
              {firstSession.tutor?.user?.lastName}
            </p>
            <div className="flex items-center text-gray-500 text-sm mt-2 min-w-0">
              <img
                src={clockIcon}
                alt="Clock"
                className="w-4 h-4 mr-2 shrink-0"
              />
              <span className="truncate">
                {formatSessionDate(firstSession.scheduledStart)}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 mt-4 w-full">
            <button
              className="bg-primary text-white px-4 py-2 rounded-full font-semibold w-full sm:w-auto"
              onClick={() => onViewDetails(firstSession)}
            >
              View Details
            </button>
            {canAccess ? (
              <Link
                to={`/student/call/${firstSession.id}`}
                className="w-full sm:w-auto"
              >
                <button className="bg-green-500 text-white px-4 py-2 rounded-full font-semibold w-full sm:w-auto">
                  Join
                </button>
              </Link>
            ) : (
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded-full font-semibold w-full sm:w-auto cursor-not-allowed"
                disabled
                title={reason}
              >
                Join
              </button>
            )}
          </div>
        </div>

        {/* Right side image */}
        <div className="flex-shrink-0 w-full sm:w-48">
          <img
            src={Upcoming}
            alt="Upcoming session"
            className="w-full h-32 sm:h-full rounded-lg object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default UpcomingSessionsCard;
