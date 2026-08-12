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
import { takePendingStan } from "../../utils/pendingStan";

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

/**
 * Redeem the artist a guest was trying to stan when they hit the auth wall.
 *
 * Called right after a successful verify-code, from both login and signup —
 * an existing user can hit GuestAddPrompt while logged out just as easily as
 * a new one.
 *
 * Deliberately never throws: this is a bonus on top of a successful auth, and
 * a failure here must not surface as a login error. takePendingStan clears
 * the stored intent whether or not the add lands, and addArtistToProfileList
 * already no-ops on a duplicate or a full list.
 */
export const redeemPendingStan = () => async (dispatch) => {
  const pending = takePendingStan();
  if (!pending) return null;
  try {
    await dispatch(addArtistToProfileList(pending));
    return pending;
  } catch (error) {
    console.error("Could not credit the pending artist:", error);
    return null;
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
