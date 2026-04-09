import { AuthContext } from "../hooks/useAuthContext";
import useAuthUser from "../hooks/auth/useFetchAuthUser";
import PageLoader from "../components/common/PageLoader";

export function AuthProvider({ children }) {
  const { isLoading, authUser } = useAuthUser();

  if (isLoading) return <PageLoader />;

  return (
    <AuthContext.Provider value={{ authUser }}>{children}</AuthContext.Provider>
  );
}
