// src/redux/profileListSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { INCREMENT_CLOUT_SUCCESS, DECREMENT_CLOUT_SUCCESS } from "./actions/artistActions";

const initialState = {
  list: [],
  loading: false,
  error: null,
  // Distinguishes "not fetched yet" from "fetched and genuinely empty".
  // Without it an empty list means both, and anything reading the count
  // outside ProfilePage/ArtistPanel — which are the only two places that
  // fetch — would tell a user with 20 artists that they have none.
  loaded: false,
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
      state.loaded = true;
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
    removeArtistFromListSuccess(state, action) {
      state.list = state.list.filter(
        (artist) => artist.artist_id !== action.payload
      );
    },
    reorderList(state, action) {
      // action.payload = array of artist_ids in new order
      const idOrder = action.payload;
      const map = Object.fromEntries(state.list.map((a) => [a.artist_id, a]));
      state.list = idOrder.map((id) => map[id]).filter(Boolean);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(INCREMENT_CLOUT_SUCCESS, (state, action) => {
      const { artistId, newCount } = action.payload;
      const artist = state.list.find((a) => a.artist_id === artistId);
      if (artist) {
        // Use the server's confirmed count if available; otherwise keep optimistic value
        if (newCount !== undefined) {
          artist.count = newCount;
        }
      }
    });
    builder.addCase(DECREMENT_CLOUT_SUCCESS, (state, action) => {
      const { artistId } = action.payload;
      const artist = state.list.find((a) => a.artist_id === artistId);
      if (artist) {
        artist.count = Math.max((artist.count || 0) - 1, 0);
      }
    });
  },
});

export const {
  setProfileListStart,
  setProfileListSuccess,
  setProfileListFailure,
  addArtistToListSuccess,
  removeArtistFromListSuccess,
  reorderList,
} = profileListSlice.actions;

export default profileListSlice.reducer;
