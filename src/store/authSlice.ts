// src/store/authSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { loadUserFromToken, loadPendingClaims, loadPurchases } from "../redux/actions/authActions";
import type { AuthUser, ClaimRequest, Purchase } from "../types/api";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoggedIn: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null | undefined;
  claimRequests: ClaimRequest[];
  purchases: Purchase[];
}

const persistedToken = localStorage.getItem("token");

const initialState: AuthState = {
  user: null, // Don't persist the user object, only the token
  token: persistedToken,
  isLoggedIn: !!persistedToken,
  status: "idle", // Start at idle. Let the useEffect/Thunk set it to loading.
  error: null,
  claimRequests: [],
  purchases: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,

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
      state.claimRequests = [];
      state.purchases = [];
      localStorage.removeItem("token");
      // Clean up the "user" corpse from storage if it still exists
      localStorage.removeItem("user");
    },
    // Optimistic update after submitting a new claim — avoids waiting on a refetch.
    addClaimRequest: (state, action: PayloadAction<ClaimRequest>) => {
      // Replace any prior entry for the same artist (e.g., a previously-rejected one)
      // so the modal flips to "pending" immediately.
      state.claimRequests = [
        action.payload,
        ...state.claimRequests.filter((c) => c.artist_id !== action.payload.artist_id),
      ];
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
      })
      .addCase(loadPendingClaims.fulfilled, (state, action) => {
        state.claimRequests = action.payload as ClaimRequest[];
      })
      .addCase(loadPurchases.fulfilled, (state, action) => {
        state.purchases = action.payload as Purchase[];
      });
  },
});

export const { setCredentials, logout, addClaimRequest } = authSlice.actions;
export default authSlice.reducer;
