// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// const initialState = {
//   user: null,
//   token: null,
//   isLoggedIn: false,
// };

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     login(state, action) {
//       state.user = action.payload.user;
//       state.token = action.payload.token;
//       state.isLoggedIn = true;
//     },
//     logout(state) {
//       state.user = null;
//       state.token = null;
//       state.isLoggedIn = false;
//       console.log(user);
//       console.log(token);
//       console.log(isLoggedIn);
//       console.log("User logged out");
//       console.log("Token cleared");
//       console.log("isLoggedIn set to false");
//       console.log("User data cleared");
//     },
//   },
// });
// export const { login, logout } = authSlice.actions;
// export default authSlice.reducer;

// src/store/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    isLoggedIn: false, // Derived state
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isLoggedIn = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
      localStorage.removeItem("token"); // Clear token from localStorage on logout
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;

// Selector to easily check login status
export const selectIsLoggedIn = (state) => state.auth.isLoggedIn;
export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
