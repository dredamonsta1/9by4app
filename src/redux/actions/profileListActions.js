// src/redux/actions/profileListActions.js
import axiosInstance from "../../utils/axiosInstance";
import {
  setProfileListStart,
  setProfileListSuccess,
  setProfileListFailure,
  addArtistToListSuccess,
} from "../profileListSlice";
import { incrementClout } from "./artistActions";

// Action to fetch the user's curated list from the backend
export const fetchProfileList = () => async (dispatch) => {
  dispatch(setProfileListStart());
  try {
    // This endpoint needs to be created on your backend
    const response = await axiosInstance.get("/profile/list");
    dispatch(setProfileListSuccess(response.data.list));
  } catch (error) {
    console.error("Error fetching profile list:", error);
    dispatch(setProfileListFailure(error.message));
  }
};

// Action to add an artist to the user's curated list
export const addArtistToProfileList = (artist) => async (dispatch) => {
  try {
    // This endpoint needs to be created on your backend
    await axiosInstance.post(`/profile/list/${artist.artist_id}`);

    // Dispatch the success action to add the artist to the Redux state
    dispatch(addArtistToListSuccess(artist));

    // Also dispatch the original incrementClout action
    dispatch(incrementClout(artist.artist_id));
  } catch (error) {
    console.error("Error adding artist to profile list:", error);
    // Optionally dispatch a failure action here
  }
};
