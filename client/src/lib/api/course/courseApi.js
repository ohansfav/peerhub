import { axiosInstance } from "../axios";

// Get all available courses
export const getCourses = async (params = {}) => {
  const response = await axiosInstance.get("/course", { params });
  return response.data;
};

// Get a single course
export const getCourse = async (id) => {
  const response = await axiosInstance.get(`/course/${id}`);
  return response.data.data;
};

// Get student's registered courses
export const getMyCourses = async () => {
  const response = await axiosInstance.get("/course/my-courses");
  return response.data.data;
};

// Register for a course
export const registerCourse = async (courseId) => {
  const response = await axiosInstance.post(`/course/${courseId}/register`);
  return response.data.data;
};

// Drop a course
export const dropCourse = async (courseId) => {
  const response = await axiosInstance.delete(`/course/${courseId}/register`);
  return response.data.data;
};
