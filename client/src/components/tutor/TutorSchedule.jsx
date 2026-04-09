import { useState } from "react";
import { formatTimeRange } from "../../utils/time";

const TutorSchedule = ({ availability, maxToShow = 3 }) => {
  const [expanded, setExpanded] = useState(false);

  if (!availability || availability.length === 0) {
    return (
      <p className="text-sm text-gray-500 break-words leading-relaxed">
        No times available today. Check the tutor's calendar by clicking “Book
        Session”
      </p>
    );
  }

  const visibleSlots = expanded
    ? availability
    : availability.slice(0, maxToShow);
  const hiddenCount = availability.length - maxToShow;

  return (
    <p className="text-sm text-gray-500 break-words leading-relaxed">
      Today:{" "}
      {visibleSlots.map((slot, i) => (
        <span key={slot.id}>
          {formatTimeRange(slot.scheduledStart, slot.scheduledEnd)}
          {i < visibleSlots.length - 1 && ", "}
        </span>
      ))}
      {!expanded && hiddenCount > 0 && (
        <button
          onClick={() => setExpanded(true)}
          className="text-blue-600 ml-1"
        >
          +{hiddenCount} more
        </button>
      )}
      {expanded && availability.length > maxToShow && (
        <button
          onClick={() => setExpanded(false)}
          className="text-blue-600 ml-1"
        >
          View less
        </button>
      )}
    </p>
  );
};

export default TutorSchedule;
