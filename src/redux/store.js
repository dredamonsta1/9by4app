// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import artistsReducer from "./reducers/artistsReducer";

const store = configureStore({
  reducer: {
    artists: artistsReducer, // This will be the slice of state managed by artistsReducer
  },
  // configureStore automatically sets up Redux Thunk, which we need for async actions.
});

export default store;
