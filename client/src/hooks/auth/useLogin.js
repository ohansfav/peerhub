import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../../lib/api/auth/authApi";
import { useState } from "react";
import {
  handleToastError,
  handleToastSuccess,
} from "../../utils/toastDisplayHandler";
import { getUserProfile } from "../../lib/api/user/userApi";

const useLogin = () => {
  const queryClient = useQueryClient();

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [retryAfter, setRetryAfter] = useState(null);

  const { mutate, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: async () => {
      await queryClient.prefetchQuery({
        queryKey: ["userProfile"],
        queryFn: getUserProfile,
      });
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      handleToastSuccess("Login successful! Welcome back!");
      setRetryAfter(null);
    },
    onError: (error) => {
      const responseData = error.response?.data;

      if (error.response?.status === 429 && responseData?.retryAfter) {
        setRetryAfter(responseData.retryAfter);
        setGeneralError(
          responseData?.message ||
            "Too many login attempts. Please wait before trying again."
        );
        handleToastError(error);
        return;
      }

      if (Array.isArray(responseData?.error)) {
        // Validation (field) errors
        const errors = {};
        responseData.error.forEach((err) => {
          errors[err.field] = err.issue;
        });
        setFieldErrors(errors);
      } else {
        // General error
        const msg = responseData?.message || "An error occurred.";
        setGeneralError(msg);
      }
      handleToastError(error);
    },
  });

  const clearErrors = () => {
    setFieldErrors({});
    setGeneralError("");
  };

  return {
    error,
    isPending,
    loginMutation: mutate,
    fieldErrors,
    generalError,
    clearErrors,
    retryAfter,
    setRetryAfter,
  };
};

export default useLogin;
