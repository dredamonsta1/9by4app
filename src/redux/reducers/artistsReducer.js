// src/redux/reducers/artistsReducer.js
import {
  FETCH_ARTISTS_REQUEST,
  FETCH_ARTISTS_SUCCESS,
  FETCH_ARTISTS_FAILURE,
  INCREMENT_CLOUT_REQUEST,
  INCREMENT_CLOUT_SUCCESS,
  INCREMENT_CLOUT_FAILURE,
} from "../actions/artistActions";

const initialState = {
  artists: [],
  loading: false,
  error: null,
};

const artistsReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ARTISTS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_ARTISTS_SUCCESS:
      // --- FIX: Sort the artist list as soon as it's fetched ---
      // We create a new sorted array to avoid mutating the original payload.
      const sortedArtists = [...action.payload].sort(
        (a, b) => b.count - a.count
      );
      return {
        ...state,
        loading: false,
        artists: sortedArtists, // Store the sorted list in the state
        error: null,
      };
    case FETCH_ARTISTS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case INCREMENT_CLOUT_REQUEST:
      return { ...state };
    case INCREMENT_CLOUT_SUCCESS:
      const { artistId } = action.payload;
      return {
        ...state,
        // The list is already sorted here, which is correct.
        artists: state.artists
          .map((artist) =>
            artist.artist_id === artistId
              ? { ...artist, count: artist.count + 1 }
              : artist
          )
          .sort((a, b) => b.count - a.count),
      };
    case INCREMENT_CLOUT_FAILURE:
      console.error(
        "Clout increment failed for artist:",
        action.payload.artistId,
        action.payload.error
      );
      return { ...state, error: action.payload.error };
    default:
      return state;
  }
};

export default artistsReducer;
