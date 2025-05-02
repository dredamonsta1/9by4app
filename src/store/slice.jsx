import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  isLoggedIn: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isLoggedIn = true;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
      console.log(user);
      console.log(token);
      console.log(isLoggedIn);
      console.log("User logged out");
      console.log("Token cleared");
      console.log("isLoggedIn set to false");
      console.log("User data cleared");
    },
  },
});
export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
