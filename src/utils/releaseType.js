// Release types (Story 17). One source of truth for the labels: the
// artist's own dashboard (YourMusic) and the fan-facing badge both read it.
export const RELEASE_TYPE_LABEL = {
  single: "Single",
  ep: "EP",
  album: "Album",
};

/**
 * The badge text for a release, or null. Albums aren't badged — they're
 * ~95% of the catalogue, so a badge on every card would be noise; only the
 * exceptions are marked. Unknown types get nothing rather than raw values.
 */
export function releaseTypeBadge(type) {
  if (!type || type === "album") return null;
  return RELEASE_TYPE_LABEL[type] ?? null;
}

/**
 * Apple appends the format to some titles: "Long Life Living for a Lover
 * Boy - EP". New Music's upcoming lane comes from Apple's public feed, which
 * has no type field, so that suffix is the only type information it has.
 * Returns the title without it, and the type it named (or null).
 */
export function splitReleaseSuffix(title) {
  const m = String(title ?? "").match(/^(.*\S)\s+-\s+(EP|Single)$/i);
  if (!m) return { title: title ?? "", type: null };
  return { title: m[1], type: m[2].toLowerCase() === "ep" ? "ep" : "single" };
}
