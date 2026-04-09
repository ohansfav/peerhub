import { useQuery } from "@tanstack/react-query";
import { fetchStudentTutorAvailability } from "../../lib/api/common/bookingApi";
import { endOfMonth, parseISO } from "date-fns";

export function useStudentBooking(tutorId, date, monthString = null) {
  // Support both single date and monthly fetching
  let start = null;
  let end = null;
  let queryEnabled = false;

  if (monthString) {
    // Monthly mode: fetch entire month
    const startDate = new Date(`${monthString}-01`);
    const endDate = endOfMonth(parseISO(`${monthString}-01`));

    start = new Date(
      Date.UTC(startDate.getFullYear(), startDate.getMonth(), 1, 0, 0, 0)
    );
    end = new Date(
      Date.UTC(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate(),
        23,
        59,
        59
      )
    );
    queryEnabled = !!tutorId && !!monthString;
  } else if (date) {
    // Single date mode: fetch just one day
    start = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
    );
    end = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)
    );
    queryEnabled = !!tutorId && !!date;
  }

  const { data: availabilityData, isLoading: availabilityLoading } = useQuery({
    queryKey: [
      "availability",
      tutorId,
      start?.toISOString(),
      end?.toISOString(),
    ],
    queryFn: () => fetchStudentTutorAvailability({ tutorId, start, end }),
    enabled: queryEnabled,
  });

  const availableTimes =
    availabilityData?.map((slot) => ({
      id: slot.id,
      start: slot.scheduledStart,
      end: slot.scheduledEnd,
      label: `${new Date(slot.scheduledStart).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })} - ${new Date(slot.scheduledEnd).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })}`,
    })) || [];

  return {
    availabilityData,
    availabilityLoading,
    availableTimes,
  };
}
