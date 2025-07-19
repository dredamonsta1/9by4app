// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import artistsReducer from "./reducers/artistsReducer";
import authReducer from "../store/authSlice"; // Import the auth slice/reducer
import profileListReducer from "./profileListSlice"; // 1. Import the new reducer

const store = configureStore({
  reducer: {
    artists: artistsReducer,
    auth: authReducer,
    profileList: profileListReducer, // 2. Add the new reducer to the store
  },
});

export default store;
