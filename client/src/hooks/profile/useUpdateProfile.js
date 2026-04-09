import { useMutation } from "@tanstack/react-query";
import { updateUserProfile } from "../../lib/api/user/userApi";

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: updateUserProfile,
  });
};
