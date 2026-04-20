import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  handleToastError,
  handleToastSuccess,
} from "../../utils/toastDisplayHandler";
import { logout } from "../../lib/api/auth/authApi";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const {
    mutate: logoutMutation,
    isPending,
    error,
  } = useMutation({
    mutationFn: logout,
    onMutate: () => {
      setIsLoggingOut(true);
    },
    onSuccess: async () => {
      const { disconnectStreamClients } = await import(
        "../../lib/stream/streamClientManager"
      );
      await disconnectStreamClients();
      queryClient.removeQueries({ queryKey: ["streamToken"] });
      queryClient.removeQueries({ queryKey: ["userProfile"] });
      queryClient.setQueryData(["authUser"], null); // Set to null immediately

      // Navigate and show toast
      navigate("/login", { replace: true });
      handleToastSuccess("Logout successful! See you next time!");
      setIsLoggingOut(false);
    },
    onError: (error) => {
      handleToastError(error);
      setIsLoggingOut(false);
    },
  });

  return { logoutMutation, isPending: isPending || isLoggingOut, error };
};
export default useLogout;
