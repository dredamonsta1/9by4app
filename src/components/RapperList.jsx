import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import "./RapperList.css";
import { addArtistToProfileList, reorderProfileList } from "../redux/actions/profileListActions";
import { setQueue } from "../redux/playerSlice";
import { resolveImageUrl } from "../utils/imageUrl";
import axiosInstance from "../utils/axiosInstance";

// ---- Position Selector ----
const PositionSelector = ({ profileList, artistId, onSelect, onClose }) => {
  const slots = Array.from({ length: 20 }, (_, i) => i + 1);
  const occupiedMap = {};
  profileList.forEach((a) => { if (a.position) occupiedMap[a.position] = a.artist_name; });

  return (
    <div className="pos-selector-overlay" onClick={onClose}>
      <div className="pos-selector" onClick={(e) => e.stopPropagation()}>
        <div className="pos-selector-header">
          <span>Choose a position</span>
          <button className="artist-modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="pos-selector-grid">
          {slots.map((n) => {
            const who = occupiedMap[n];
            return (
              <button
                key={n}
                className={`pos-slot ${who ? "pos-slot-occupied" : "pos-slot-empty"}`}
                disabled={!!who}
                onClick={() => !who && onSelect(n)}
                title={who || `Add at #${n}`}
              >
                <span className="pos-slot-num">{n}</span>
                {who && <span className="pos-slot-name">{who}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ---- Artist Modal ----
export const ArtistModal = ({ artist, onClose, upcomingReleases = [] }) => {
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((state) => state.auth);
  const profileList = useSelector((state) => state.profileList.list);
  const allArtists = useSelector((state) => state.artists.artists);

  // Navigation stack — supports clicking related artist chips
  const [stack, setStack] = useState([artist]);
  const current = stack[stack.length - 1];

  const [fullArtist, setFullArtist] = useState(null);
  const [awards, setAwards] = useState([]);
  const [related, setRelated] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [stanRank, setStanRank] = useState(null);
  const [showPositionSelector, setShowPositionSelector] = useState(false);
  const [artistTracks, setArtistTracks] = useState([]);
  const [liveRecordings, setLiveRecordings] = useState([]);
  const [loadingTracks, setLoadingTracks] = useState(null); // recording_id being loaded

  // Re-fetch whenever the top of the stack changes
  useEffect(() => {
    if (!current?.artist_id) return;
    setFullArtist(null);
    setAwards([]);
    setRelated([]);
    setVerifications([]);
    setStanRank(null);
    setLiveRecordings([]);

    axiosInstance.get(`/artists/${current.artist_id}`)
      .then((res) => setFullArtist(res.data.artist))
      .catch(() => setFullArtist(current));

    axiosInstance.get(`/awards/${current.artist_id}`)
      .then((res) => setAwards(res.data))
      .catch(() => {});

    axiosInstance.get(`/artists/${current.artist_id}/related`)
      .then((res) => setRelated(res.data))
      .catch(() => {});

    axiosInstance.get(`/artists/${current.artist_id}/verifications`)
      .then((res) => setVerifications(res.data))
      .catch(() => {});

    if (isLoggedIn) {
      axiosInstance.get(`/communities/artist/${current.artist_id}/my-rank`)
        .then((res) => setStanRank(res.data))
        .catch(() => {});
    }

    axiosInstance.get(`/music/posts/artist/${current.artist_id}`)
      .then((res) => setArtistTracks(res.data))
      .catch(() => setArtistTracks([]));

    axiosInstance.get(`/live-recordings?artist_id=${current.artist_id}&limit=50`)
      .then((res) => setLiveRecordings(res.data.recordings || []))
      .catch(() => setLiveRecordings([]));
  }, [current?.artist_id, isLoggedIn]);

  // Escape key to close
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const pushArtist = (a) => setStack((s) => [...s, a]);
  const popArtist = () => setStack((s) => s.slice(0, -1));

  const data = fullArtist || current;
  const albums = data.albums || [];
  const singles = data.singles || [];
  const artistName = (data.name || data.artist_name || "").toLowerCase();

  // Global rank — index in sorted artists array
  const rankIndex = allArtists.findIndex((a) => a.artist_id === data.artist_id);
  const rank = rankIndex >= 0 ? rankIndex + 1 : null;

  const upcoming = upcomingReleases.filter(
    (r) => r.artist && r.artist.toLowerCase() === artistName && r.imageUrl
  );

  const inList = profileList.some((a) => a.artist_id === data.artist_id);
  const myEntry = profileList.find((a) => a.artist_id === data.artist_id);
  const listFull = profileList.length >= 20;

  const handlePositionSelect = async (pos) => {
    setShowPositionSelector(false);
    // Add the artist (appended), then reorder to put it at selected position
    await dispatch(addArtistToProfileList(data));
    // Build new order: insert at pos - 1
    const currentIds = profileList.map((a) => a.artist_id).filter((id) => id !== data.artist_id);
    currentIds.splice(pos - 1, 0, data.artist_id);
    dispatch(reorderProfileList(currentIds));
  };

  const handleChangePosition = (pos) => {
    setShowPositionSelector(false);
    const newOrder = profileList.map((a) => a.artist_id).filter((id) => id !== data.artist_id);
    newOrder.splice(pos - 1, 0, data.artist_id);
    dispatch(reorderProfileList(newOrder));
  };

  const handleShare = () => {
    const url = `${window.location.origin}/artist/${data.artist_id}`;
    const text = `${data.artist_name || data.name} — #${rank ?? "?"} on stanbox`;
    if (navigator.share) {
      navigator.share({ title: text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => alert("Link copied!")).catch(() => {});
    }
  };

  const verifiedCount = verifications.find((v) => v.verdict === "verified")?.count || 0;
  const disputedCount = verifications.find((v) => v.verdict === "disputed")?.count || 0;

  return (
    <div className="artist-modal-overlay" onClick={onClose}>
      <div className="artist-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header controls */}
        <div className="artist-modal-topbar">
          {stack.length > 1 && (
            <button className="artist-modal-back" onClick={popArtist}>← Back</button>
          )}
          <div className="artist-modal-topbar-actions">
            <button className="artist-modal-share-btn" onClick={handleShare} title="Share">⬆</button>
            <button className="artist-modal-close" onClick={onClose}>&times;</button>
          </div>
        </div>

        {/* Header: image + name + badges */}
        <div className="artist-modal-header">
          <img
            src={resolveImageUrl(data.image_url, "https://via.placeholder.com/120?text=?")}
            alt={data.artist_name || "Artist"}
            className="artist-modal-image"
          />
          <div className="artist-modal-info">
            <h2>{data.artist_name || data.name || "N/A"}</h2>
            {data.aka && <p className="artist-modal-aka">{data.aka}</p>}
            <div className="artist-modal-badges">
              {rank && <span className="artist-modal-rank-badge">#{rank} on the list</span>}
            </div>
            <p className="artist-modal-clout">
              {(data.count || 0).toLocaleString()} fans claim them
            </p>
            <div className="artist-modal-tags">
              {data.genre && <span className="artist-modal-tag">{data.genre}</span>}
              {data.state && <span className="artist-modal-tag">{data.state}</span>}
              {data.region && <span className="artist-modal-tag">{data.region}</span>}
              {data.label && <span className="artist-modal-tag">{data.label}</span>}
            </div>
            {data.website_url && (
              <a
                href={data.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="artist-modal-shop-link"
              >
                Official Shop
              </a>
            )}
          </div>
        </div>

        {/* Stan rank (logged-in, if record exists) */}
        {isLoggedIn && stanRank && (
          <div className="artist-modal-stan-rank">
            <span className="stan-tier">{stanRank.tier}</span>
            <span className="stan-score">{stanRank.score} pts</span>
          </div>
        )}

        {/* Agent verifications */}
        {(verifiedCount > 0 || disputedCount > 0) && (
          <div className="artist-modal-verifications">
            {verifiedCount > 0 && (
              <span className="verif-badge verif-verified">✓ {verifiedCount} verified</span>
            )}
            {disputedCount > 0 && (
              <span className="verif-badge verif-disputed">⚠ {disputedCount} disputed</span>
            )}
          </div>
        )}

        {/* Group members */}
        {data.members && data.members.length > 0 && (
          <div className="artist-modal-members">
            <h3>Members</h3>
            <div className="artist-modal-members-list">
              {data.members.map((member) => (
                <div
                  key={member.artist_id}
                  className="artist-modal-member-chip"
                  onClick={() => pushArtist({ artist_id: member.artist_id, artist_name: member.artist_name, image_url: member.image_url })}
                >
                  {member.image_url && (
                    <img
                      src={resolveImageUrl(member.image_url, "https://via.placeholder.com/32?text=?")}
                      alt={member.artist_name}
                      className="artist-modal-member-avatar"
                    />
                  )}
                  <span>{member.artist_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Groups this artist belongs to */}
        {data.groups && data.groups.length > 0 && (
          <div className="artist-modal-members">
            <h3>Member of</h3>
            <div className="artist-modal-members-list">
              {data.groups.map((group) => (
                <div
                  key={group.artist_id}
                  className="artist-modal-member-chip"
                  onClick={() => pushArtist({ artist_id: group.artist_id, artist_name: group.artist_name, image_url: group.image_url })}
                >
                  {group.image_url && (
                    <img
                      src={resolveImageUrl(group.image_url, "https://via.placeholder.com/32?text=?")}
                      alt={group.artist_name}
                      className="artist-modal-member-avatar"
                    />
                  )}
                  <span>{group.artist_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming releases */}
        {upcoming.length > 0 && (
          <div className="artist-modal-upcoming">
            <h3>Upcoming</h3>
            {upcoming.map((release) => (
              <div key={release.id} className="artist-modal-upcoming-item">
                {release.imageUrl && (
                  <img src={release.imageUrl} alt={release.title} className="artist-modal-upcoming-image" />
                )}
                <div>
                  <span className="artist-modal-upcoming-title">{release.title}</span>
                  {release.date && <span className="artist-modal-upcoming-date">{release.date}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Albums — horizontal scroll */}
        {albums.length > 0 && (
          <div className="artist-modal-albums">
            <h3>Albums</h3>
            <div className="artist-modal-albums-scroll">
              {albums.map((album, i) => {
                const hasTracks = artistTracks.length > 0;
                return (
                  <div key={album.album_id || i} className="artist-modal-album-card">
                    <div className="artist-modal-album-img-wrap">
                      {album.album_image_url ? (
                        <img
                          src={resolveImageUrl(album.album_image_url)}
                          alt={album.album_name}
                          className="artist-modal-album-card-img"
                        />
                      ) : (
                        <div className="artist-modal-album-card-placeholder">
                          {(album.album_name || "").split(" ").map((w) => w[0]).join("").slice(0, 3)}
                        </div>
                      )}
                      {hasTracks && (
                        <button
                          className="artist-modal-album-play-btn"
                          onClick={() => dispatch(setQueue({
                            tracks: artistTracks.map((t) => ({
                              post_id: t.post_id,
                              title: t.title,
                              audio_url: t.audio_url,
                              username: t.username,
                              artist_name: data.artist_name,
                              album_image_url: album.album_image_url,
                            })),
                            startIndex: 0,
                          }))}
                          aria-label={`Play ${album.album_name}`}
                        >
                          ▶
                        </button>
                      )}
                    </div>
                    <span className="artist-modal-album-card-name">{album.album_name}</span>
                    <span className="artist-modal-album-card-year">{album.year}</span>
                    {(album.certifications || album.Certifications) && (() => {
                      const cert = album.certifications || album.Certifications;
                      const isEligible = cert.toLowerCase().startsWith("eligible");
                      return (
                        <span className={isEligible ? "artist-modal-album-cert artist-modal-album-cert--eligible" : "artist-modal-album-cert"}>
                          {cert}
                        </span>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Singles — horizontal scroll */}
        {singles.length > 0 && (
          <div className="artist-modal-albums">
            <h3>Singles</h3>
            <div className="artist-modal-albums-scroll">
              {singles.map((single, i) => (
                <div key={single.single_id || i} className="artist-modal-album-card">
                  <div className="artist-modal-album-img-wrap">
                    {single.single_image_url ? (
                      <img
                        src={resolveImageUrl(single.single_image_url)}
                        alt={single.single_name}
                        className="artist-modal-album-card-img"
                      />
                    ) : (
                      <div className="artist-modal-album-card-placeholder">
                        {(single.single_name || "").split(" ").map((w) => w[0]).join("").slice(0, 3)}
                      </div>
                    )}
                    {single.stream_url && (
                      <a
                        href={single.stream_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="artist-modal-album-play-btn"
                        aria-label={`Listen to ${single.single_name}`}
                      >
                        ▶
                      </a>
                    )}
                  </div>
                  <span className="artist-modal-album-card-name">{single.single_name}</span>
                  <span className="artist-modal-album-card-year">{single.year}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Recordings */}
        {liveRecordings.length > 0 && (
          <div className="artist-modal-albums">
            <h3>Live Recordings</h3>
            <div className="artist-modal-albums-scroll">
              {liveRecordings.map((rec) => {
                const date = rec.recorded_date
                  ? new Date(rec.recorded_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                  : "Unknown date";
                const isLoading = loadingTracks === rec.recording_id;
                return (
                  <div key={rec.recording_id} className="artist-modal-album-card">
                    <div className="artist-modal-album-img-wrap">
                      <div className="artist-modal-album-card-placeholder" style={{ fontSize: "1.4rem" }}>🎙</div>
                      <button
                        className="artist-modal-album-play-btn"
                        disabled={isLoading}
                        aria-label={`Play ${rec.title}`}
                        onClick={async () => {
                          setLoadingTracks(rec.recording_id);
                          try {
                            const res = await axiosInstance.get(`/live-recordings/${rec.recording_id}/tracks`);
                            const { tracks, artist_name } = res.data;
                            if (!tracks.length) return;
                            dispatch(setQueue({
                              tracks: tracks.map((t, i) => ({
                                post_id: rec.recording_id * 1000 + i,
                                title: t.title,
                                audio_url: t.stream_url,
                                username: artist_name,
                                artist_name,
                                album_image_url: data.image_url || null,
                              })),
                              startIndex: 0,
                            }));
                          } catch (e) {
                            console.error("Failed to load live tracks", e);
                          } finally {
                            setLoadingTracks(null);
                          }
                        }}
                      >
                        {isLoading ? "…" : "▶"}
                      </button>
                    </div>
                    <span className="artist-modal-album-card-name">{rec.venue || "Live"}</span>
                    <span className="artist-modal-album-card-year">{date}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Awards */}
        {awards.length > 0 && (
          <div className="artist-modal-awards">
            <h3>Awards</h3>
            <ul>
              {awards.map((award) => (
                <li key={award.award_id} className="artist-modal-award-item">
                  <span className="artist-modal-award-trophy">🏆</span>
                  <div className="artist-modal-award-text">
                    <span className="artist-modal-award-name">{award.award_name}</span>
                    {award.show && <span className="artist-modal-award-show">{award.show}</span>}
                    {award.category && <span className="artist-modal-award-category">{award.category}</span>}
                    {award.year && <span className="artist-modal-award-year">({award.year})</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Related artists */}
        {related.length > 0 && (
          <div className="artist-modal-related">
            <h3>Fans of {data.artist_name || data.name} also love...</h3>
            <div className="artist-modal-related-scroll">
              {related.map((rel) => (
                <button
                  key={rel.artist_id}
                  className="artist-modal-related-chip"
                  onClick={() => pushArtist(rel)}
                >
                  <img
                    src={resolveImageUrl(rel.image_url, "https://via.placeholder.com/40?text=?")}
                    alt={rel.artist_name}
                    className="related-chip-img"
                  />
                  <span className="related-chip-name">{rel.artist_name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CTA block */}
        <div className="artist-modal-cta">
          {isLoggedIn ? (
            inList ? (
              <div className="cta-in-list">
                <span className="cta-in-list-label">
                  In your Top 20{myEntry?.position ? ` — Your #${myEntry.position}` : ""}
                </span>
                <button
                  className="cta-change-pos-btn"
                  onClick={() => setShowPositionSelector(true)}
                >
                  Change position
                </button>
              </div>
            ) : (
              <button
                className="cta-add-btn"
                disabled={listFull}
                onClick={() => listFull ? null : setShowPositionSelector(true)}
              >
                {listFull ? "Your list is full" : "Add to your Top 20"}
              </button>
            )
          ) : (
            <Link to="/signup" className="cta-signup-btn" onClick={onClose}>
              Sign up to build your Top 20
            </Link>
          )}
        </div>

        {/* Position selector */}
        {showPositionSelector && (
          <PositionSelector
            profileList={profileList}
            artistId={data.artist_id}
            onSelect={inList ? handleChangePosition : handlePositionSelect}
            onClose={() => setShowPositionSelector(false)}
          />
        )}
      </div>
    </div>
  );
};

const ClickableList = ({ artists, showAdminActions, showCloutButton, showRank = false, simplified = false, upcomingReleases = [] }) => {
  const dispatch = useDispatch();
  const [selectedArtist, setSelectedArtist] = useState(null);

  if (!artists) {
    return <p>Loading artists...</p>;
  }

  if (artists.length === 0) {
    return <p>No artists found.</p>;
  }

  const handleCloutClick = (artist) => {
    dispatch(addArtistToProfileList(artist));
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
                    {!simplified && <p>Genre: {item.genre || "N/A"}</p>}
                  </div>

                  {!simplified && (
                    <div className="rapperList-item-clout-section">
                      {showCloutButton ? (
                        <button
                          className="rapperButton"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCloutClick(item);
                          }}
                        >
                          Clout: {item.count}
                        </button>
                      ) : (
                        <>
                          <p className="clout-data-display">
                            Clout: <span>{item.count}</span>
                          </p>
                          <Link
                            to="/signup"
                            className="clout-waitlist-nudge"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Join the waitlist so you can get your favorite to first place
                          </Link>
                        </>
                      )}
                    </div>
                  )}

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
