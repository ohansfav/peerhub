import { useQuery } from "@tanstack/react-query";
import {
  getTutorReviews,
  getTutorReviewSummary,
} from "../../lib/api/tutor/tutorApi";
import { useUserProfile } from "../profile/useUserProfile";
import { useStudentTutorProfile } from "../student/useStudentTutorProfile";

export function useStudentTutorPage(id) {
  const profileQuery = useStudentTutorProfile(id);

  const reviewsQuery = useTutorReviews(id);

  // const reviewSummaryQuery = useTutorReviewSummary(id);

  return {
    profile: profileQuery.data,
    reviews: reviewsQuery.data,
    // reviewSummary: reviewSummaryQuery.data,
    isLoadingProfileQuery: profileQuery.isLoading,
    isLoadingReviewsQuery: !id || reviewsQuery.isLoading,
    isLoadingReviewSummaryQuery: !id,
    // || reviewSummaryQuery.isLoading,
    isLoading: profileQuery.isLoading || reviewsQuery.isLoading || !id,
    // || reviewSummaryQuery.isLoading,
    isErrorUser: profileQuery.isError,
    error: profileQuery.error || reviewsQuery.error,
    // || reviewSummaryQuery.error,
    errorProfileQuery: profileQuery.error,
    errorReviewsQuery: reviewsQuery.error,
    // errorReviewSummaryQuery: reviewSummaryQuery.error,
  };
}

export function usePrivateTutorProfile() {
  const profileQuery = useUserProfile();

  const id = profileQuery.data?.id;

  const reviewsQuery = useTutorReviews(id);

  // const reviewSummaryQuery = useTutorReviewSummary(id);

  return {
    profile: profileQuery.data,
    reviews: reviewsQuery.data,
    // reviewSummary: reviewSummaryQuery.data,
    isLoadingProfileQuery: profileQuery.isLoading,
    isLoadingReviewsQuery: !id || reviewsQuery.isLoading,
    isLoadingReviewSummaryQuery: !id,
    // || reviewSummaryQuery.isLoading,
    isLoading: profileQuery.isLoading || reviewsQuery.isLoading || !id,
    // || reviewSummaryQuery.isLoading,
    isErrorUser: profileQuery.isError,
    error: profileQuery.error || reviewsQuery.error,
    // || reviewSummaryQuery.error,
    errorProfileQuery: profileQuery.error,
    errorReviewsQuery: reviewsQuery.error,
    // errorReviewSummaryQuery: reviewSummaryQuery.error,
  };
}

export function useTutorDashboard() {
  let id;

  const profileQuery = useUserProfile();

  id = profileQuery.data?.id;

  // const reviewSummaryQuery = useTutorReviewSummary(id);

  return {
    profile: profileQuery.data,
    // reviewSummary: reviewSummaryQuery.data,
    isLoadingProfileQuery: profileQuery.isLoading,
    isLoadingReviewSummaryQuery: !id,
    // || reviewSummaryQuery.isLoading,
    isLoading: profileQuery.isLoading || !id,
    // || reviewSummaryQuery.isLoading,
    isErrorUser: profileQuery.isError,
    error: profileQuery.error,
    // || reviewSummaryQuery.error,
    errorProfileQuery: profileQuery.error,
    // errorReviewSummaryQuery: reviewSummaryQuery.error,
  };
}

export function useTutorReviewSummary(tutorId) {
  return useQuery({
    queryKey: ["tutorReviewSummary", tutorId],
    queryFn: () => getTutorReviewSummary(tutorId),
    enabled: !!tutorId,
    staleTime: 1000 * 60 * 5, // 5 mins
    // cacheTime: 1000 * 60 * 10, // 10 mins
    // placeholderData: {
    //   totalReviews: 0,
    //   averageRating: 0,
    //   breakdown: [5, 4, 3, 2, 1].map((stars) => ({ stars, percent: 0 })),
    // },
  });
}

export function useTutorReviews(tutorId) {
  return useQuery({
    queryKey: ["tutorReviews", tutorId],
    queryFn: () => getTutorReviews(tutorId),
    enabled: !!tutorId,
    staleTime: 1000 * 60 * 5, // 5 mins
    cacheTime: 1000 * 60 * 10, // 10 mins
  });
}
