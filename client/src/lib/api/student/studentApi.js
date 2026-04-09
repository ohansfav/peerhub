import { axiosInstance } from "../axios";

export const createStudent = async (data) => {
  const response = await axiosInstance.post("/student", data);
  return response.data.data;
};
