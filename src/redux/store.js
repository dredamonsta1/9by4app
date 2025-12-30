// src/redux/store.js
// import { configureStore } from "@reduxjs/toolkit";
// import artistsReducer from "./reducers/artistsReducer";
// import authReducer from "../store/authSlice"; // Import the auth slice/reducer
// import profileListReducer from "./profileListSlice"; // 1. Import the new reducer

// const store = configureStore({
//   reducer: {
//     artists: artistsReducer,
//     auth: authReducer,
//     profileList: profileListReducer, // 2. Add the new reducer to the store
//   },
// });

// export default store;

// ****************************New Code below****************************

import { configureStore } from "@reduxjs/toolkit";
import artistsReducer from "./reducers/artistsReducer";
import authReducer from "../store/authSlice";
import profileListReducer from "./profileListSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    artists: artistsReducer,
    profileList: profileListReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Keep this only if you are storing non-serializable data like Dates or Functions
      // Better yet: fix your data so it IS serializable.
      serializableCheck: false,
    }),
});

// Important: Do not use default export if you want to avoid circular dependencies with Axios
// But for now, we'll stay consistent with your style.
export default store;
