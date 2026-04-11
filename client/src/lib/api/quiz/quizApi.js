import { axiosInstance } from "../axios";

export const getQuizzes = async () => {
  const response = await axiosInstance.get("/quiz");
  return response.data.data;
};

export const getQuizById = async (id) => {
  const response = await axiosInstance.get(`/quiz/${id}`);
  return response.data.data;
};

export const createQuiz = async (quizData) => {
  const response = await axiosInstance.post("/quiz", quizData);
  return response.data.data;
};

export const updateQuiz = async (id, quizData) => {
  const response = await axiosInstance.put(`/quiz/${id}`, quizData);
  return response.data.data;
};

export const deleteQuiz = async (id) => {
  const response = await axiosInstance.delete(`/quiz/${id}`);
  return response.data;
};

export const submitQuiz = async (id, answers) => {
  const response = await axiosInstance.post(`/quiz/${id}/submit`, { answers });
  return response.data.data;
};

export const getStudentStats = async () => {
  const response = await axiosInstance.get("/student-stats");
  return response.data.data;
};
