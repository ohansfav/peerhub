import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approveTutor } from "../../lib/api/admin/admin";
import {
  handleToastError,
  handleToastSuccess,
} from "../../utils/toastDisplayHandler";
import { PENDING_TUTORS_QUERY_KEY } from "./usePendingTutors";

export function useApproveTutor(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tutorId) => approveTutor(tutorId),
    onSuccess: (data, tutorId, context) => {
      queryClient.invalidateQueries({ queryKey: PENDING_TUTORS_QUERY_KEY });
      handleToastSuccess("Tutor approved successfully.");
      options?.onSuccess?.(data, tutorId, context);
    },
    onError: (error, variables, context) => {
      handleToastError(error, "Failed to approve tutor.");
      options?.onError?.(error, variables, context);
    },
  });
}
