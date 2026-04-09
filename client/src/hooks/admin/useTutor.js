import { useQuery } from "@tanstack/react-query";
import { getPendingTutorById } from "../../lib/api/admin/admin";
import { handleToastError } from "../../utils/toastDisplayHandler";

export const PENDING_TUTORS_QUERY_KEY = ["pendingTutors"];

export function usePendingTutor(id, options = {}) {
  return useQuery({
    queryKey: [...PENDING_TUTORS_QUERY_KEY, id],
    queryFn: () => getPendingTutorById(id),
    enabled: Boolean(id),
    // select: (res) => res?.data, // return just the "data" field from API response
    onError: (error) => {
      handleToastError(error, "Failed to fetch tutor profile.");
    },
    ...options,
  });
}
