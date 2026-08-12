const KEY = "stanbox_pending_stan";

// A guest who hits the auth wall and signs up should land with the artist
// they wanted already in their Top 20 — starting at 1/3 rather than 0/3.
// The signup flow round-trips through an emailed OTP, so a query param
// wouldn't reliably survive it; this rides in localStorage instead.

// Long enough to cover "check email, come back", short enough that intent
// from weeks ago doesn't silently add an artist to a later session.
const TTL_MS = 24 * 60 * 60 * 1000;

export const setPendingStan = (artist) => {
  if (!artist?.artist_id) return;
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        artist_id: artist.artist_id,
        artist_name: artist.artist_name ?? artist.name ?? null,
        image_url: artist.image_url ?? null,
        savedAt: Date.now(),
      })
    );
  } catch {
    // Private browsing or a full quota — the signup still works, the user
    // just doesn't get the head start.
  }
};

/**
 * Read and clear in one step.
 *
 * Clearing always happens, whatever the caller does with the value. If the
 * add fails, the intent is spent rather than left behind to re-fire on some
 * unrelated future login.
 */
export const takePendingStan = () => {
  let raw;
  try {
    raw = localStorage.getItem(KEY);
    localStorage.removeItem(KEY);
  } catch {
    return null;
  }
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.artist_id) return null;
    if (!parsed.savedAt || Date.now() - parsed.savedAt > TTL_MS) return null;
    return parsed;
  } catch {
    // Corrupt value — already removed above.
    return null;
  }
};

export const PENDING_STAN_KEY = KEY;
export const PENDING_STAN_TTL_MS = TTL_MS;
