import { useMutation, useQueryClient } from "@tanstack/react-query";
import { restoreUser } from "../../lib/api/admin/admin";
import { handleToastError, handleToastSuccess } from "../../utils/toastDisplayHandler";
import { USER_COUNTS_QUERY_KEY } from "./useUserCounts";
import { USERS_QUERY_KEY } from "./useUsers";
import { buildAdminUserQueryKey } from "./useAdminUser";

export function useRestoreUser(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId) => restoreUser(userId),
    onSuccess: (data, userId, context) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: buildAdminUserQueryKey(userId),
        });
      }
      queryClient.invalidateQueries({ queryKey: USER_COUNTS_QUERY_KEY });
      handleToastSuccess("User restored successfully.");
      options?.onSuccess?.(data, userId, context);
    },
    onError: (error, variables, context) => {
      handleToastError(error, "Failed to restore user.");
      options?.onError?.(error, variables, context);
    },
  });
}
