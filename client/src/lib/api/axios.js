import axios from "axios";
import qs from "qs";

const BASE_URL = import.meta.env.VITE_API_URL;

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: "repeat" }),
  // "repeat" -> status=confirmed&status=completed
  // "brackets" -> status[]=confirmed&status[]=completed
  // "comma" -> status=confirmed,completed
});
