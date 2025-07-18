// src/redux/actions/authActions.js
import axiosInstance from "../../utils/axiosInstance";
import { setCredentials, logout } from "../../store/authSlice"; // Assuming this is the correct path to your authSlice

/**
 * Checks for a token in localStorage on app startup.
 * If a token is found, it attempts to fetch the user's profile to log them in automatically.
 * This process is often called "re-hydrating" the auth state.
 */
export const loadUserFromToken = () => async (dispatch) => {
  // Get the token from local storage
  const token = localStorage.getItem("authToken");

  if (token) {
    try {
      // The axios interceptor will automatically add the token to the request header
      const response = await axiosInstance.get("/users/profile");

      // The API sends back { message, user: userProfile }
      const user = response.data.user;

      if (user) {
        // If the user profile is fetched successfully, dispatch setCredentials
        // to re-populate the auth state in your Redux store.
        dispatch(setCredentials({ user, token }));
      } else {
        // If the token is valid but user data isn't returned for some reason, log out.
        dispatch(logout());
      }
    } catch (error) {
      console.error("Failed to fetch user profile with token:", error);
      // This error likely means the token is expired or invalid.
      // Dispatching logout will clear the bad token from state and localStorage.
      // Note: You will need to ensure your `logout` reducer also clears localStorage.
      dispatch(logout());
    }
  }
};
