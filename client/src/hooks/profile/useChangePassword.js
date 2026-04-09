import { useMutation } from "@tanstack/react-query";
import { changeUserPassword } from "../../lib/api/user/userApi";

export const useChangePassword = () => {
  return useMutation({
    mutationFn: changeUserPassword,
  });
};
