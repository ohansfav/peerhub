import { useMutation } from "@tanstack/react-query";
import { updateStudentProfile } from "../../lib/api/user/userApi";

export const useUpdateStudentProfile = () => {
  return useMutation({
    mutationFn: updateStudentProfile,
  });
};
