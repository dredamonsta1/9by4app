import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../utils/axiosInstance";
import styles from "./ArtistLinkages.module.css";

function ArtistLinkages() {
  const [linkages, setLinkages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unlinking, setUnlinking] = useState(null);

  const [artistQuery, setArtistQuery] = useState("");
  const [artistResults, setArtistResults] = useState([]);
  const [artistSearching, setArtistSearching] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);

  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [userSearching, setUserSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [linking, setLinking] = useState(false);
  const [linkMessage, setLinkMessage] = useState(null);

  const fetchLinkages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/admin/artist-linkages");
      setLinkages(res.data.linkages ?? []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load linkages.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLinkages(); }, [fetchLinkages]);

  // Artist search (debounced)
  useEffect(() => {
    if (!artistQuery || artistQuery.trim().length < 2) {
      setArtistResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setArtistSearching(true);
      try {
        const res = await axiosInstance.get(
          `/artists/?search=${encodeURIComponent(artistQuery.trim())}&limit=8`
        );
        setArtistResults(res.data.artists ?? res.data ?? []);
      } catch {
        setArtistResults([]);
      } finally {
        setArtistSearching(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [artistQuery]);

  // User search (debounced)
  useEffect(() => {
    if (!userQuery || userQuery.trim().length < 2) {
      setUserResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setUserSearching(true);
      try {
        const res = await axiosInstance.get(
          `/admin/users?search=${encodeURIComponent(userQuery.trim())}&limit=8`
        );
        setUserResults(res.data.users ?? []);
      } catch {
        setUserResults([]);
      } finally {
        setUserSearching(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [userQuery]);

  const handleUnlink = async (userId, username, artistName) => {
    if (!window.confirm(`Unlink @${username} from ${artistName}? This also clears any digest cooldown for ${artistName}.`)) return;
    setUnlinking(userId);
    try {
      const res = await axiosInstance.post(`/admin/users/${userId}/unlink-artist`);
      setLinkages((prev) => prev.filter((l) => l.user_id !== userId));
      setLinkMessage(`Unlinked @${username} from ${res.data.unlinked_artist_name} (purged ${res.data.digest_logs_purged} digest log row${res.data.digest_logs_purged === 1 ? "" : "s"}).`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to unlink.");
    } finally {
      setUnlinking(null);
    }
  };

  const handleLink = async (e) => {
    e.preventDefault();
    if (!selectedArtist || !selectedUser) return;
    setLinking(true);
    setLinkMessage(null);
    try {
      const res = await axiosInstance.patch(`/admin/users/${selectedUser.user_id}/artist_id`, {
        artist_id: selectedArtist.artist_id,
      });
      setLinkMessage(`Linked @${res.data.username} → ${selectedArtist.artist_name}.`);
      setSelectedArtist(null);
      setSelectedUser(null);
      setArtistQuery("");
      setUserQuery("");
      fetchLinkages();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to link.";
      setLinkMessage(`Error: ${msg}`);
    } finally {
      setLinking(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          Currently linked <span className={styles.count}>({linkages.length})</span>
        </h3>
        <button className={styles.refreshBtn} onClick={fetchLinkages}>Refresh</button>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {linkMessage && <p className={styles.flash}>{linkMessage}</p>}

      {loading ? (
        <p className={styles.muted}>Loading…</p>
      ) : linkages.length === 0 ? (
        <p className={styles.muted}>No artists are linked yet.</p>
      ) : (
        <ul className={styles.list}>
          {linkages.map((l) => (
            <li key={l.user_id} className={styles.row}>
              {l.image_url ? (
                <img src={l.image_url} alt={l.artist_name} className={styles.avatar} />
              ) : (
                <span className={styles.avatarFallback}>
                  {(l.artist_name?.[0] ?? "?").toUpperCase()}
                </span>
              )}
              <div className={styles.pair}>
                <span className={styles.artistName}>{l.artist_name}</span>
                <span className={styles.userLine}>@{l.username} · user #{l.user_id}</span>
              </div>
              <button
                className={styles.unlinkBtn}
                onClick={() => handleUnlink(l.user_id, l.username, l.artist_name)}
                disabled={unlinking === l.user_id}
              >
                {unlinking === l.user_id ? "Unlinking…" : "Unlink"}
              </button>
            </li>
          ))}
        </ul>
      )}

      <hr className={styles.divider} />

      <h3 className={styles.title}>Link a new pair</h3>
      <form className={styles.linkForm} onSubmit={handleLink}>
        <div className={styles.search}>
          <label className={styles.label}>Artist</label>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by artist name…"
            value={artistQuery}
            onChange={(e) => { setArtistQuery(e.target.value); setSelectedArtist(null); }}
          />
          {artistSearching && <span className={styles.muted}>Searching…</span>}
          {selectedArtist ? (
            <div className={styles.selected}>Selected: <strong>{selectedArtist.artist_name}</strong> (id {selectedArtist.artist_id})</div>
          ) : (
            artistResults.length > 0 && (
              <ul className={styles.dropdown}>
                {artistResults.map((a) => (
                  <li key={a.artist_id}>
                    <button type="button" onClick={() => { setSelectedArtist(a); setArtistResults([]); }}>
                      {a.artist_name} <span className={styles.muted}>· id {a.artist_id}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )
          )}
        </div>

        <div className={styles.search}>
          <label className={styles.label}>User</label>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by username or email…"
            value={userQuery}
            onChange={(e) => { setUserQuery(e.target.value); setSelectedUser(null); }}
          />
          {userSearching && <span className={styles.muted}>Searching…</span>}
          {selectedUser ? (
            <div className={styles.selected}>Selected: <strong>@{selectedUser.username}</strong> (user {selectedUser.user_id})</div>
          ) : (
            userResults.length > 0 && (
              <ul className={styles.dropdown}>
                {userResults.map((u) => (
                  <li key={u.user_id}>
                    <button type="button" onClick={() => { setSelectedUser(u); setUserResults([]); }}>
                      @{u.username} <span className={styles.muted}>· {u.email}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )
          )}
        </div>

        <button
          type="submit"
          className={styles.linkBtn}
          disabled={!selectedArtist || !selectedUser || linking}
        >
          {linking ? "Linking…" : "Link"}
        </button>
      </form>
    </div>
  );
}

export default ArtistLinkages;
