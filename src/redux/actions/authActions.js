// // src/redux/actions/authActions.js
// import { createAsyncThunk } from "@reduxjs/toolkit";
// import axiosInstance from "../../utils/axiosInstance";

// export const loadUserFromToken = createAsyncThunk(
//   "auth/loadUser",
//   async (_, { rejectWithValue }) => {
//     try {
//       // FIX: Use the SAME key as your slice ("token", not "authToken")
//       const token = localStorage.getItem("token");

//       if (!token) return rejectWithValue("No token found");

//       // The interceptor handles the Bearer header
//       const response = await axiosInstance.get("/users/profile");

//       // Return both user and token to the slice's fulfilled case
//       return {
//         user: response.data.user,
//         token: token,
//       };
//     } catch (error) {
//       // If the API returns a 401, this will trigger the 'rejected' case in the slice
//       return rejectWithValue(
//         error.response?.data?.message || "Session expired"
//       );
//     }
//   }
// );

// ***************************New Code Below*************************** //

import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

// export const loadUserFromToken = createAsyncThunk(
//   "auth/loadUser",
//   async (_, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) return rejectWithValue("No token found");

//       // The interceptor in axiosInstance.js automatically handles the Bearer header
//       const response = await axiosInstance.get("/users/me");

//       // Return the user data directly.
//       // The token is already in localStorage and state.
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || "Session expired"
//       );
//     }
//   }
// );
// src/redux/actions/authActions.js
export const loadUserFromToken = createAsyncThunk(
  "auth/loadUser",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return rejectWithValue("No token found");

      // Use /users/me - it's our stabilized endpoint
      const response = await axiosInstance.get("/users/me");

      // Return ONLY the user data. The slice already has the token.
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Session expired"
      );
    }
  }
);

// Load the requester's album purchases. Used to flip artist-page buy
// buttons to "Download" for already-owned albums and to render the
// Library page.
export const loadPurchases = createAsyncThunk(
  "auth/loadPurchases",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return rejectWithValue("No token");
      const response = await axiosInstance.get("/users/me/purchases");
      return response.data?.purchases ?? [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load purchases"
      );
    }
  }
);

// Load the requester's own artist claim requests. Used to render the
// "Claim pending review" disabled state on artist pages and the
// pending-status block on the dashboard/settings empty state.
export const loadPendingClaims = createAsyncThunk(
  "auth/loadPendingClaims",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return rejectWithValue("No token");
      const response = await axiosInstance.get("/users/me/claim-requests");
      const requests = response.data?.claim_requests ?? [];
      return requests;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load claim requests"
      );
    }
  }
);
