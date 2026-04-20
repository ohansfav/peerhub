import { useQuery } from "@tanstack/react-query";
import { getUserCounts } from "../../lib/api/admin/admin";

export const USER_COUNTS_QUERY_KEY = ["admin", "userCounts"];

export function useUserCounts(options = {}) {
  return useQuery({
    queryKey: USER_COUNTS_QUERY_KEY,
    queryFn: getUserCounts,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    ...options,
  });
}
