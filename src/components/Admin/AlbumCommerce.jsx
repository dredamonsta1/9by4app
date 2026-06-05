import React, { useCallback, useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import styles from "./AlbumCommerce.module.css";

// Admin tool for putting albums on sale (Pillar B thin slice).
// Search artist → pick artist → pick album → set price + paste Cloudinary
// public_id → save. Audio file itself is uploaded directly to Cloudinary
// (dashboard upload with resource_type=video, type=authenticated); the
// admin pastes the returned public_id here.

const SEARCH_DEBOUNCE_MS = 250;
const PRICE_FLOOR_CENTS = 999;

const dollarsToCents = (dollarsStr) => {
  const n = parseFloat(dollarsStr);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
};

const centsToDollars = (cents) =>
  cents == null ? "" : (cents / 100).toFixed(2);

const AlbumCommerce = () => {
  // --- Artist search ---
  const [artistQuery, setArtistQuery] = useState("");
  const [artistResults, setArtistResults] = useState([]);
  const [artistSearching, setArtistSearching] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [artistDetail, setArtistDetail] = useState(null);
  const [artistLoading, setArtistLoading] = useState(false);

  // --- Album editor ---
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [form, setForm] = useState({
    price_dollars: "",
    download_enabled: false,
    audio_cloudinary_public_id: "",
    audio_format: "mp3",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [flash, setFlash] = useState(null);

  // Debounced artist search.
  useEffect(() => {
    const trimmed = artistQuery.trim();
    if (trimmed.length < 2) {
      setArtistResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setArtistSearching(true);
      try {
        const res = await axiosInstance.get(
          `/artists/?search=${encodeURIComponent(trimmed)}&limit=8`
        );
        setArtistResults(res.data?.artists ?? []);
      } catch {
        setArtistResults([]);
      } finally {
        setArtistSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [artistQuery]);

  // Fetch full artist + albums when artist is picked.
  const loadArtist = useCallback(async (artistId) => {
    setArtistLoading(true);
    try {
      const res = await axiosInstance.get(`/artists/${artistId}`);
      setArtistDetail(res.data ?? null);
    } catch {
      setArtistDetail(null);
    } finally {
      setArtistLoading(false);
    }
  }, []);

  const handlePickArtist = (a) => {
    setSelectedArtist(a);
    setArtistResults([]);
    setSelectedAlbum(null);
    setFlash(null);
    setSaveError(null);
    loadArtist(a.artist_id);
  };

  const handlePickAlbum = (album) => {
    setSelectedAlbum(album);
    setForm({
      price_dollars: centsToDollars(album.price_cents),
      download_enabled: !!album.download_enabled,
      audio_cloudinary_public_id: album.audio_cloudinary_public_id ?? "",
      audio_format: album.audio_format ?? "mp3",
    });
    setSaveError(null);
    setFlash(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveError(null);
    setFlash(null);

    const priceCents = form.price_dollars === "" ? null : dollarsToCents(form.price_dollars);
    if (priceCents != null && (!Number.isInteger(priceCents) || priceCents < PRICE_FLOOR_CENTS)) {
      setSaveError(`Price must be at least $${(PRICE_FLOOR_CENTS / 100).toFixed(2)} or blank.`);
      return;
    }

    const payload = {
      price_cents: priceCents,
      download_enabled: form.download_enabled,
      audio_cloudinary_public_id: form.audio_cloudinary_public_id.trim() || null,
      audio_format: form.audio_format || "mp3",
    };

    setSaving(true);
    try {
      const res = await axiosInstance.patch(
        `/admin/albums/${selectedAlbum.album_id}/commerce`,
        payload
      );
      const updated = res.data?.album;
      // Refresh the album row inside artistDetail so the badges update.
      setArtistDetail((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          albums: (prev.albums ?? []).map((al) =>
            al.album_id === updated.album_id ? { ...al, ...updated } : al
          ),
        };
      });
      setSelectedAlbum((prev) => (prev ? { ...prev, ...updated } : prev));
      setFlash(`Saved: ${updated.album_name}.`);
    } catch (err) {
      setSaveError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to save album commerce."
      );
    } finally {
      setSaving(false);
    }
  };

  const albums = artistDetail?.albums ?? [];

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Album Commerce</h3>
      <p className={styles.intro}>
        Set price + paste the Cloudinary <code>public_id</code> after uploading
        the audio file (resource_type=video, type=authenticated) in the
        Cloudinary dashboard.
      </p>

      {/* Step 1: search artist */}
      <div className={styles.search}>
        <label className={styles.label}>Artist</label>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by artist name…"
          value={artistQuery}
          onChange={(e) => {
            setArtistQuery(e.target.value);
            setSelectedArtist(null);
            setArtistDetail(null);
            setSelectedAlbum(null);
          }}
        />
        {artistSearching && <span className={styles.muted}>Searching…</span>}
        {selectedArtist ? (
          <div className={styles.selected}>
            Selected: <strong>{selectedArtist.artist_name}</strong> (id {selectedArtist.artist_id})
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => {
                setSelectedArtist(null);
                setArtistDetail(null);
                setSelectedAlbum(null);
                setArtistQuery("");
              }}
            >
              Clear
            </button>
          </div>
        ) : (
          artistResults.length > 0 && (
            <ul className={styles.dropdown}>
              {artistResults.map((a) => (
                <li key={a.artist_id}>
                  <button type="button" onClick={() => handlePickArtist(a)}>
                    {a.artist_name}
                    {a.is_verified && <span className={styles.verifiedTag}>verified</span>}
                    <span className={styles.muted}>· id {a.artist_id}</span>
                  </button>
                </li>
              ))}
            </ul>
          )
        )}
      </div>

      {/* Step 2: album list */}
      {selectedArtist && (
        <div className={styles.albumPicker}>
          <h4 className={styles.subTitle}>
            Albums for {selectedArtist.artist_name}
            {artistDetail?.commerce_enabled && (
              <span className={styles.commerceTag}>commerce on</span>
            )}
            {artistDetail?.stripe_charges_enabled && (
              <span className={styles.stripeTag}>Stripe ready</span>
            )}
          </h4>
          {artistLoading ? (
            <p className={styles.muted}>Loading albums…</p>
          ) : albums.length === 0 ? (
            <p className={styles.muted}>No albums for this artist.</p>
          ) : (
            <ul className={styles.albumList}>
              {albums.map((al) => {
                const isSelected = selectedAlbum?.album_id === al.album_id;
                return (
                  <li
                    key={al.album_id}
                    className={`${styles.albumRow} ${isSelected ? styles.albumRowActive : ""}`}
                  >
                    <button
                      type="button"
                      className={styles.albumBtn}
                      onClick={() => handlePickAlbum(al)}
                    >
                      <span className={styles.albumName}>
                        {al.album_name} <span className={styles.muted}>({al.year ?? "—"})</span>
                      </span>
                      <span className={styles.albumBadges}>
                        {al.price_cents != null && (
                          <span className={styles.priceBadge}>${centsToDollars(al.price_cents)}</span>
                        )}
                        {al.download_enabled && (
                          <span className={styles.dlBadge}>downloads on</span>
                        )}
                        {al.audio_cloudinary_public_id && (
                          <span className={styles.audioBadge}>has audio</span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* Step 3: album editor form */}
      {selectedAlbum && (
        <form className={styles.form} onSubmit={handleSave}>
          <h4 className={styles.subTitle}>
            Editing: {selectedAlbum.album_name}
          </h4>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="price">
              Price (USD)
            </label>
            <input
              id="price"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              className={styles.input}
              placeholder="9.99"
              value={form.price_dollars}
              onChange={(e) =>
                setForm((f) => ({ ...f, price_dollars: e.target.value }))
              }
            />
            <span className={styles.help}>
              Minimum ${(PRICE_FLOOR_CENTS / 100).toFixed(2)}. Blank = remove from sale.
            </span>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="public_id">
              Cloudinary public_id
            </label>
            <input
              id="public_id"
              type="text"
              className={styles.input}
              placeholder="audio/ballad/album-name-master"
              value={form.audio_cloudinary_public_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, audio_cloudinary_public_id: e.target.value }))
              }
              autoComplete="off"
            />
            <span className={styles.help}>
              Paste from Cloudinary dashboard after uploading the audio.
            </span>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="format">
              Format
            </label>
            <select
              id="format"
              className={styles.input}
              value={form.audio_format}
              onChange={(e) =>
                setForm((f) => ({ ...f, audio_format: e.target.value }))
              }
            >
              <option value="mp3">mp3</option>
              <option value="wav">wav</option>
              <option value="flac">flac</option>
            </select>
          </div>

          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={form.download_enabled}
              onChange={(e) =>
                setForm((f) => ({ ...f, download_enabled: e.target.checked }))
              }
            />
            <span>Downloads enabled (buy button renders on the artist page)</span>
          </label>

          {saveError && <p className={styles.error}>{saveError}</p>}
          {flash && <p className={styles.flash}>{flash}</p>}

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.saveBtn}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => setSelectedAlbum(null)}
              disabled={saving}
            >
              Done
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AlbumCommerce;
