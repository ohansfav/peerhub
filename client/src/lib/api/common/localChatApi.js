import { axiosInstance } from "../axios";

export const getLocalConversations = async () => {
  const { data } = await axiosInstance.get("/local-chat/conversations");
  return data.data;
};

export const getLocalThread = async (userId) => {
  const { data } = await axiosInstance.get(`/local-chat/thread/${userId}`);
  return data.data;
};

export const sendLocalMessage = async ({ userId, text }) => {
  const { data } = await axiosInstance.post(`/local-chat/thread/${userId}`, {
    text,
  });
  return data.data;
};

export const markLocalThreadRead = async (userId) => {
  await axiosInstance.patch(`/local-chat/thread/${userId}/read`);
};
