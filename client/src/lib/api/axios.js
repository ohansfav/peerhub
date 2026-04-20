import axios from "axios";
import qs from "qs";

const rawBaseUrl = String(import.meta.env.VITE_API_URL || "").trim();

const normalizeApiBaseUrl = (url) => {
  if (!url) return "/api";

  const withoutTrailingSlash = url.replace(/\/+$/, "");
  if (/\/api$/i.test(withoutTrailingSlash)) {
    return withoutTrailingSlash;
  }

  return `${withoutTrailingSlash}/api`;
};

const BASE_URL = normalizeApiBaseUrl(rawBaseUrl);

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: "repeat" }),
  // "repeat" -> status=confirmed&status=completed
  // "brackets" -> status[]=confirmed&status[]=completed
  // "comma" -> status=confirmed,completed
});
