import SessionListItem from "./SessionListItem";

const SessionList = ({
  sessions,
  userType,
  onViewDetails,
  noSessionsMessage,
}) => {
  return (
    <div className="bg-white rounded-lg border">
      {/* Desktop Table Header - Hidden on mobile */}
      <div className="hidden md:grid md:grid-cols-6 gap-4 p-4 bg-gray-50 border-b text-sm font-medium text-gray-600">
        <div className="col-span-2">
          {userType === "tutor" ? "Student" : "Tutor"}
        </div>
        <div>Subject</div>
        <div>Date</div>
        <div>Time</div>
        <div>Status</div>
      </div>

      {/* Sessions Content */}
      <div className="divide-y divide-gray-100">
        {sessions.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {noSessionsMessage}
          </div>
        ) : (
          sessions.map((session) => (
            <SessionListItem
              key={session.id}
              session={session}
              userType={userType}
              onViewDetails={onViewDetails}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default SessionList;
