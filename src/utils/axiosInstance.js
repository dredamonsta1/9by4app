// src/utils/axiosInstance.js
import axios from "axios";

// Determine base URL: Priority 1 is .env variable, Priority 2 is Heroku, Priority 3 is local proxy
const BASE_URL =
  import.meta.env?.VITE_API_URL || "https://ninebyfourapi.herokuapp.com/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    // CRITICAL: We changed this to 'token' to match your authSlice logic
    const token = localStorage.getItem("token");

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
