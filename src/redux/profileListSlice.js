// src/redux/profileListSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],
  loading: false,
  error: null,
};

const profileListSlice = createSlice({
  name: "profileList",
  initialState,
  reducers: {
    setProfileListStart(state) {
      state.loading = true;
      state.error = null;
    },
    setProfileListSuccess(state, action) {
      state.loading = false;
      state.list = action.payload;
    },
    setProfileListFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    addArtistToListSuccess(state, action) {
      // Add the new artist to the list if it's not already there
      if (
        !state.list.find(
          (artist) => artist.artist_id === action.payload.artist_id
        )
      ) {
        state.list.push(action.payload);
      }
    },
  },
});

export const {
  setProfileListStart,
  setProfileListSuccess,
  setProfileListFailure,
  addArtistToListSuccess,
} = profileListSlice.actions;

export default profileListSlice.reducer;
