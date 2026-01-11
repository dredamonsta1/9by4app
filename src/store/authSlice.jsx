// src/store/authSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { loadUserFromToken } from "../redux/actions/authActions";

const persistedToken = localStorage.getItem("token");

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null, // Don't persist the user object, only the token
    token: persistedToken,
    isLoggedIn: !!persistedToken,
    status: "idle", // Start at idle. Let the useEffect/Thunk set it to loading.
    error: null,
  },

  reducers: {
    setCredentials: (state, action) => {
      // High-level tip: Use optional chaining and fallback to ensure user exists
      state.user = action.payload.user || null;
      state.token = action.payload.token || state.token;
      state.status = "succeeded"; // This kills the "Verifying..." screen
      state.isLoggedIn = !!state.user;

      if (action.payload.token) {
        localStorage.setItem("token", action.payload.token);
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
      state.status = "idle";
      localStorage.removeItem("token");
      // Clean up the "user" corpse from storage if it still exists
      localStorage.removeItem("user");
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loadUserFromToken.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loadUserFromToken.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        // Ensure action.payload matches your backend response
        state.isLoggedIn = true;
        state.error = null;
      })
      .addCase(loadUserFromToken.rejected, (state, action) => {
        state.status = "failed";
        state.user = null;
        state.token = null;
        state.isLoggedIn = false;
        state.error = action.error.message;
        localStorage.removeItem("token");
      });
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
