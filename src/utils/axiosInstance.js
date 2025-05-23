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

// Optional: Add a response interceptor to handle 401/403 errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      // Token expired or invalid. Perform logout actions.
      localStorage.removeItem("token");
      // Dispatch Redux logout action if you have one
      // store.dispatch(logout()); // You'd need to import your store here
      // Redirect to login page
      // window.location.href = '/login'; // Or use react-router-dom's navigate
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
