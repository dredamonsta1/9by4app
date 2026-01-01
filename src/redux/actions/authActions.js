// src/redux/actions/authActions.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

export const loadUserFromToken = createAsyncThunk(
  "auth/loadUser",
  async (_, { rejectWithValue }) => {
    try {
      // FIX: Use the SAME key as your slice ("token", not "authToken")
      const token = localStorage.getItem("token");

      if (!token) return rejectWithValue("No token found");

      // The interceptor handles the Bearer header
      const response = await axiosInstance.get("/users/profile");

      // Return both user and token to the slice's fulfilled case
      return {
        user: response.data.user,
        token: token,
      };
    } catch (error) {
      // If the API returns a 401, this will trigger the 'rejected' case in the slice
      return rejectWithValue(
        error.response?.data?.message || "Session expired"
      );
    }
  }
);
