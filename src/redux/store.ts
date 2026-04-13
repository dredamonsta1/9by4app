// src/redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import artistsReducer from "./reducers/artistsReducer";
import authReducer from "../store/authSlice";
import profileListReducer from "./profileListSlice";
import messagesReducer from "./messagesSlice";
import playerReducer from "./playerSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    artists: artistsReducer,
    profileList: profileListReducer,
    messages: messagesReducer,
    player:   playerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Keep this only if you are storing non-serializable data like Dates or Functions
      // Better yet: fix your data so it IS serializable.
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Important: Do not use default export if you want to avoid circular dependencies with Axios
// But for now, we'll stay consistent with your style.
export default store;
