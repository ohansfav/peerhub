import { axiosInstance } from "../axios";

const withApiFallback = async (requestFn, fallbackFn) => {
  try {
    return await requestFn();
  } catch (error) {
    if (error?.response?.status === 404) {
      return fallbackFn();
    }
    throw error;
  }
};

export const startOfflineClass = async (payload) => {
  const { data } = await withApiFallback(
    () => axiosInstance.post("/offline-class/start", payload),
    () => axiosInstance.post("/api/offline-class/start", payload),
  );
  return data.data;
};

export const endOfflineClass = async (classId) => {
  const { data } = await withApiFallback(
    () => axiosInstance.post(`/offline-class/${classId}/end`),
    () => axiosInstance.post(`/api/offline-class/${classId}/end`),
  );
  return data.data;
};

export const getOfflineClassById = async (classId) => {
  const { data } = await withApiFallback(
    () => axiosInstance.get(`/offline-class/${classId}`),
    () => axiosInstance.get(`/api/offline-class/${classId}`),
  );
  return data.data;
};

export const getOfflineClassFrame = async (classId) => {
  const { data } = await withApiFallback(
    () => axiosInstance.get(`/offline-class/${classId}/frame`),
    () => axiosInstance.get(`/api/offline-class/${classId}/frame`),
  );
  return data.data;
};

export const updateOfflineClassFrame = async ({ classId, frameDataUrl }) => {
  const { data } = await withApiFallback(
    () =>
      axiosInstance.post(`/offline-class/${classId}/frame`, {
        frameDataUrl,
      }),
    () =>
      axiosInstance.post(`/api/offline-class/${classId}/frame`, {
        frameDataUrl,
      }),
  );
  return data.data;
};

export const getActiveOfflineClasses = async () => {
  const { data } = await withApiFallback(
    () => axiosInstance.get("/offline-class/active"),
    () => axiosInstance.get("/api/offline-class/active"),
  );
  return data.data;
};
