// // src/utils/axiosInstance.js
// import axios from "axios";

// // Determine base URL: Priority 1 is .env variable, Priority 2 is Heroku, Priority 3 is local proxy
// const BASE_URL =
//   import.meta.env?.VITE_API_URL || "https://ninebyfourapi.herokuapp.com/api";

// const axiosInstance = axios.create({
//   baseURL: BASE_URL,
// });

// axiosInstance.interceptors.request.use(
//   (config) => {
//     // CRITICAL: We changed this to 'token' to match your authSlice logic
//     const token = localStorage.getItem("token");

//     if (token) {
//       config.headers["Authorization"] = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// export default axiosInstance;

// ***************************New Code Below*************************** //

import axios from "axios";
import { logout } from "../store/authSlice";

// We need to import the store to dispatch actions outside of React components
let store;
export const injectStore = (_store) => {
  store = _store;
};

const axiosInstance = axios.create({
  baseURL: "https://ninebyfourapi.herokuapp.com/api",
});

// 1. Request Interceptor: Automatically attach the token to EVERY request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Catch the 401s
axiosInstance.interceptors.response.use(
  (response) => response, // If request is successful, do nothing
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Session expired. Logging out...");

      // Clear the local state
      localStorage.removeItem("token");

      if (store) {
        store.dispatch(logout());
      }

      // Force redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
