// src/store/authSlice.js
// import { createSlice } from "@reduxjs/toolkit";

// const persistedToken = localStorage.getItem("token");
// const persistedUser = localStorage.getItem("user")
//   ? JSON.parse(localStorage.getItem("user"))
//   : null;

// const authSlice = createSlice({
//   name: "auth",
//   initialState: {
//     user: persistedUser,
//     token: persistedToken,
//     isLoggedIn: !!persistedToken,
//     isHydrated: false, // Track if we've finished checking the token validity
//   },

//   reducers: {
//     setCredentials: (state, action) => {
//       const { user, token } = action.payload;
//       state.user = user;
//       state.token = token;
//       state.isLoggedIn = true;

//       // Sync with localStorage so the state survives a refresh
//       localStorage.setItem("token", token);
//       localStorage.setItem("user", JSON.stringify(user));
//     },
//     logout: (state) => {
//       state.user = null;
//       state.token = null;
//       state.isLoggedIn = false;

//       // Wipe everything
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//     },
//   },
// });

// export const { setCredentials, logout } = authSlice.actions;
// export default authSlice.reducer;

// export const selectIsLoggedIn = (state) => state.auth.isLoggedIn;
// export const selectCurrentUser = (state) => state.auth.user;

// ***************************New Code Below*************************** //

// src/store/authSlice.js
import { createSlice } from "@reduxjs/toolkit";
// Import your async thunk (Assuming it's defined in an actions file)
import { loadUserFromToken } from "../redux/actions/authActions";

const persistedToken = localStorage.getItem("token");
const persistedUser = localStorage.getItem("user")
  ? JSON.parse(localStorage.getItem("user"))
  : null;

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: persistedUser,
    token: persistedToken,
    isLoggedIn: !!persistedToken,
    // status helps the UI know if we are currently validating the token with the server
    status: persistedToken ? "loading" : "idle",
    error: null,
  },

  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isLoggedIn = true;
      state.status = "succeeded"; // Mark as succeeded if manually logging in

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
      state.status = "idle";
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },

  // This is where you handle the "Background Check" of the token
  extraReducers: (builder) => {
    builder
      .addCase(loadUserFromToken.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loadUserFromToken.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user; // Update user from server data
        state.isLoggedIn = true;
      })
      .addCase(loadUserFromToken.rejected, (state, action) => {
        state.status = "failed";
        state.user = null;
        state.token = null;
        state.isLoggedIn = false;
        state.error = action.error.message;

        // If the token is invalid, clean up
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      });
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectAuthStatus = (state) => state.auth.status;
export const selectCurrentUser = (state) => state.auth.user;
