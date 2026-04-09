import { useQuery } from "@tanstack/react-query";
import { getSubjects } from "../lib/api/common/subjectsApi";

export default function useSubjects() {
  const {
    data: subjects,
    isLoading: subjectLoading,
    error: subjectError,
  } = useQuery({
    queryKey: ["subjects"],
    queryFn: getSubjects,
    staleTime: Infinity,
    cacheTime: 1000 * 60 * 60, // 1 hour in memory
  });

  return {
    subjects,
    subjectLoading,
    subjectError,
  };
}
