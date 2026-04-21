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

// Tutor uploaded courses
export const getTutorUploadedCourses = async () => {
  const response = await axiosInstance.get("/course/tutor/my-courses");
  return response.data.data;
};

export const uploadTutorCourse = async (courseData) => {
  const formData = new FormData();

  formData.append("courseCode", courseData.courseCode);
  formData.append("title", courseData.title);
  formData.append("description", courseData.description || "");
  formData.append("creditUnits", String(courseData.creditUnits || 3));
  formData.append("level", courseData.level);
  formData.append("semester", courseData.semester);
  formData.append("isActive", String(courseData.isActive ?? true));

  if (courseData.materialFile) {
    formData.append("file", courseData.materialFile);
  }

  const response = await axiosInstance.post("/course/tutor/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data;
};

export const deleteTutorUploadedCourse = async (courseId) => {
  const response = await axiosInstance.delete(`/course/tutor/${courseId}`);
  return response.data.data;
};
