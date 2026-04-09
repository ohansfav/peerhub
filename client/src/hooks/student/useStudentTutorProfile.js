import { useQuery } from "@tanstack/react-query";
import { getTutorProfile } from "../../lib/api/tutor/tutorApi";

export function useStudentTutorProfile(tutorId) {
  return useQuery({
    queryKey: ["tutorProfile", tutorId],
    queryFn: () => getTutorProfile(tutorId),
    enabled: !!tutorId,
    staleTime: 1000 * 60 * 5, // 5 mins
    cacheTime: 1000 * 60 * 10, // 10 mins
  });
}
