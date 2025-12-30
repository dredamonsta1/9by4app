// src/store/authSlice.js

// import { createSlice } from "@reduxjs/toolkit";

// const authSlice = createSlice({
//   name: "auth",
//   initialState: {
//     user: null,
//     token: null,
//     isLoggedIn: false,
//   },
//   reducers: {
//     setCredentials: (state, action) => {
//       const { user, token } = action.payload;
//       state.user = user;
//       state.token = token;
//       state.isLoggedIn = true;
//     },
//     logout: (state) => {
//       state.user = null;
//       state.token = null;
//       state.isLoggedIn = false;
//       localStorage.removeItem("token");
//     },
//   },
// });

// export const { setCredentials, logout } = authSlice.actions;

// export default authSlice.reducer;

// // Selector to easily check login status
// export const selectIsLoggedIn = (state) => state.auth.isLoggedIn; // <--- This needs to exist!
// export const selectCurrentUser = (state) => state.auth.user;
// export const selectCurrentToken = (state) => state.auth.token;

// ****************************New Code Below****************************

// src/store/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

// Attempt to recover state from localStorage to prevent "refresh-logout"
const persistedToken = localStorage.getItem("token");
const persistedUser = JSON.parse(localStorage.getItem("user"));

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: persistedUser || null,
    token: persistedToken || null,
    isLoggedIn: !!persistedToken, // Truthy check: if token exists, they are logged in
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isLoggedIn = true;

      // Sync with localStorage so the state survives a refresh
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;

      // Wipe everything
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

export const selectIsLoggedIn = (state) => state.auth.isLoggedIn;
export const selectCurrentUser = (state) => state.auth.user;
