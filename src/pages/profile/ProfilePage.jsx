// import React from "react";

// function Register() {
//   return (
//     <div className="register">
//       <h1>Register</h1>
//       <form>
//         <label>
//           Username:
//           <input type="text" name="username" />
//         </label>
//         <br />
//         <label>
//           Password:
//           <input type="password" name="password" />
//         </label>
//         <br />
//         <button type="submit">Register</button>
//       </form>
//     </div>
//   );
// }
// export default Register;

// src/pages/ProfilePage.jsx
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchArtists } from "../../redux/actions/artistActions"; // To ensure data is fetched if not already
import ClickableList from "../../components/RapperList"; // Re-use ClickableList for display

const ProfilePage = () => {
  const { artists, loading, error } = useSelector((state) => state.artists);
  const dispatch = useDispatch();

  useEffect(() => {
    // Fetch artists if not already loaded, similar to dashboard
    if (!loading && !artists.length && !error) {
      dispatch(fetchArtists());
    }
  }, [dispatch, loading, artists.length, error]);

  if (loading) return <p>Loading artists for Profile page...</p>;
  if (error)
    return <p style={{ color: "red" }}>Error loading artists: {error}</p>;

  return (
    <div>
      {/* Profile list probably doesn't need admin actions or clout buttons */}
      <ClickableList
        items={artists} // Pass artists from Redux
        showAdminActions={false}
        showCloutButton={false}
      />
    </div>
  );
};
export default ProfilePage;
