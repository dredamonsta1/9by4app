// src/redux/actions/artistActions.js
import axiosInstance from "../../utils/axiosInstance";

// Action Types
export const FETCH_ARTISTS_REQUEST = "FETCH_ARTISTS_REQUEST";
export const FETCH_ARTISTS_SUCCESS = "FETCH_ARTISTS_SUCCESS";
export const FETCH_ARTISTS_FAILURE = "FETCH_ARTISTS_FAILURE";

export const INCREMENT_CLOUT_REQUEST = "INCREMENT_CLOUT_REQUEST";
export const INCREMENT_CLOUT_SUCCESS = "INCREMENT_CLOUT_SUCCESS";
export const INCREMENT_CLOUT_FAILURE = "INCREMENT_CLOUT_FAILURE";

// Async Action Creator for fetching artists
export const fetchArtists = () => async (dispatch) => {
  dispatch({ type: FETCH_ARTISTS_REQUEST });
  try {
    const response = await axiosInstance.get("/artists");

    // --- FIX STARTS HERE ---
    // 1. Correctly access `response.data.artists` instead of `rappers`.
    const artistData = response.data.artists || [];

    // 2. Map over the data to create a consistent structure for the frontend.
    //    - Rename `artist_name` to `name` to match what the component expects.
    //    - Ensure `count` has a default value of 0.
    const artists = artistData
      .filter((artist) => artist) // Remove any null or undefined artists
      .map((artist) => ({
        ...artist,
        name: artist.artist_name, // Rename artist_name to name
        count: artist.count || 0,
      }));
    // --- FIX ENDS HERE ---

    dispatch({ type: FETCH_ARTISTS_SUCCESS, payload: artists });
  } catch (error) {
    console.error("Error fetching artists:", error);
    dispatch({ type: FETCH_ARTISTS_FAILURE, payload: error.message });
  }
};

// Async Action Creator for incrementing clout
export const incrementClout = (artistId) => async (dispatch) => {
  dispatch({ type: INCREMENT_CLOUT_REQUEST, payload: artistId });
  try {
    await axiosInstance.put(`/artists/${artistId}/clout`);
    dispatch({ type: INCREMENT_CLOUT_SUCCESS, payload: { artistId } });
  } catch (error) {
    console.error(
      `Error incrementing clout for artist ${artistId}:`,
      error.response?.data || error.message
    );
    dispatch({
      type: INCREMENT_CLOUT_FAILURE,
      payload: { artistId, error: error.response?.data || error.message },
    });
  }
};
