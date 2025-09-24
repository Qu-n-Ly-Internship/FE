import axios from "axios";
import { useAuthStore } from "../store/authStore";

const api = axios.create({
  baseURL: "http://localhost:8090/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token && token !== "session") {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
