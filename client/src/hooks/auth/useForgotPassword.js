import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "../../lib/api/auth/authApi";
import { useState } from "react";
import {
  handleToastError,
  handleToastSuccess,
} from "../../utils/toastDisplayHandler";

const useForgotPassword = () => {
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [retryAfter, setRetryAfter] = useState(null);

  const { mutate, isPending, error, isSuccess } = useMutation({
    mutationFn: forgotPassword,
    onSuccess: () => {
      handleToastSuccess("Password reset link sent to your email!");
      setRetryAfter(null);
    },
    onError: (error) => {
      const responseData = error.response?.data;

      // Rate limiting handling
      if (error.response?.status === 429 && responseData?.retryAfter) {
        setRetryAfter(responseData.retryAfter);
        setGeneralError(
          responseData?.message ||
            "Too many requests. Please wait before trying again."
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
        const msg = responseData?.error || "An error occurred.";
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
    isSuccess,
    forgotPasswordMutation: mutate,
    fieldErrors,
    generalError,
    clearErrors,
    retryAfter,
    setRetryAfter,
  };
};

export default useForgotPassword;
