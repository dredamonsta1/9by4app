import { resolveImageUrl } from "../../utils/imageUrl";

export const SHRINE_SLOTS = 20;
// First five count toward artist community membership, so every direction
// needs some way to make those slots feel different from 6–20.
export const COMMUNITY_SLOTS = 5;

export const TIER_LABELS = {
  casual: "Casual",
  fan: "Fan",
  stan: "Stan",
  "day-one": "Day One",
};

export const artFor = (entry) =>
  resolveImageUrl(
    entry?.image_url,
    `https://via.placeholder.com/300?text=${encodeURIComponent(
      (entry?.artist_name || "?")[0]
    )}`
  );

/** "3 yrs" / "7 mo" / "12 days" — tenure has to read at a glance. */
export const tenureLabel = (days) => {
  if (days == null) return null;
  if (days >= 365) {
    const y = Math.floor(days / 365);
    return `${y} yr${y > 1 ? "s" : ""}`;
  }
  if (days >= 30) {
    const m = Math.floor(days / 30);
    return `${m} mo`;
  }
  return `${days} day${days === 1 ? "" : "s"}`;
};

/**
 * Merge the Top 20 (position, name, art) with stan-card data (tier, tenure).
 * They're two endpoints keyed on artist_id; every shrine direction wants
 * both, so the join lives here rather than in six components.
 */
export const mergeShrineEntries = (profileList = [], stanRanks = []) => {
  const byArtist = new Map(stanRanks.map((r) => [r.artist_id, r]));
  return profileList
    .filter(Boolean)
    .map((a, i) => {
      const rank = byArtist.get(a.artist_id);
      return {
        artist_id: a.artist_id,
        artist_name: a.artist_name || a.name || "Unknown",
        image_url: a.image_url,
        genre: a.genre ?? rank?.genre ?? null,
        position: a.position ?? i + 1,
        tier: rank?.tier ?? null,
        days_as_member: rank?.days_as_member ?? null,
      };
    })
    .sort((x, y) => x.position - y.position);
};

/** Pad to 20 so each direction can be judged full as well as nearly empty. */
export const padToSlots = (entries, slots = SHRINE_SLOTS) => {
  const out = entries.slice(0, slots);
  for (let i = out.length; i < slots; i++) {
    out.push({ empty: true, position: i + 1 });
  }
  return out;
};

const DEMO_NAMES = [
  "Nas", "MF DOOM", "Lauryn Hill", "Madlib", "Andre 3000",
  "J Dilla", "Erykah Badu", "Kendrick Lamar", "Little Simz", "Freddie Gibbs",
  "Tyler, The Creator", "Noname", "Earl Sweatshirt", "Pusha T", "SZA",
  "Denzel Curry", "Rapsody", "Black Thought", "JID", "Doechii",
];

const DEMO_TIERS = ["day-one", "stan", "fan", "casual"];

/** A believable full shelf — the sparse real case can't show crowding. */
export const demoEntries = () =>
  DEMO_NAMES.map((name, i) => ({
    artist_id: -(i + 1),
    artist_name: name,
    image_url: null,
    genre: "Hip Hop",
    position: i + 1,
    tier: DEMO_TIERS[Math.min(Math.floor(i / 5), 3)],
    days_as_member: [1420, 890, 610, 400, 280, 210, 160, 120, 95, 70,
                     55, 44, 33, 27, 21, 16, 12, 9, 5, 2][i],
  }));
