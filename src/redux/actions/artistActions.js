// src/redux/actions/artistActions.js
import axiosInstance from "../../utils/axiosInstance";

// Action Types
export const FETCH_ARTISTS_REQUEST = "FETCH_ARTISTS_REQUEST";
export const FETCH_ARTISTS_SUCCESS = "FETCH_ARTISTS_SUCCESS";
export const FETCH_ARTISTS_FAILURE = "FETCH_ARTISTS_FAILURE";

export const FETCH_MORE_ARTISTS_REQUEST = "FETCH_MORE_ARTISTS_REQUEST";
export const FETCH_MORE_ARTISTS_SUCCESS = "FETCH_MORE_ARTISTS_SUCCESS";
export const FETCH_MORE_ARTISTS_FAILURE = "FETCH_MORE_ARTISTS_FAILURE";

export const SEARCH_ARTISTS_REQUEST = "SEARCH_ARTISTS_REQUEST";
export const SEARCH_ARTISTS_SUCCESS = "SEARCH_ARTISTS_SUCCESS";
export const SEARCH_ARTISTS_FAILURE = "SEARCH_ARTISTS_FAILURE";
export const CLEAR_SEARCH_RESULTS = "CLEAR_SEARCH_RESULTS";

export const INCREMENT_CLOUT_REQUEST = "INCREMENT_CLOUT_REQUEST";
export const INCREMENT_CLOUT_SUCCESS = "INCREMENT_CLOUT_SUCCESS";
export const INCREMENT_CLOUT_FAILURE = "INCREMENT_CLOUT_FAILURE";

const mapArtistData = (artistData) =>
  (artistData || [])
    .filter((artist) => artist)
    .map((artist) => ({
      ...artist,
      name: artist.artist_name,
      count: artist.count || 0,
    }));

// Fetch first page of artists (replaces list)
export const fetchArtists =
  ({ page = 1, limit = 50, search = "", genre = "", state = "" } = {}) =>
  async (dispatch) => {
    dispatch({ type: FETCH_ARTISTS_REQUEST });
    try {
      const response = await axiosInstance.get("/artists", {
        params: { page, limit, search, genre, state },
      });

      const artists = mapArtistData(response.data.artists);
      const { totalCount, totalPages, hasMore } = response.data;

      dispatch({
        type: FETCH_ARTISTS_SUCCESS,
        payload: { artists, page, totalCount, totalPages, hasMore },
      });
    } catch (error) {
      console.error("Error fetching artists:", error);
      dispatch({ type: FETCH_ARTISTS_FAILURE, payload: error.message });
    }
  };

// Fetch next page (appends to list)
export const fetchMoreArtists =
  ({ page, limit = 50, search = "", genre = "", state = "" } = {}) =>
  async (dispatch) => {
    dispatch({ type: FETCH_MORE_ARTISTS_REQUEST });
    try {
      const response = await axiosInstance.get("/artists", {
        params: { page, limit, search, genre, state },
      });

      const artists = mapArtistData(response.data.artists);
      const { totalCount, totalPages, hasMore } = response.data;

      dispatch({
        type: FETCH_MORE_ARTISTS_SUCCESS,
        payload: { artists, page, totalCount, totalPages, hasMore },
      });
    } catch (error) {
      console.error("Error fetching more artists:", error);
      dispatch({ type: FETCH_MORE_ARTISTS_FAILURE, payload: error.message });
    }
  };

// Search artists (separate state for search results)
export const searchArtists =
  ({ search, limit = 20 } = {}) =>
  async (dispatch) => {
    dispatch({ type: SEARCH_ARTISTS_REQUEST });
    try {
      const response = await axiosInstance.get("/artists", {
        params: { page: 1, limit, search },
      });

      const artists = mapArtistData(response.data.artists);

      dispatch({ type: SEARCH_ARTISTS_SUCCESS, payload: artists });
    } catch (error) {
      console.error("Error searching artists:", error);
      dispatch({ type: SEARCH_ARTISTS_FAILURE, payload: error.message });
    }
  };

export const clearSearchResults = () => ({ type: CLEAR_SEARCH_RESULTS });

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
