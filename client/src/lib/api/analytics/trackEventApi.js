import { axiosInstance } from "../axios";

export async function trackSessionStart(details) {
  const response = await axiosInstance.post("/events/session/started", details);
  return response.data.data;
}

export async function trackSessionCompleted(details) {
  const response = await axiosInstance.post(
    "/events/session/completed",
    details
  );
  return response.data.data;
}
