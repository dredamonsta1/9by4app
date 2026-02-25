import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import "./RapperList.css";
import { incrementClout } from "../redux/actions/artistActions";
import { resolveImageUrl } from "../utils/imageUrl";
import axiosInstance from "../utils/axiosInstance";

const ArtistModal = ({ artist, onClose, upcomingReleases = [] }) => {
  const albums = artist.albums || [];
  const artistName = (artist.name || artist.artist_name || "").toLowerCase();
  const [awards, setAwards] = useState([]);

  useEffect(() => {
    if (!artist.artist_id) return;
    axiosInstance
      .get(`/awards/${artist.artist_id}`)
      .then((res) => setAwards(res.data))
      .catch(() => setAwards([]));
  }, [artist.artist_id]);

  const upcoming = upcomingReleases.filter(
    (r) => r.artist && r.artist.toLowerCase() === artistName && r.imageUrl
  );

  return (
    <div className="artist-modal-overlay" onClick={onClose}>
      <div className="artist-modal" onClick={(e) => e.stopPropagation()}>
        <button className="artist-modal-close" onClick={onClose}>
          &times;
        </button>
        <div className="artist-modal-header">
          {artist.image_url && (
            <img
              src={resolveImageUrl(artist.image_url)}
              alt={artist.name || "Artist"}
              className="artist-modal-image"
            />
          )}
          <div className="artist-modal-info">
            <h2>{artist.name || artist.artist_name || "N/A"}</h2>
            {artist.aka && <p className="artist-modal-aka">{artist.aka}</p>}
            <p>Genre: {artist.genre || "N/A"}</p>
            {artist.state && <p>State: {artist.state}</p>}
            {artist.label && <p>Label: {artist.label}</p>}
            <p className="artist-modal-clout">Clout: {artist.count || 0}</p>
          </div>
        </div>

        {upcoming.length > 0 && (
          <div className="artist-modal-upcoming">
            <h3>Upcoming</h3>
            {upcoming.map((release) => (
              <div key={release.id} className="artist-modal-upcoming-item">
                {release.imageUrl && (
                  <img
                    src={release.imageUrl}
                    alt={release.title}
                    className="artist-modal-upcoming-image"
                  />
                )}
                <div>
                  <span className="artist-modal-upcoming-title">{release.title}</span>
                  {release.date && (
                    <span className="artist-modal-upcoming-date">{release.date}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {albums.length > 0 && (
          <div className="artist-modal-albums">
            <h3>Albums</h3>
            <ul>
              {albums.map((album, i) => (
                <li key={album.album_id || i} className="artist-modal-album-item">
                  {album.album_image_url && (
                    <img
                      src={resolveImageUrl(album.album_image_url)}
                      alt={album.album_name}
                      className="artist-modal-album-image"
                    />
                  )}
                  <div className="artist-modal-album-text">
                    <span className="artist-modal-album-name">
                      {album.album_name}
                    </span>
                    {album.year && (
                      <span className="artist-modal-album-year">({album.year})</span>
                    )}
                    {(album.certifications || album.Certifications) && (
                      <span className="artist-modal-album-cert">
                        {album.certifications || album.Certifications}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {awards.length > 0 && (
          <div className="artist-modal-awards">
            <h3>Awards</h3>
            <ul>
              {awards.map((award) => (
                <li key={award.award_id} className="artist-modal-award-item">
                  <span className="artist-modal-award-trophy">🏆</span>
                  <div className="artist-modal-award-text">
                    <span className="artist-modal-award-name">{award.award_name}</span>
                    {award.show && (
                      <span className="artist-modal-award-show">{award.show}</span>
                    )}
                    {award.category && (
                      <span className="artist-modal-award-category">{award.category}</span>
                    )}
                    {award.year && (
                      <span className="artist-modal-award-year">({award.year})</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const ClickableList = ({ artists, showAdminActions, showCloutButton, showRank = false, upcomingReleases = [] }) => {
  const dispatch = useDispatch();
  const [selectedArtist, setSelectedArtist] = useState(null);

  if (!artists) {
    return <p>Loading artists...</p>;
  }

  if (artists.length === 0) {
    return <p>No artists found.</p>;
  }

  const handleCloutClick = (artistId) => {
    dispatch(incrementClout(artistId));
  };

  const handleDelete = async (artistId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this artist?",
    );
    if (!confirmDelete) return;
    console.log("Deleting artist with ID:", artistId);
    alert("Delete functionality would be handled here.");
  };

  const handleEdit = (artistId) => {
    console.log("Editing artist with ID:", artistId);
    alert(`Editing artist with ID: ${artistId}`);
  };

  return (
    <div className="rapperList-outter-div">
      <ul className="rapperList">
        {artists.map((item, index) => {
          const rankLabels = ["1st", "2nd", "3rd", "4th", "5th"];
          return (
            <li
              className="rapperList-item-wrapper"
              key={item.artist_id}
            >
              <div
                className="rapperList-item"
                onClick={() => setSelectedArtist(item)}
              >
                {item.image_url && (
                  <img
                    src={resolveImageUrl(item.image_url, "https://via.placeholder.com/60?text=No+Image")}
                    alt={item.name || "Artist"}
                    className="rapperList-item-image"
                  />
                )}
                <div className="rapperList-content-overlay">
                  <div className="rapperList-item-details">
                    <h3>{item.name || "N/A"}</h3>
                    <p>Genre: {item.genre || "N/A"}</p>
                  </div>

                  <div className="rapperList-item-clout-section">
                    {showCloutButton ? (
                      <button
                        className="rapperButton"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloutClick(item.artist_id);
                        }}
                      >
                        Clout: {item.count}
                      </button>
                    ) : (
                      <p className="clout-data-display">
                        Clout: <span>{item.count}</span>
                      </p>
                    )}
                  </div>

                  {showAdminActions && (
                    <div className="rapperList-admin-actions">
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(item.artist_id); }}>
                        Delete
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(item.artist_id); }}>
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {showRank && index < 5 && (
                <span className="rapperList-rank">{rankLabels[index]}</span>
              )}
            </li>
          );
        })}
      </ul>

      {selectedArtist && (
        <ArtistModal
          artist={selectedArtist}
          onClose={() => setSelectedArtist(null)}
          upcomingReleases={upcomingReleases}
        />
      )}
    </div>
  );
};

export default ClickableList;
