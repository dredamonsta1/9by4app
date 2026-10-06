import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

// The artist panel's "Fans Also Love" box, with a fallback.
//
// /related is Top 20 co-listing: the strongest signal, but sparse — and it
// can never include an artist nobody has stanned yet. When it has fewer
// than FANS_ENOUGH artists, /similar (shared genre tags + co-listing, Story
// 29) fills the rest, and the box is titled "Similar Artists" so it doesn't
// claim fan behaviour it doesn't have.

export const FANS_ENOUGH = 4;
export const BOX_SIZE = 8;

const UPPERCASE_TAGS = new Set(["edm", "idm", "mpb"]);

/** "dream-pop" → "dream pop", "r-and-b" → "R&B", "hip-hop" stays. */
export const tagLabel = (slug) => {
  if (slug === "r-and-b") return "R&B";
  if (UPPERCASE_TAGS.has(slug)) return slug.toUpperCase();
  return slug.replace(/-/g, " ").replace(/\bhip hop\b/g, "hip-hop").replace(/\buk\b/g, "UK");
};

/**
 * "dream pop · indie pop". The first tags /similar returns are the exact
 * shared ones (families come after, at lower weight), so two is enough.
 */
export const similarReason = (reasons) =>
  (reasons?.shared_tags ?? []).slice(0, 2).map(tagLabel).join(" · ");

/**
 * Returns { artists, title }. Each artist carries `reason`: the shared tags
 * for a similar-sound pick, or null for a fan pick (shown with its genre).
 */
export function useSimilarArtists(artistId) {
  const [state, setState] = useState({ artists: [], title: "Fans Also Love" });

  useEffect(() => {
    setState({ artists: [], title: "Fans Also Love" });
    if (!artistId) return undefined;
    // Ignore responses for an artist the user has already moved past.
    let active = true;

    (async () => {
      const related = await axiosInstance
        .get(`/artists/${artistId}/related?limit=${BOX_SIZE}`)
        .then((res) => (Array.isArray(res.data) ? res.data : []))
        .catch(() => []);
      const fanPicks = related.map((a) => ({ ...a, reason: null }));

      if (fanPicks.length >= FANS_ENOUGH) {
        if (active) setState({ artists: fanPicks, title: "Fans Also Love" });
        return;
      }

      const similar = await axiosInstance
        .get(`/artists/${artistId}/similar?limit=${BOX_SIZE}`)
        .then((res) => (Array.isArray(res.data) ? res.data : []))
        .catch(() => []);
      const seen = new Set(fanPicks.map((a) => a.artist_id));
      const soundPicks = similar
        .filter((a) => !seen.has(a.artist_id))
        .map((a) => ({ ...a, reason: similarReason(a.reasons) || null }));

      if (active) {
        setState({
          artists: [...fanPicks, ...soundPicks].slice(0, BOX_SIZE),
          title: soundPicks.length > 0 ? "Similar Artists" : "Fans Also Love",
        });
      }
    })();

    return () => {
      active = false;
    };
  }, [artistId]);

  return state;
}
