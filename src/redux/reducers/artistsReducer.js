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
  loading: false, // For tracking data fetching status
  error: null, // For storing any errors
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
      return {
        ...state,
        loading: false,
        artists: action.payload, // Set the fetched artists
        error: null,
      };
    case FETCH_ARTISTS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload, // Store the error message
      };
    case INCREMENT_CLOUT_REQUEST:
      // You could implement an optimistic update here (increment before API confirms)
      // For now, we'll wait for SUCCESS to ensure consistency with backend
      return { ...state };
    case INCREMENT_CLOUT_SUCCESS:
      const { artistId } = action.payload;
      return {
        ...state,
        artists: state.artists
          .map(
            (
              artist // Find the artist and increment their count
            ) =>
              artist.artist_id === artistId
                ? { ...artist, count: artist.count + 1 }
                : artist
          )
          .sort((a, b) => b.count - a.count), // Re-sort after update for consistent display
      };
    case INCREMENT_CLOUT_FAILURE:
      // Handle the failure. If you did an optimistic update, you'd revert it here.
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
