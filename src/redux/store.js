// // src/redux/store.js
// import { configureStore } from "@reduxjs/toolkit";
// import artistsReducer from "./reducers/artistsReducer";

// const store = configureStore({
//   reducer: {
//     artists: artistsReducer, // This will be the slice of state managed by artistsReducer
//   },
//   // configureStore automatically sets up Redux Thunk, which we need for async actions.
// });

// export default store;

// **************************New Code****************************

// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import artistsReducer from "./reducers/artistsReducer";
import authReducer from "../store/authSlice"; // 1. Import your auth slice/reducer

const store = configureStore({
  reducer: {
    artists: artistsReducer,
    auth: authReducer, // 2. Add the auth reducer to the store
  },
  // configureStore automatically sets up Redux Thunk, which we need for async actions.
});

export default store;
