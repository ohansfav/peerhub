import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteUser } from "../../lib/api/admin/admin";
import { handleToastError, handleToastSuccess } from "../../utils/toastDisplayHandler";
import { USERS_QUERY_KEY } from "./useUsers";
import { USER_COUNTS_QUERY_KEY } from "./useUserCounts";

export function useDeleteUser(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId) => deleteUser(userId),
    onSuccess: (data, userId, context) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: USER_COUNTS_QUERY_KEY });
      handleToastSuccess("User deleted successfully.");
      options?.onSuccess?.(data, userId, context);
    },
    onError: (error, variables, context) => {
      handleToastError(error, "Failed to delete user.");
      options?.onError?.(error, variables, context);
    },
  });
}
