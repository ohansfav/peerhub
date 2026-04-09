import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../useAuthContext";
import { getUserProfile } from "../../lib/api/user/userApi";

export function useUserProfile() {
  const { authUser } = useAuth();

  return useQuery({
    queryKey: ["userProfile"],
    queryFn: getUserProfile,
    enabled: !!authUser, // fetch if authenticated at all
    staleTime: 1000 * 60 * 10, // 10 mins
    cacheTime: 1000 * 60 * 30, // 30 mins
  });
}
