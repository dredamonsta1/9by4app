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
export const addArtistToProfileList = (artist) => async (dispatch, getState) => {
  const { list } = getState().profileList;
  if (list.some((a) => a.artist_id === artist.artist_id)) {
    return;
  }

  try {
    await axiosInstance.post(`/profile/list/${artist.artist_id}`);
    dispatch(addArtistToListSuccess(artist));
    dispatch(incrementClout(artist.artist_id));
  } catch (error) {
    console.error("Error adding artist to profile list:", error);
  }
};
