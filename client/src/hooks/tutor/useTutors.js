import { useQuery } from "@tanstack/react-query";
import { getTutors } from "../../lib/api/tutor/tutorApi";

export const useTutors = (searchQuery, filters, page = 1, limit = 12) => {
  return useQuery({
    queryKey: ["tutors", searchQuery, filters, page, limit],
    queryFn: () =>
      getTutors({
        search: searchQuery || undefined,
        subjects: filters.subjects.length ? filters.subjects : undefined,
        ratings: filters.ratings.length ? filters.ratings : undefined,
        page,
        limit,
      }),
    keepPreviousData: true, // Keeps old data while fetching new page
  });
};
