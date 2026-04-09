import { axiosInstance } from "../axios";

export const getUserProfile = async () => {
  const response = await axiosInstance.get("/user");
  return response.data.data;
};

export const updateUserProfile = async ({ userId, data }) => {
  const response = await axiosInstance.patch(`/user/${userId}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const updateStudentProfile = async ({ studentId, data }) => {
  const response = await axiosInstance.put(`/student/${studentId}`, data);
  return response.data;
};

export const updateTutorProfile = async ({ tutorId, data }) => {
  const response = await axiosInstance.put(`/tutor/${tutorId}`, data);
  return response.data;
};

export const changeUserPassword = async (passwordData) => {
  const response = await axiosInstance.put(
    "/auth/change-password",
    passwordData
  );
  return response.data;
};
