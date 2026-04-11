import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unsuspendUser } from "../../lib/api/admin/admin";
import { handleToastError, handleToastSuccess } from "../../utils/toastDisplayHandler";
import { USERS_QUERY_KEY } from "./useUsers";
import { USER_COUNTS_QUERY_KEY } from "./useUserCounts";
import { buildAdminUserQueryKey } from "./useAdminUser";

export function useUnsuspendUser(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId) => unsuspendUser(userId),
    onSuccess: (data, userId, context) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: buildAdminUserQueryKey(userId),
        });
      }
      queryClient.invalidateQueries({ queryKey: USER_COUNTS_QUERY_KEY });
      handleToastSuccess("User unsuspended successfully.");
      options?.onSuccess?.(data, userId, context);
    },
    onError: (error, variables, context) => {
      handleToastError(error, "Failed to unsuspend user.");
      options?.onError?.(error, variables, context);
    },
  });
}
