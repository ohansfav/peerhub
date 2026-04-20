import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  handleToastError,
  handleToastSuccess,
} from "../../utils/toastDisplayHandler";
import { createStudent } from "../../lib/api/student/studentApi";

const useCreateStudent = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  const { mutate, isPending, error } = useMutation({
    mutationFn: createStudent,
    onSuccess: async () => {
      // Invalidate auth user data and wait for refetch
      await queryClient.invalidateQueries({ queryKey: ["authUser"] });
      
      // Wait for the auth user query to refetch
      await queryClient.refetchQueries({ queryKey: ["authUser"] });
      
      // Get the updated user data
      const updatedUser = queryClient.getQueryData(["authUser"]);
      
      handleToastSuccess("Profile created.");
      
      // Check if user has proper permissions before navigating
      if (updatedUser && updatedUser.role === 'student' && updatedUser.isOnboarded) {
        window.location.href = "/student/dashboard";
      } else {
        window.location.href = "/role-selection";
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
    createStudentMutation: mutate,
    fieldErrors,
    generalError,
    clearErrors,
  };
};

export default useCreateStudent;
