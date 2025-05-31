// src/redux/actions/artistActions.js
import axiosInstance from "../../utils/axiosInstance"; // Make sure this path is correct

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
    const response = await axiosInstance.get("/");
    // Ensure data.rappers is an array and each item has a 'count'
    const artists = (
      Array.isArray(response.data.rappers)
        ? response.data.rappers
        : [response.data.rappers]
    ).map((artist) => ({ ...artist, count: artist.count || 0 }));
    dispatch({ type: FETCH_ARTISTS_SUCCESS, payload: artists });
  } catch (error) {
    console.error("Error fetching artists:", error);
    dispatch({ type: FETCH_ARTISTS_FAILURE, payload: error.message });
  }
};

// Async Action Creator for incrementing clout
export const incrementClout = (artistId) => async (dispatch) => {
  // Optionally dispatch a REQUEST action for optimistic UI updates
  dispatch({ type: INCREMENT_CLOUT_REQUEST, payload: artistId });
  try {
    // Make API call to backend to increment clout
    const response = await axiosInstance.put(`/rappers/${artistId}/clout`);
    // Assuming backend returns a success message or confirmation
    dispatch({ type: INCREMENT_CLOUT_SUCCESS, payload: { artistId } });
  } catch (error) {
    console.error(
      `Error incrementing clout for artist ${artistId}:`,
      error.response?.data || error.message
    );
    // Dispatch failure action to revert optimistic update or show error
    dispatch({
      type: INCREMENT_CLOUT_FAILURE,
      payload: { artistId, error: error.response?.data || error.message },
    });
  }
};
