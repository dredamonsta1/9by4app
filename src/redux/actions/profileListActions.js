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
    const response = await axiosInstance.get("/profile/list");
    dispatch(setProfileListSuccess(response.data.list));
  } catch (error) {
    console.error("Error fetching profile list:", error);
    dispatch(setProfileListFailure(error.message));
  }
};

// Action to add an artist to the user's curated list
export const addArtistToProfileList = (artist) => async (dispatch) => {
  // --- DEBUGGING LOGS START HERE ---
  console.log("1. Starting 'addArtistToProfileList' for artist:", artist);
  try {
    const url = `/profile/list/${artist.artist_id}`;
    console.log("2. Attempting to POST to URL:", url);

    // This is the call that is likely failing.
    await axiosInstance.post(url);

    console.log("3. POST request successful!");

    // Dispatch the success action to add the artist to the Redux state
    dispatch(addArtistToListSuccess(artist));
    console.log("4. Dispatched addArtistToListSuccess.");

    // Also dispatch the original incrementClout action
    dispatch(incrementClout(artist.artist_id));
    console.log("5. Dispatched incrementClout.");
  } catch (error) {
    // If there is any error with the POST request, it should be caught here.
    console.error("DEBUG: Error caught in 'addArtistToProfileList':", error);
    // You can inspect the full error object for more details
    if (error.response) {
      console.error("DEBUG: Error response data:", error.response.data);
      console.error("DEBUG: Error response status:", error.response.status);
    }
  }
  // --- DEBUGGING LOGS END HERE ---
};
