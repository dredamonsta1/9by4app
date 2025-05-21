// src/utils/axiosInstance.js or similar
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://ninebyfourapi.herokuapp.com/api", // Your backend base URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
