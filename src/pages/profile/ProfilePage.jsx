import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchArtists } from "../../redux/actions/artistActions"; // To ensure data is fetched if not already
import ClickableList from "../../components/RapperList"; // Re-use ClickableList for display
import UserProfile from "../../components/userProfile/UserProfile";

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
      <h2>Your Profile</h2>
      {/* Display user profile information */}
      <UserProfile />
      {/* <ClickableList showAdminActions={true} showCloutButton={true} /> */}
      {/* Include UserProfile component to display user details */}
    </div>
  );
};
export default ProfilePage;
