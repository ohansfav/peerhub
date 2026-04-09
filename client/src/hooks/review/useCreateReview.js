import { useMutation } from "@tanstack/react-query";
import { createReview } from "../../lib/api/review";
import {
  handleToastError,
  handleToastSuccess,
} from "../../utils/toastDisplayHandler";

const useCreateReview = () => {
  const { mutate, isPending, error } = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      handleToastSuccess("Review submitted successfully!");
    },
    onError: (error) => {
      handleToastError(error, "Failed to submit review.");
    },
  });

  return {
    createReviewMutation: mutate,
    isCreatingReview: isPending,
    createReviewError: error,
  };
};

export default useCreateReview;
