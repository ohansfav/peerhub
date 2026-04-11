import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUser } from "../../lib/api/admin/admin";
import { handleToastError, handleToastSuccess } from "../../utils/toastDisplayHandler";
import { USERS_QUERY_KEY } from "./useUsers";
import { buildAdminUserQueryKey } from "./useAdminUser";

export function useUpdateUser(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }) => updateUser(userId, data),
    onSuccess: (data, { userId }, context) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: buildAdminUserQueryKey(userId),
        });
      }
      handleToastSuccess("User updated successfully.");
      options?.onSuccess?.(data, userId, context);
    },
    onError: (error, variables, context) => {
      handleToastError(error, "Failed to update user.");
      options?.onError?.(error, variables, context);
    },
  });
}
