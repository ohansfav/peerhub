import { useMutation, useQueryClient } from "@tanstack/react-query";
import { verifyEmail } from "../../lib/api/auth/authApi";
import { useState } from "react";
import {
  handleToastError,
  handleToastSuccess,
} from "../../utils/toastDisplayHandler";

const useVerifyEmail = () => {
  const queryClient = useQueryClient();

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [retryAfter, setRetryAfter] = useState(null);

  const { mutate, isPending, error, isSuccess } = useMutation({
    mutationFn: verifyEmail,
    onSuccess: () => {
      handleToastSuccess("Email verified successfully! Welcome aboard!");
      setRetryAfter(null);
    },
    onError: (error) => {
      const responseData = error.response?.data;

      // rate limiting error handling
      if (error.response?.status === 429 && responseData?.retryAfter) {
        setRetryAfter(responseData.retryAfter);
        setGeneralError(
          responseData?.message ||
            "Too many attempts. Please wait before trying again."
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

  const invalidateQuery = async () => {
    await queryClient.refetchQueries({ queryKey: ["authUser"] });
  };

  return {
    error,
    isPending,
    isSuccess,
    verifyEmailMutation: mutate,
    fieldErrors,
    generalError,
    clearErrors,
    retryAfter,
    setRetryAfter,
    invalidateQuery,
  };
};

export default useVerifyEmail;
