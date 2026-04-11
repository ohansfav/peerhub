import { axiosInstance } from "../axios";

export const getBroadcastMessages = async () => {
  const response = await axiosInstance.get("/broadcast");
  return response.data.data;
};

export const createBroadcastMessage = async (data) => {
  const response = await axiosInstance.post("/broadcast", data);
  return response.data.data;
};

export const deleteBroadcastMessage = async (id) => {
  const response = await axiosInstance.delete(`/broadcast/${id}`);
  return response.data;
};
