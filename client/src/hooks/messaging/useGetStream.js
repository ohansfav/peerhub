import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../../lib/api/common/getStreamApi";

export function useGetStreamToken(authUser) {
  return useQuery({
    queryKey: ["streamToken", authUser?.id],
    queryFn: getStreamToken,
    enabled: !!authUser,
    staleTime: 55 * 60 * 1000, // 55 min cache for 1h tokens
  });
}
