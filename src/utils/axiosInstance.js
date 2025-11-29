import axios from "axios";

const axiosInstance = axios.create({
  // Use a relative URL for the API base.
  // This will be prefixed to all requests and allows the Vite proxy
  // to intercept them during development.
  baseURL: "/api",
});

// --- FIX STARTS HERE ---
// Add a request interceptor to include the token in all requests.
axiosInstance.interceptors.request.use(
  (config) => {
    // Get the authentication token from localStorage.
    // Make sure the key 'authToken' matches what you use when saving the token on login.
    const token = localStorage.getItem("authToken");

    // If a token exists, add it to the Authorization header.
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);
// --- FIX ENDS HERE ---

// export default axiosInstance;

export default axiosInstance;

// *************************NEW CODE**************************
// import axios from "axios";

// const axiosInstance = axios.create({
//   // Point to your live Heroku backend
//   baseURL: "https://ninebyfourapi.herokuapp.com/api",
// });

// // Add a request interceptor to include the token in all requests.
// axiosInstance.interceptors.request.use(
//   (config) => {
//     // Get the authentication token from localStorage.
//     const token = localStorage.getItem("authToken");

//     // If a token exists, add it to the Authorization header.
//     if (token) {
//       config.headers["Authorization"] = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => {
//     // Do something with request error
//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;
// VITE_API_URL=https://ninebyfourapi.herokuapp.com/api

// import axios from "axios";

// const axiosInstance = axios.create({
//   // Point to your live Heroku backend
//   baseURL:
//     import.meta.env.VITE_API_URL || "https://ninebyfourapi.herokuapp.com/api",
// });

// // Add a request interceptor to include the token in all requests.
// axiosInstance.interceptors.request.use(
//   (config) => {
//     // Get the authentication token from localStorage.
//     const token = localStorage.getItem("authToken");

//     // If a token exists, add it to the Authorization header.
//     if (token) {
//       config.headers["Authorization"] = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => {
//     // Do something with request error
//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;
// ```

// **Now try logging in with:**
// - Username: `andrefullstack`
// - Password: `Test1234` (or whatever password you just set in Heroku)

// This should work now because it's actually connecting to your Heroku backend! 🚀

// If you want to use environment variables, create a `.env` file in your frontend root:
// ```
// VITE_API_URL=https://ninebyfourapi.herokuapp.com/api
