// // src/redux/actions/artistActions.js
// import axiosInstance from "../../utils/axiosInstance"; // Make sure this path is correct

// // Action Types
// export const FETCH_ARTISTS_REQUEST = "FETCH_ARTISTS_REQUEST";
// export const FETCH_ARTISTS_SUCCESS = "FETCH_ARTISTS_SUCCESS";
// export const FETCH_ARTISTS_FAILURE = "FETCH_ARTISTS_FAILURE";

// export const INCREMENT_CLOUT_REQUEST = "INCREMENT_CLOUT_REQUEST";
// export const INCREMENT_CLOUT_SUCCESS = "INCREMENT_CLOUT_SUCCESS";
// export const INCREMENT_CLOUT_FAILURE = "INCREMENT_CLOUT_FAILURE";

// // Async Action Creator for fetching artists
// export const fetchArtists = () => async (dispatch) => {
//   dispatch({ type: FETCH_ARTISTS_REQUEST });
//   try {
//     // The endpoint for fetching all rappers/artists is likely /rappers, not the root.
//     // This matches the endpoints used for deleting and updating clout.
//     const response = await axiosInstance.get("/artists");
//     // Ensure data.rappers is an array and each item has a 'count'
//     const artists = (
//       Array.isArray(response.data.rappers)
//         ? response.data.artists
//         : [response.data.rappers]
//     ).map((artist) => ({ ...artist, count: artist.count || 0 }));
//     dispatch({ type: FETCH_ARTISTS_SUCCESS, payload: artists });
//   } catch (error) {
//     console.error("Error fetching artists:", error);
//     dispatch({ type: FETCH_ARTISTS_FAILURE, payload: error.message });
//   }
// };

// // Async Action Creator for incrementing clout
// export const incrementClout = (artistId) => async (dispatch) => {
//   // Optionally dispatch a REQUEST action for optimistic UI updates
//   dispatch({ type: INCREMENT_CLOUT_REQUEST, payload: artistId });
//   try {
//     // Make API call to backend to increment clout
//     const response = await axiosInstance.put(`/artists/${artistId}/clout`);
//     // Assuming backend returns a success message or confirmation
//     dispatch({ type: INCREMENT_CLOUT_SUCCESS, payload: { artistId } });
//   } catch (error) {
//     console.error(
//       `Error incrementing clout for artist ${artistId}:`,
//       error.response?.data || error.message
//     );
//     // Dispatch failure action to revert optimistic update or show error
//     dispatch({
//       type: INCREMENT_CLOUT_FAILURE,
//       payload: { artistId, error: error.response?.data || error.message },
//     });
//   }
// };

// ***********************New Code***********************

// // src/redux/actions/artistActions.js
// import axiosInstance from "../../utils/axiosInstance"; // Make sure this path is correct

// // Action Types
// export const FETCH_ARTISTS_REQUEST = "FETCH_ARTISTS_REQUEST";
// export const FETCH_ARTISTS_SUCCESS = "FETCH_ARTISTS_SUCCESS";
// export const FETCH_ARTISTS_FAILURE = "FETCH_ARTISTS_FAILURE";

// export const INCREMENT_CLOUT_REQUEST = "INCREMENT_CLOUT_REQUEST";
// export const INCREMENT_CLOUT_SUCCESS = "INCREMENT_CLOUT_SUCCESS";
// export const INCREMENT_CLOUT_FAILURE = "INCREMENT_CLOUT_FAILURE";

// // Async Action Creator for fetching artists
// export const fetchArtists = () => async (dispatch) => {
//   dispatch({ type: FETCH_ARTISTS_REQUEST });
//   try {
//     const response = await axiosInstance.get("/artists");

//     // --- FIX STARTS HERE ---
//     // 1. Safely get the data, defaulting to an empty array if it's missing.
//     const rappersData = response.data.rappers || [];

//     // 2. Ensure we are working with an array, then filter out any invalid entries before mapping.
//     //    This prevents the "cannot read properties of undefined" error.
//     const artists = (Array.isArray(rappersData) ? rappersData : [rappersData])
//       .filter((artist) => artist) // Remove any null or undefined artists from the array
//       .map((artist) => ({ ...artist, count: artist.count || 0 }));
//     // --- FIX ENDS HERE ---

//     dispatch({ type: FETCH_ARTISTS_SUCCESS, payload: artists });
//   } catch (error) {
//     console.error("Error fetching artists:", error);
//     dispatch({ type: FETCH_ARTISTS_FAILURE, payload: error.message });
//   }
// };

// // Async Action Creator for incrementing clout
// export const incrementClout = (artistId) => async (dispatch) => {
//   // Optionally dispatch a REQUEST action for optimistic UI updates
//   dispatch({ type: INCREMENT_CLOUT_REQUEST, payload: artistId });
//   try {
//     // Make API call to backend to increment clout
//     const response = await axiosInstance.put(`/artists/${artistId}/clout`);
//     // Assuming backend returns a success message or confirmation
//     dispatch({ type: INCREMENT_CLOUT_SUCCESS, payload: { artistId } });
//   } catch (error) {
//     console.error(
//       `Error incrementing clout for artist ${artistId}:`,
//       error.response?.data || error.message
//     );
//     // Dispatch failure action to revert optimistic update or show error
//     dispatch({
//       type: INCREMENT_CLOUT_FAILURE,
//       payload: { artistId, error: error.response?.data || error.message },
//     });
//   }
// };

// ***********************New Code***********************

// src/redux/actions/artistActions.js
// import axiosInstance from "../../utils/axiosInstance"; // Make sure this path is correct

// // Action Types
// export const FETCH_ARTISTS_REQUEST = "FETCH_ARTISTS_REQUEST";
// export const FETCH_ARTISTS_SUCCESS = "FETCH_ARTISTS_SUCCESS";
// export const FETCH_ARTISTS_FAILURE = "FETCH_ARTISTS_FAILURE";

// export const INCREMENT_CLOUT_REQUEST = "INCREMENT_CLOUT_REQUEST";
// export const INCREMENT_CLOUT_SUCCESS = "INCREMENT_CLOUT_SUCCESS";
// export const INCREMENT_CLOUT_FAILURE = "INCREMENT_CLOUT_FAILURE";

// // Async Action Creator for fetching artists
// export const fetchArtists = () => async (dispatch) => {
//   dispatch({ type: FETCH_ARTISTS_REQUEST });
//   try {
//     const response = await axiosInstance.get("/artists");

//     // --- FIX STARTS HERE ---
//     // 1. Safely get the artist data from the response, defaulting to an empty array.
//     //    This prevents errors if `response.data.rappers` is missing.
//     const rappersData = response.data.rappers || [];

//     // 2. Ensure we are working with an array, then filter out any null/undefined artists
//     //    before mapping. This is the key fix for the "cannot read 'count'" error.
//     const artists = (Array.isArray(rappersData) ? rappersData : [rappersData])
//       .filter((artist) => artist) // This line prevents the error by removing invalid items.
//       .map((artist) => ({ ...artist, count: artist.count || 0 }));
//     // --- FIX ENDS HERE ---

//     dispatch({ type: FETCH_ARTISTS_SUCCESS, payload: artists });
//   } catch (error) {
//     console.error("Error fetching artists:", error);
//     dispatch({ type: FETCH_ARTISTS_FAILURE, payload: error.message });
//   }
// };

// // Async Action Creator for incrementing clout
// export const incrementClout = (artistId) => async (dispatch) => {
//   dispatch({ type: INCREMENT_CLOUT_REQUEST, payload: artistId });
//   try {
//     const response = await axiosInstance.put(`/artists/${artistId}/clout`);
//     dispatch({ type: INCREMENT_CLOUT_SUCCESS, payload: { artistId } });
//   } catch (error) {
//     console.error(
//       `Error incrementing clout for artist ${artistId}:`,
//       error.response?.data || error.message
//     );
//     dispatch({
//       type: INCREMENT_CLOUT_FAILURE,
//       payload: { artistId, error: error.response?.data || error.message },
//     });
//   }
// };

// *****************************New Code****************************

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
