import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rejectTutor } from "../../lib/api/admin/admin";
import {
  handleToastError,
  handleToastSuccess,
} from "../../utils/toastDisplayHandler";
import { PENDING_TUTORS_QUERY_KEY } from "./usePendingTutors";

export function useRejectTutor(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tutorId, rejectionReason }) =>
      rejectTutor(tutorId, { rejectionReason }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: PENDING_TUTORS_QUERY_KEY });
      handleToastSuccess("Tutor rejected successfully.");
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      handleToastError(error, "Failed to reject tutor.");
      options?.onError?.(error, variables, context);
    },
  });
}
