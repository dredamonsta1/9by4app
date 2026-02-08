// src/redux/reducers/artistsReducer.js
import {
  FETCH_ARTISTS_REQUEST,
  FETCH_ARTISTS_SUCCESS,
  FETCH_ARTISTS_FAILURE,
  FETCH_MORE_ARTISTS_REQUEST,
  FETCH_MORE_ARTISTS_SUCCESS,
  FETCH_MORE_ARTISTS_FAILURE,
  SEARCH_ARTISTS_REQUEST,
  SEARCH_ARTISTS_SUCCESS,
  SEARCH_ARTISTS_FAILURE,
  CLEAR_SEARCH_RESULTS,
  INCREMENT_CLOUT_REQUEST,
  INCREMENT_CLOUT_SUCCESS,
  INCREMENT_CLOUT_FAILURE,
} from "../actions/artistActions";

const initialState = {
  artists: [],
  loading: false,
  loadingMore: false,
  error: null,
  page: 1,
  totalCount: 0,
  totalPages: 0,
  hasMore: false,
  // Separate search state for ProfilePage
  searchResults: [],
  searchLoading: false,
  searchError: null,
};

const artistsReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ARTISTS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_ARTISTS_SUCCESS: {
      const { artists, page, totalCount, totalPages, hasMore } = action.payload;
      const sortedArtists = [...artists].sort((a, b) => b.count - a.count);
      return {
        ...state,
        loading: false,
        artists: sortedArtists,
        page,
        totalCount,
        totalPages,
        hasMore,
        error: null,
      };
    }
    case FETCH_ARTISTS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case FETCH_MORE_ARTISTS_REQUEST:
      return {
        ...state,
        loadingMore: true,
      };
    case FETCH_MORE_ARTISTS_SUCCESS: {
      const { artists, page, totalCount, totalPages, hasMore } = action.payload;
      return {
        ...state,
        loadingMore: false,
        artists: [...state.artists, ...artists],
        page,
        totalCount,
        totalPages,
        hasMore,
      };
    }
    case FETCH_MORE_ARTISTS_FAILURE:
      return {
        ...state,
        loadingMore: false,
        error: action.payload,
      };
    case SEARCH_ARTISTS_REQUEST:
      return {
        ...state,
        searchLoading: true,
        searchError: null,
      };
    case SEARCH_ARTISTS_SUCCESS:
      return {
        ...state,
        searchLoading: false,
        searchResults: action.payload,
        searchError: null,
      };
    case SEARCH_ARTISTS_FAILURE:
      return {
        ...state,
        searchLoading: false,
        searchError: action.payload,
      };
    case CLEAR_SEARCH_RESULTS:
      return {
        ...state,
        searchResults: [],
        searchLoading: false,
        searchError: null,
      };
    case INCREMENT_CLOUT_REQUEST:
      return { ...state };
    case INCREMENT_CLOUT_SUCCESS: {
      const { artistId } = action.payload;
      const incrementCount = (artist) =>
        artist.artist_id === artistId
          ? { ...artist, count: artist.count + 1 }
          : artist;
      return {
        ...state,
        artists: state.artists.map(incrementCount).sort((a, b) => b.count - a.count),
        searchResults: state.searchResults.map(incrementCount),
      };
    }
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
