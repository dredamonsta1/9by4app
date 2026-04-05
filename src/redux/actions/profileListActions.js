// src/redux/actions/profileListActions.js
import axiosInstance from "../../utils/axiosInstance";
import {
  setProfileListStart,
  setProfileListSuccess,
  setProfileListFailure,
  addArtistToListSuccess,
  removeArtistFromListSuccess,
  reorderList,
} from "../profileListSlice";
import { incrementClout, decrementClout } from "./artistActions";

// Action to fetch the user's curated list from the backend
export const fetchProfileList = () => async (dispatch) => {
  dispatch(setProfileListStart());
  try {
    const response = await axiosInstance.get("/profile/list");
    dispatch(setProfileListSuccess(response.data.list));
  } catch (error) {
    console.error("Error fetching profile list:", error);
    dispatch(setProfileListFailure(error.message));
  }
};

// Action to add an artist to the user's curated list
export const MAX_FAVORITE_ARTISTS = 20;

export const addArtistToProfileList = (artist) => async (dispatch, getState) => {
  const { list } = getState().profileList;
  if (list.some((a) => a.artist_id === artist.artist_id)) {
    return;
  }
  if (list.length >= MAX_FAVORITE_ARTISTS) {
    return;
  }

  try {
    await axiosInstance.post(`/profile/list/${artist.artist_id}`);
    // Optimistically add with incremented count so the UI updates immediately
    dispatch(addArtistToListSuccess({ ...artist, count: (artist.count || 0) + 1 }));
    dispatch(incrementClout(artist.artist_id));
  } catch (error) {
    console.error("Error adding artist to profile list:", error);
  }
};

// Action to persist a reordered list — optimistic update, then sync to backend
export const reorderProfileList = (orderedIds) => async (dispatch) => {
  dispatch(reorderList(orderedIds));
  try {
    await axiosInstance.patch("/profile/list/reorder", { order: orderedIds });
  } catch (error) {
    console.error("Error saving list order:", error);
    // Re-fetch to restore server state if patch failed
    dispatch(setProfileListStart());
    try {
      const response = await axiosInstance.get("/profile/list");
      dispatch(setProfileListSuccess(response.data.list));
    } catch (fetchErr) {
      dispatch(setProfileListFailure(fetchErr.message));
    }
  }
};

// Action to remove an artist from the user's curated list
export const removeArtistFromProfileList = (artistId) => async (dispatch) => {
  try {
    await axiosInstance.delete(`/profile/list/${artistId}`);
    dispatch(removeArtistFromListSuccess(artistId));
    dispatch(decrementClout(artistId));
  } catch (error) {
    console.error("Error removing artist from profile list:", error);
  }
};
