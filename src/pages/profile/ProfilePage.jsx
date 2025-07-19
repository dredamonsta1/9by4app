import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchArtists } from "../../redux/actions/artistActions";
import {
  fetchProfileList,
  addArtistToProfileList,
} from "../../redux/actions/profileListActions";
import UserProfile from "../../components/userProfile/UserProfile";

const ProfilePage = () => {
  const dispatch = useDispatch();

  const {
    artists,
    loading: artistsLoading,
    error: artistsError,
  } = useSelector((state) => state.artists);
  const {
    list: profileList,
    loading: profileListLoading,
    error: profileListError,
  } = useSelector((state) => state.profileList);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchArtists());
    dispatch(fetchProfileList());
  }, [dispatch]);

  const searchResults =
    searchTerm.length > 1
      ? artists.filter((artist) =>
          artist.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];

  const handleAddArtist = (artistToAdd) => {
    dispatch(addArtistToProfileList(artistToAdd));
    setSearchTerm("");
  };

  const artistsMap = new Map(
    artists.map((artist) => [artist.artist_id, artist])
  );

  const hydratedProfileList = profileList
    .map((profileArtist) => artistsMap.get(profileArtist.artist_id))
    .filter(Boolean); // Use .filter(Boolean) to remove any undefined entries

  if (artistsError || profileListError)
    return (
      <p style={{ color: "red" }}>Error: {artistsError || profileListError}</p>
    );

  return (
    <div>
      <h2>Your Profile</h2>
      <UserProfile />
      <hr style={{ margin: "40px 0" }} />

      {/* Search Bar Section */}
      <h2>Add Artists to Your Profile</h2>
      <input
        type="text"
        placeholder="Search for an artist..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />
      {artistsLoading && searchTerm.length > 1 && <p>Searching...</p>}
      {searchResults.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {searchResults.map((artist) => (
            <li
              key={artist.artist_id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px",
                borderBottom: "1px solid #eee",
              }}
            >
              <span>{artist.name}</span>
              <button onClick={() => handleAddArtist(artist)}>Add</button>
            </li>
          ))}
        </ul>
      )}
      {/* End of Search Bar Section */}

      <hr style={{ margin: "40px 0" }} />

      {/* --- FIX: Display the hydrated list --- */}
      <h2>Your Curated Artist List</h2>
      {/* Wait for BOTH lists to finish loading */}
      {(profileListLoading || artistsLoading) && <p>Loading your list...</p>}

      {/* Only render the list when loading is complete */}
      {!(profileListLoading || artistsLoading) &&
      hydratedProfileList.length > 0 ? (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {hydratedProfileList.map((artist) => (
            <li
              key={artist.artist_id}
              style={{
                padding: "8px",
                borderBottom: "1px solid #eee",
              }}
            >
              {artist.name} - (Clout: {artist.count})
            </li>
          ))}
        </ul>
      ) : (
        !(profileListLoading || artistsLoading) && (
          <p>Your list is empty. Search for artists to add them.</p>
        )
      )}
    </div>
  );
};

export default ProfilePage;
