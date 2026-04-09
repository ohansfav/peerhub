import { axiosInstance } from "../axios";

export const getSubjects = async () => {
  const response = await axiosInstance.get("/subject");
  return response.data.data;
};
export const getExams = async () => {
  const response = await axiosInstance.get("/exam");
  return response.data.data;
};
