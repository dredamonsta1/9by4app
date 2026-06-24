// src/pages/ContentCreators/ContentCreators.jsx
//
// Originally "Streamers" — broadened to "Content Creators" to set up
// for non-streaming creators (podcasters, journalists, video essayists,
// etc.) and bring more user types onto the list. The backend API + DB
// table stay named `streamers` for backward compat; this is a UI
// rename only.
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../../utils/axiosInstance";
import ContentCreatorCard from "../../components/ContentCreatorCard/ContentCreatorCard";
import AddContentCreatorModal from "../../components/AddContentCreatorModal/AddContentCreatorModal";
import styles from "./ContentCreators.module.css";

const PLATFORMS  = ["All", "Twitch", "YouTube", "Kick", "TikTok", "stanbox"];
const CATEGORIES = ["All", "Gaming", "Music", "IRL", "Sports", "Podcasts"];

const ContentCreators = () => {
  const { user } = useSelector((s) => s.auth);

  const [creators,     setCreators]     = useState([]);
  const [myList,       setMyList]       = useState(new Set());
  const [votedSet,     setVotedSet]     = useState(new Set());
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [search,       setSearch]       = useState("");
  const [platform,     setPlatform]     = useState("All");
  const [category,     setCategory]     = useState("All");
  const [showAdd,      setShowAdd]      = useState(false);
  const [page,         setPage]         = useState(1);
  const [hasMore,      setHasMore]      = useState(false);

  const debounceRef = useRef(null);

  // Backend endpoint paths still say /streamers — see file-header note.
  const fetchCreators = useCallback(async (reset = false) => {
    setLoading(true);
    setError(null);
    try {
      const currentPage = reset ? 1 : page;
      const params = {
        page:  currentPage,
        limit: 20,
        ...(search   && { search }),
        ...(platform !== "All" && { platform: platform.toLowerCase() }),
        ...(category !== "All" && { category }),
      };
      const res = await axiosInstance.get("/streamers", { params });
      setCreators(prev => reset ? res.data.streamers : [...prev, ...res.data.streamers]);
      setHasMore(res.data.hasMore);
      if (reset) setPage(2); else setPage(p => p + 1);
    } catch {
      setError("Failed to load content creators.");
    } finally {
      setLoading(false);
    }
  }, [search, platform, category, page]);

  // Reset + refetch when filters change
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchCreators(true);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search, platform, category]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load my list if logged in
  useEffect(() => {
    if (!user) return;
    axiosInstance.get("/streamers/user/mylist")
      .then(res => setMyList(new Set(res.data.map(s => s.streamer_id))))
      .catch(() => {});
  }, [user]);

  const handleVote = async (id) => {
    if (!user) return;
    try {
      const res = await axiosInstance.put(`/streamers/${id}/vote`);
      setVotedSet(prev => new Set([...prev, id]));
      setCreators(prev => prev.map(s =>
        s.streamer_id === id ? { ...s, count: res.data.count } : s
      ));
    } catch { /* already voted or error */ }
  };

  const handleAddToList = async (id) => {
    if (!user) return;
    await axiosInstance.post(`/streamers/${id}/mylist`);
    setMyList(prev => new Set([...prev, id]));
  };

  const handleRemoveFromList = async (id) => {
    if (!user) return;
    await axiosInstance.delete(`/streamers/${id}/mylist`);
    setMyList(prev => { const s = new Set(prev); s.delete(id); return s; });
  };

  const handleAdded = (creator) => {
    setCreators(prev => [creator, ...prev]);
    setShowAdd(false);
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Content Creators</h1>
          <p className={styles.subtitle}>Discover and follow your favorite content creators</p>
        </div>
        {user && (
          <button className={styles.addBtn} onClick={() => setShowAdd(true)}>
            + Add Creator
          </button>
        )}
      </div>

      {/* Search */}
      <div className={styles.searchWrap}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search creators…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Platform filter */}
      <div className={styles.filterSection}>
        <span className={styles.filterLabel}>Platform</span>
        <div className={styles.filterPills}>
          {PLATFORMS.map(p => (
            <button
              key={p}
              className={`${styles.pill} ${platform === p ? styles.pillActive : ""}`}
              onClick={() => setPlatform(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div className={styles.filterSection}>
        <span className={styles.filterLabel}>Category</span>
        <div className={styles.filterPills}>
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`${styles.pill} ${category === c ? styles.pillActive : ""}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && creators.length === 0 && !error && (
        <div className={styles.empty}>
          <p>No creators found.</p>
          {user && (
            <button className={styles.addBtn} onClick={() => setShowAdd(true)}>
              Be the first to add one
            </button>
          )}
        </div>
      )}

      <div className={styles.grid}>
        {creators.map((s, i) => (
          <ContentCreatorCard
            key={s.streamer_id}
            creator={s}
            rank={i + 1}
            onVote={handleVote}
            onAddToList={handleAddToList}
            onRemoveFromList={handleRemoveFromList}
            inMyList={myList.has(s.streamer_id)}
            hasVoted={votedSet.has(s.streamer_id)}
          />
        ))}
      </div>

      {loading && <p className={styles.loadingText}>Loading…</p>}

      {hasMore && !loading && (
        <button className={styles.loadMoreBtn} onClick={() => fetchCreators(false)}>
          Load more
        </button>
      )}

      {showAdd && (
        <AddContentCreatorModal onClose={() => setShowAdd(false)} onAdded={handleAdded} />
      )}
    </div>
  );
};

export default ContentCreators;
