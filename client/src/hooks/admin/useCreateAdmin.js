import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { createAdmin } from "../../lib/api/admin/admin";
import {
  handleToastError,
  handleToastSuccess,
} from "../../utils/toastDisplayHandler";
import { ADMINS_QUERY_KEY } from "./useAdmins";

export function useCreateAdmin(options = {}) {
  const queryClient = useQueryClient();
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  const mutation = useMutation({
    mutationFn: createAdmin,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ADMINS_QUERY_KEY });
      handleToastSuccess("Admin created successfully.");
      setFieldErrors({});
      setGeneralError("");
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      const responseData = error.response?.data;
      if (Array.isArray(responseData?.error)) {
        const errors = {};
        responseData.error.forEach((err) => {
          errors[err.field] = err.issue;
        });
        setFieldErrors(errors);
      } else {
        setGeneralError(responseData?.message || "An error occurred.");
      }
      handleToastError(error);
      options?.onError?.(error, variables, context);
    },
  });

  const clearErrors = () => {
    setFieldErrors({});
    setGeneralError("");
  };

  const clearFieldError = (fieldName) => {
    if (!fieldName) return;
    setFieldErrors((prev) => {
      if (!prev[fieldName]) return prev;
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  };

  const clearGeneralError = () => {
    setGeneralError("");
  };

  return {
    ...mutation,
    fieldErrors,
    generalError,
    clearErrors,
    clearFieldError,
    clearGeneralError,
  };
}
