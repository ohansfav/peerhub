import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signup } from "../../lib/api/auth/authApi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  handleToastError,
  handleToastSuccess,
} from "../../utils/toastDisplayHandler";

const useSignUp = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [retryAfter, setRetryAfter] = useState(null);

  const { mutate, isPending } = useMutation({
    mutationFn: signup,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["authUser"] });
      handleToastSuccess("Account created successfully. Please sign in.");
      setRetryAfter(null);
      navigate("/login", { replace: true });
    },
    onError: (error) => {
      const responseData = error.response?.data;

      if (error.response?.status === 429 && responseData?.retryAfter) {
        setRetryAfter(responseData.retryAfter);
        setGeneralError(
          responseData?.message ||
            "Too many signup attempts. Please wait before trying again."
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
    isPending,
    signupMutation: mutate,
    fieldErrors,
    generalError,
    clearErrors,
    retryAfter,
    setRetryAfter,
  };
};

export default useSignUp;
