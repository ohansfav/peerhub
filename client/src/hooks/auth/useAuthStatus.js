import { useAuth } from "../useAuthContext";

const useAuthStatus = () => {
  const { authUser } = useAuth();
  const isAuthenticated = !!authUser;

  const roleLink =
    authUser?.role === "tutor"
      ? "/tutor"
      : authUser?.role === "student"
      ? "/student"
      : "/admin";

  return { isAuthenticated, roleLink, authUser };
};

export default useAuthStatus;
