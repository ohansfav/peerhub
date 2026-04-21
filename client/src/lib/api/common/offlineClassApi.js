import { axiosInstance } from "../axios";

const shouldTryLegacyApiPrefixFallback = () => {
  const baseURL = String(axiosInstance?.defaults?.baseURL || "");
  return !/\/api\/?$/i.test(baseURL);
};

const withApiFallback = async (requestFn, fallbackFn) => {
  try {
    return await requestFn();
  } catch (error) {
    if (error?.response?.status === 404 && shouldTryLegacyApiPrefixFallback()) {
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

export const getOfflineClassParticipantFrame = async (classId) => {
  const { data } = await withApiFallback(
    () => axiosInstance.get(`/offline-class/${classId}/participant-frame`),
    () => axiosInstance.get(`/api/offline-class/${classId}/participant-frame`),
  );
  return data.data;
};

export const updateOfflineClassParticipantFrame = async ({
  classId,
  frameDataUrl,
}) => {
  const { data } = await withApiFallback(
    () =>
      axiosInstance.post(`/offline-class/${classId}/participant-frame`, {
        frameDataUrl,
      }),
    () =>
      axiosInstance.post(`/api/offline-class/${classId}/participant-frame`, {
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

export const getOfflineClassChatState = async (classId) => {
  const { data } = await withApiFallback(
    () => axiosInstance.get(`/offline-class/${classId}/chat/state`),
    () => axiosInstance.get(`/api/offline-class/${classId}/chat/state`),
  );
  return data.data;
};

export const sendOfflineClassChatMessage = async ({ classId, text, imageDataUrl, audioDataUrl }) => {
  const { data } = await withApiFallback(
    () =>
      axiosInstance.post(`/offline-class/${classId}/chat/message`, {
        text,
        imageDataUrl,
        audioDataUrl,
      }),
    () =>
      axiosInstance.post(`/api/offline-class/${classId}/chat/message`, {
        text,
        imageDataUrl,
        audioDataUrl,
      }),
  );
  return data.data;
};

export const updateOfflineClassChatSettings = async ({
  classId,
  repliesLocked,
  pinnedAnnouncement,
}) => {
  const payload = {};
  if (typeof repliesLocked === "boolean") {
    payload.repliesLocked = repliesLocked;
  }
  if (pinnedAnnouncement !== undefined) {
    payload.pinnedAnnouncement = pinnedAnnouncement;
  }

  const { data } = await withApiFallback(
    () => axiosInstance.patch(`/offline-class/${classId}/chat/settings`, payload),
    () => axiosInstance.patch(`/api/offline-class/${classId}/chat/settings`, payload),
  );
  return data.data;
};

export const heartbeatOfflineClassChatPresence = async (classId) => {
  const { data } = await withApiFallback(
    () => axiosInstance.post(`/offline-class/${classId}/chat/presence`),
    () => axiosInstance.post(`/api/offline-class/${classId}/chat/presence`),
  );
  return data.data;
};

export const getOfflineClassRecordings = async (classId) => {
  const { data } = await withApiFallback(
    () => axiosInstance.get(`/offline-class/${classId}/chat/recordings`),
    () => axiosInstance.get(`/api/offline-class/${classId}/chat/recordings`),
  );
  return data.data;
};

export const uploadOfflineClassRecording = async ({
  classId,
  audioDataUrl,
  mimeType,
  fileName,
  title,
  durationSeconds,
}) => {
  const payload = {
    audioDataUrl,
    mimeType,
    fileName,
    title,
    durationSeconds,
  };

  const { data } = await withApiFallback(
    () => axiosInstance.post(`/offline-class/${classId}/chat/recordings`, payload),
    () => axiosInstance.post(`/api/offline-class/${classId}/chat/recordings`, payload),
  );
  return data.data;
};

export const renameOfflineClassRecording = async ({ classId, recordingId, title }) => {
  const { data } = await withApiFallback(
    () =>
      axiosInstance.patch(`/offline-class/${classId}/chat/recordings/${recordingId}`, {
        title,
      }),
    () =>
      axiosInstance.patch(`/api/offline-class/${classId}/chat/recordings/${recordingId}`, {
        title,
      }),
  );
  return data.data;
};

export const deleteOfflineClassRecording = async ({ classId, recordingId }) => {
  const { data } = await withApiFallback(
    () => axiosInstance.delete(`/offline-class/${classId}/chat/recordings/${recordingId}`),
    () => axiosInstance.delete(`/api/offline-class/${classId}/chat/recordings/${recordingId}`),
  );
  return data.data;
};
