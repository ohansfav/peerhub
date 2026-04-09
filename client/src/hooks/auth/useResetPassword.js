import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resetPassword } from "../../lib/api/auth/authApi";
import { useState } from "react";
import {
  handleToastError,
  handleToastSuccess,
} from "../../utils/toastDisplayHandler";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

const useResetPassword = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [retryAfter, setRetryAfter] = useState(null);

  const { mutate, isPending, error, isSuccess } = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      toast.success("Password reset successfully, redirecting to login...", {
        duration: 2000,
      });
      setRetryAfter(null);
      navigate("/login");
    },
    onError: (error) => {
      const responseData = error.response?.data;

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
        const errors = {};
        responseData.error.forEach((err) => {
          errors[err.field] = err.issue;
        });
        setFieldErrors(errors);
      } else {
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
    resetPasswordMutation: mutate,
    fieldErrors,
    generalError,
    clearErrors,
    retryAfter,
    setRetryAfter,
  };
};

export default useResetPassword;
