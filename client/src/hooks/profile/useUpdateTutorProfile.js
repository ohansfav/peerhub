import { useMutation } from "@tanstack/react-query";
import { updateTutorProfile } from "../../lib/api/user/userApi";

export const useUpdateTutorProfile = () => {
  return useMutation({
    mutationFn: updateTutorProfile,
  });
};
