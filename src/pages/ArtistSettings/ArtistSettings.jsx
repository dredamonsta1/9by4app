import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import ClaimSearch from "../../components/ClaimSearch/ClaimSearch";
import StripeOnboardingSection from "../../components/StripeOnboardingSection/StripeOnboardingSection";
import YourMusic from "../../components/YourMusic/YourMusic";
import styles from "./ArtistSettings.module.css";

const FIELDS = [
  {
    key: "website_url",
    label: "Website",
    help: "Your main artist site",
    placeholder: "https://yourname.com",
  },
  {
    key: "merch_url",
    label: "Merch",
    help: "Where fans buy your merch",
    placeholder: "https://shop.yourname.com",
  },
  {
    key: "newsletter_url",
    label: "Newsletter (external)",
    help: "Substack, Mailchimp, etc. stanbox users can also follow you for the digest.",
    placeholder: "https://yourname.substack.com",
  },
  {
    key: "spotify_url",
    label: "Spotify (artist)",
    help: "Shown as \"Listen on Spotify\" on your page",
    placeholder: "https://open.spotify.com/artist/...",
  },
  {
    key: "apple_music_url",
    label: "Apple Music (artist)",
    help: "Shown as \"Listen on Apple Music\"",
    placeholder: "https://music.apple.com/us/artist/...",
  },
];

const isValidUrl = (v) => v === "" || /^https?:\/\//i.test(v.trim());

const formatDate = (iso) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
};

const ArtistSettings = () => {
  const { user, token, claimRequests } = useSelector((state) => state.auth);
  const artistId = user?.artist_id ?? null;
  const pendingClaims = (claimRequests ?? []).filter((c) => c.status === "pending");
  const navigate = useNavigate();

  const [initial, setInitial] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!artistId) return;
    setLoading(true);
    setError(null);
    axiosInstance
      .get(`/artists/${artistId}`)
      .then((res) => {
        const a = res.data?.artist ?? {};
        const seed = FIELDS.reduce((acc, f) => {
          acc[f.key] = a[f.key] ?? "";
          return acc;
        }, {});
        setInitial(seed);
        setForm(seed);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load your world.");
      })
      .finally(() => setLoading(false));
  }, [artistId]);

  const dirtyFields = useMemo(() => {
    if (!initial) return [];
    return FIELDS.map((f) => f.key).filter((k) => (form[k] ?? "") !== (initial[k] ?? ""));
  }, [form, initial]);

  const handleChange = (key) => (e) => {
    const v = e.target.value;
    setForm((prev) => ({ ...prev, [key]: v }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSavedAt(null);

    const localErrors = {};
    for (const k of dirtyFields) {
      if (!isValidUrl(form[k] ?? "")) {
        localErrors[k] = "Must start with http:// or https://, or be empty.";
      }
    }
    setFieldErrors(localErrors);
    if (Object.keys(localErrors).length > 0) return;

    if (dirtyFields.length === 0) {
      setError("No changes to save.");
      return;
    }

    const payload = dirtyFields.reduce((acc, k) => {
      acc[k] = form[k] ?? "";
      return acc;
    }, {});

    setSaving(true);
    try {
      const res = await axiosInstance.patch("/artists/me", payload);
      const updated = res.data ?? {};
      const next = FIELDS.reduce((acc, f) => {
        acc[f.key] = updated[f.key] ?? "";
        return acc;
      }, {});
      setInitial(next);
      setForm(next);
      setSavedAt(Date.now());
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (initial) setForm(initial);
    setFieldErrors({});
    setError(null);
  };

  if (!token) {
    return (
      <div className={styles.page}>
        <div className={styles.gate}>
          <h1>Artist settings</h1>
          <p>Log in to edit your artist world.</p>
          <Link to="/login" className={styles.gateBtn}>Log in</Link>
        </div>
      </div>
    );
  }

  if (!artistId) {
    const hasPending = pendingClaims.length > 0;
    return (
      <div className={styles.page}>
        <div className={styles.gate}>
          <h1>Artist settings</h1>
          <p>This page is for verified artists on stanbox.</p>
          {hasPending && (
            <div className={styles.pendingBlock}>
              <p className={styles.pendingTitle}>Pending review</p>
              <ul className={styles.pendingList}>
                {pendingClaims.map((c) => (
                  <li key={c.id} className={styles.pendingRow}>
                    <span className={styles.pendingArtist}>{c.artist_name}</span>
                    <span className={styles.pendingSub}>
                      Submitted {formatDate(c.created_at)} — we'll email you when it's reviewed.
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <ClaimSearch
            heading={hasPending ? "Claim another artist" : "Find your artist page"}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Artist settings</h1>
        <p className={styles.subtitle}>
          Edit your world — what shows up on your stanbox artist page.
        </p>
      </header>

      <StripeOnboardingSection />

      <YourMusic />

      {loading && <p className={styles.muted}>Loading your world…</p>}
      {error && <p className={styles.errorBanner}>{error}</p>}

      {!loading && initial && (
        <form className={styles.form} onSubmit={handleSubmit}>
          {FIELDS.map((f) => (
            <div key={f.key} className={styles.field}>
              <label className={styles.label} htmlFor={f.key}>
                {f.label}
              </label>
              <input
                id={f.key}
                type="url"
                inputMode="url"
                autoComplete="off"
                className={`${styles.input} ${fieldErrors[f.key] ? styles.inputError : ""}`}
                placeholder={f.placeholder}
                value={form[f.key] ?? ""}
                onChange={handleChange(f.key)}
              />
              {fieldErrors[f.key] ? (
                <span className={styles.fieldError}>{fieldErrors[f.key]}</span>
              ) : (
                <span className={styles.help}>{f.help}</span>
              )}
            </div>
          ))}

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.saveBtn}
              disabled={saving || dirtyFields.length === 0}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={handleCancel}
              disabled={saving || dirtyFields.length === 0}
            >
              Cancel
            </button>
            {savedAt && (
              <button
                type="button"
                className={styles.viewBtn}
                onClick={() => navigate(`/artist/${artistId}`)}
              >
                View your page →
              </button>
            )}
          </div>

          {savedAt && (
            <p className={styles.savedToast}>✓ Saved</p>
          )}
        </form>
      )}
    </div>
  );
};

export default ArtistSettings;
