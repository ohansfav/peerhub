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
    onSuccess: async (loginData) => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      handleToastSuccess("Login successful! Welcome back!");
      setRetryAfter(null);

      // Prefer canonical auth response. Do not block login flow on profile prefetch.
      const resolvedUser = loginData;

      // Warm profile cache in background; failures here should not break login UX.
      queryClient
        .prefetchQuery({
          queryKey: ["userProfile"],
          queryFn: getUserProfile,
        })
        .catch(() => {});

      if (!resolvedUser) return;

      if (!resolvedUser.isOnboarded || !resolvedUser.role) {
        window.location.href = "/role-selection";
      } else if (resolvedUser.role === "student") {
        window.location.href = "/student/dashboard";
      } else if (resolvedUser.role === "tutor") {
        window.location.href = "/tutor/dashboard";
      } else if (resolvedUser.role === "admin") {
        try {
          const { getAdminDashboardSummary } = await import(
            "../../lib/api/admin/admin"
          );

          await queryClient.prefetchQuery({
            queryKey: ["admin", "dashboardSummary"],
            queryFn: getAdminDashboardSummary,
          });
        } catch {
          // Ignore prefetch issues and continue to dashboard.
        }

        window.location.href = "/admin/dashboard";
      }
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
