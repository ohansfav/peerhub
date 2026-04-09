import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  handleToastError,
  handleToastSuccess,
} from "../../utils/toastDisplayHandler";
import { createTutor } from "../../lib/api/tutor/tutorApi";

const useCreateTutor = () => {
  const queryClient = useQueryClient();

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  const { mutate, isPending, error } = useMutation({
    mutationFn: createTutor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      handleToastSuccess("Profile created.");
    },
    onError: (error) => {
      const responseData = error.response?.data;
      if (Array.isArray(responseData?.error)) {
        // Validation (field) errors
        const errors = {};
        responseData.error.forEach((err) => {
          errors[err.field] = err.issue;
        });
        setFieldErrors(errors);
        handleToastError(error);
      } else {
        // General error
        const msg = responseData?.message || "An error occurred.";
        setGeneralError(msg);
        handleToastError(error);
      }
    },
  });

  const clearErrors = () => {
    setFieldErrors({});
    setGeneralError("");
  };

  return {
    error,
    isPending,
    createTutorMutation: mutate,
    fieldErrors,
    generalError,
    clearErrors,
  };
};

export default useCreateTutor;
