import { useQuery } from "@tanstack/react-query";
import { getAllAdmins } from "../../lib/api/admin/admin";

export const ADMINS_QUERY_KEY = ["admins"];

export function useAdmins(options = {}) {
  return useQuery({
    queryKey: ADMINS_QUERY_KEY,
    queryFn: getAllAdmins,
    ...options,
  });
}
