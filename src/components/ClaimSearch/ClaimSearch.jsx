import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../../utils/axiosInstance";
import { resolveImageUrl } from "../../utils/imageUrl";
import ClaimArtistModal from "../ClaimArtistModal/ClaimArtistModal";
import styles from "./ClaimSearch.module.css";

const SEARCH_DEBOUNCE_MS = 250;

const ClaimSearch = ({ heading = "Find your artist page" }) => {
  const claimRequests = useSelector((state) => state.auth.claimRequests);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [claimTarget, setClaimTarget] = useState(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setError(null);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      setError(null);
      try {
        const res = await axiosInstance.get(
          `/artists/?search=${encodeURIComponent(trimmed)}&limit=8`
        );
        setResults(res.data?.artists ?? []);
      } catch (err) {
        setError(err.response?.data?.message || "Search failed.");
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  const pendingArtistIds = new Set(
    (claimRequests ?? [])
      .filter((c) => c.status === "pending")
      .map((c) => c.artist_id)
  );

  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>{heading}</h3>
      <input
        type="text"
        className={styles.input}
        placeholder="Search by artist name…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoComplete="off"
      />

      {searching && <p className={styles.muted}>Searching…</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!searching && !error && query.trim().length >= 2 && results.length === 0 && (
        <p className={styles.muted}>No artists matched.</p>
      )}

      {results.length > 0 && (
        <ul className={styles.list}>
          {results.map((a) => {
            const isVerified = !!a.is_verified;
            const isPending = pendingArtistIds.has(a.artist_id);
            return (
              <li key={a.artist_id} className={styles.row}>
                <img
                  src={resolveImageUrl(
                    a.image_url,
                    "https://via.placeholder.com/40?text=?"
                  )}
                  alt={a.artist_name}
                  className={styles.avatar}
                />
                <div className={styles.pair}>
                  <span className={styles.artistName}>{a.artist_name}</span>
                  {a.aka && <span className={styles.aka}>{a.aka}</span>}
                </div>
                {isVerified ? (
                  <span className={styles.claimedBadge}>Already claimed</span>
                ) : isPending ? (
                  <span className={styles.pendingBadge}>Pending review</span>
                ) : (
                  <button
                    type="button"
                    className={styles.claimBtn}
                    onClick={() => setClaimTarget(a)}
                  >
                    Claim
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {claimTarget && (
        <ClaimArtistModal
          artist={claimTarget}
          onClose={() => setClaimTarget(null)}
        />
      )}
    </div>
  );
};

export default ClaimSearch;
