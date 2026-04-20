import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  handleToastError,
  handleToastSuccess,
} from "../../utils/toastDisplayHandler";
import { createTutor } from "../../lib/api/tutor/tutorApi";
import { getAuthUser } from "../../lib/api/auth/authApi";

const useCreateTutor = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  const { mutate, isPending, error } = useMutation({
    mutationFn: createTutor,
    onSuccess: async () => {
      // Fetch fresh auth user data after onboarding
      await queryClient.invalidateQueries({ queryKey: ["authUser"] });
      const updatedUser = await queryClient.fetchQuery({
        queryKey: ["authUser"],
        queryFn: getAuthUser,
        retry: false,
      });

      handleToastSuccess("Profile created.");

      if (updatedUser && updatedUser.role === "tutor" && updatedUser.isOnboarded) {
        navigate("/tutor/dashboard", { replace: true });
      } else {
        navigate("/role-selection", { replace: true });
      }
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
