import { useQuery } from "@tanstack/react-query";
import { getUserCounts } from "../../lib/api/admin/admin";

export const USER_COUNTS_QUERY_KEY = ["admin", "userCounts"];

export function useUserCounts(options = {}) {
  return useQuery({
    queryKey: USER_COUNTS_QUERY_KEY,
    queryFn: getUserCounts,
    ...options,
  });
}
