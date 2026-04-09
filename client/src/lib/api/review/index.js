import { axiosInstance } from "../axios";

export const createReview = async (reviewData) => {
  const response = await axiosInstance.post("/reviews", reviewData);
  return response.data.data;
};
