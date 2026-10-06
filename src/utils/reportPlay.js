import axiosInstance from "./axiosInstance";

// Preview plays (Story 29): a clip counts once it has played this long, so
// skipping through doesn't register. The backend records signed-in users
// only; callers check that before calling, so logged-out listening never
// leaves the browser.
export const PLAY_THRESHOLD_SECONDS = 10;

/** Fire-and-forget. A failed report must never interrupt playback. */
export function reportPlay({ artist_id, album_id = null, source = null }) {
  if (!artist_id) return;
  axiosInstance
    .post("/plays", { artist_id, album_id: album_id ?? undefined, source: source ?? undefined })
    .catch(() => {});
}
