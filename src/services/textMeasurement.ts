// src/services/textMeasurement.ts
// Singleton text measurement service — owns all Pretext state.
// Nothing outside this file imports Pretext directly.

import { prepare, prepareWithSegments, layout, walkLineRanges } from "@chenglou/pretext";
import type { PreparedText, PreparedTextWithSegments } from "@chenglou/pretext";

// Default font matches .textContent in Feed.module.css: 15px / line-height 1.5
export const FEED_FONT = "15px var(--font-mono, 'DM Mono', monospace)";
export const FEED_LINE_HEIGHT = 22.5; // 15px * 1.5

// Cache keyed by a stable string ID (e.g. `text-{post_id}`)
const cache = new Map<string, PreparedText>();
const segmentCache = new Map<string, PreparedTextWithSegments>();

// ---------------------------------------------------------------------------
// Feed / post height measurement (use-case 1)
// ---------------------------------------------------------------------------

/** Call once when text is known (data fetch). Idempotent. */
export function prepareFeedText(id: string, text: string, font = FEED_FONT): void {
  if (!cache.has(id)) {
    cache.set(id, prepare(text, font));
  }
}

/** Batch-prepare an array of { id, text } pairs — call in your data fetch callback. */
export function batchPrepare(
  items: { id: string; text: string }[],
  font = FEED_FONT
): void {
  for (const { id, text } of items) {
    prepareFeedText(id, text, font);
  }
}

/**
 * Returns { height, lineCount } for a prepared text at a given container width.
 * Pure arithmetic — safe to call on every resize.
 */
export function getTextHeight(
  id: string,
  containerWidth: number,
  lineHeight = FEED_LINE_HEIGHT
): { height: number; lineCount: number } | null {
  const prepared = cache.get(id);
  if (!prepared || containerWidth <= 0) return null;
  return layout(prepared, containerWidth, lineHeight);
}

/** Remove a cache entry when a post is deleted or evicted from the feed window. */
export function evict(id: string): void {
  cache.delete(id);
  segmentCache.delete(id);
}

// ---------------------------------------------------------------------------
// Comment bubble shrink-wrap (use-case 2 — walkLineRanges)
// ---------------------------------------------------------------------------

/** Prepare text with full segment info (needed for walkLineRanges). */
export function prepareSegmented(
  id: string,
  text: string,
  font = FEED_FONT
): void {
  if (!segmentCache.has(id)) {
    segmentCache.set(id, prepareWithSegments(text, font));
  }
}

/**
 * Binary-search the tightest container width where the text fits in ≤ maxLines.
 * Returns the optimal pixel width for a comment bubble.
 */
export function shrinkWrapWidth(
  id: string,
  maxWidth: number,
  maxLines: number
): number | null {
  const prepared = segmentCache.get(id);
  if (!prepared) return null;

  let lo = 60;
  let hi = maxWidth;
  let best = maxWidth;

  // ~10 bisection steps is precise enough
  for (let i = 0; i < 10; i++) {
    const mid = Math.floor((lo + hi) / 2);
    let lines = 0;
    walkLineRanges(prepared, mid, () => { lines++; });
    if (lines <= maxLines) {
      best = mid;
      hi = mid - 1;
    } else {
      lo = mid + 1;
    }
  }

  return best;
}
