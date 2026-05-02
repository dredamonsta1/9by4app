# StanBox — Artist Card Audio Preview Feature

## Overview

Add a click-to-play 30-second audio preview to the Artist Card Modal. Previews are manually curated per artist (admin-selected track from a chosen album), sourced from a fallback chain across Spotify, Apple Music, and Deezer to maximize coverage.

---

## Schema Changes

### New Table: `artist_previews`

Stores the curated preview track per artist with metadata from all three providers for fallback resolution.

```sql
CREATE TABLE public.artist_previews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,

  -- Track identity
  track_name text NOT NULL,
  album_name text NOT NULL,
  album_art_url text,
  release_year integer,

  -- Provider preview URLs (fallback chain order: Spotify → Apple → Deezer)
  spotify_track_id text,
  spotify_preview_url text,
  apple_track_id text,
  apple_preview_url text,
  deezer_track_id text,
  deezer_preview_url text,

  -- Operational metadata
  preferred_provider text CHECK (preferred_provider IN ('spotify', 'apple', 'deezer')),
  last_verified_at timestamp with time zone,
  is_active boolean DEFAULT true,

  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),

  CONSTRAINT artist_previews_artist_unique UNIQUE (artist_id),
  CONSTRAINT artist_previews_has_at_least_one_url CHECK (
    spotify_preview_url IS NOT NULL
    OR apple_preview_url IS NOT NULL
    OR deezer_preview_url IS NOT NULL
  )
);

CREATE INDEX idx_artist_previews_artist_id ON public.artist_previews(artist_id);
CREATE INDEX idx_artist_previews_active ON public.artist_previews(is_active) WHERE is_active = true;
```

**Notes:**
- `UNIQUE(artist_id)` enforces one preview per artist (matches "manually curated" model)
- The `CHECK` constraint guarantees no row exists without at least one playable URL
- `last_verified_at` is critical — preview URLs expire/change. You'll want a weekly job that re-fetches and updates them
- `preferred_provider` lets admins override the default fallback order if a particular track sounds better on, say, Apple than Spotify

---

## Backend — API Endpoints

### `GET /v1/artists/:artistId/preview`

Returns the resolved preview for an artist, applying the fallback chain server-side so the frontend gets a single clean URL.

**Response shape:**
```json
{
  "artist_id": "uuid",
  "track_name": "string",
  "album_name": "string",
  "album_art_url": "string",
  "release_year": 2023,
  "preview_url": "https://...",
  "provider": "spotify",
  "duration_seconds": 30
}
```

**Resolution logic (server-side):**
1. Check `preferred_provider` → use that URL if non-null
2. Else fall back: Spotify → Apple → Deezer
3. If all are null, return `404` (frontend hides the play button)

### `POST /v1/admin/artist-previews` (admin only)

Creates or updates the preview for an artist. Admin provides the artist ID, track name, and album name; the backend hits all three provider APIs to resolve URLs.

**Request body:**
```json
{
  "artist_id": "uuid",
  "track_name": "string",
  "album_name": "string",
  "preferred_provider": "spotify"
}
```

**Backend behavior:**
- Search Spotify API for `{artist} {track} {album}` → store `spotify_track_id`, `spotify_preview_url`
- Search Apple Music API → store `apple_track_id`, `apple_preview_url`
- Search Deezer API → store `deezer_track_id`, `deezer_preview_url`
- Set `last_verified_at = now()`
- Returns the created/updated row with a count of how many providers resolved successfully

### `POST /v1/admin/artist-previews/:id/reverify` (admin only)

Re-runs the provider lookups for an existing preview. Used by the weekly cron job and for manual refresh from the admin panel.

---

## Provider Integration

### Spotify
- **Auth:** Client Credentials flow (server-to-server, no user OAuth needed for previews)
- **Endpoint:** `GET /v1/search?q={query}&type=track`
- **Field:** `tracks.items[0].preview_url` (often null — this is why the fallback chain exists)
- **Env vars:** `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`

### Apple Music
- **Auth:** Developer JWT signed with your Apple Music API private key
- **Endpoint:** `GET /v1/catalog/us/search?term={query}&types=songs`
- **Field:** `results.songs.data[0].attributes.previews[0].url`
- **Env vars:** `APPLE_MUSIC_KEY_ID`, `APPLE_MUSIC_TEAM_ID`, `APPLE_MUSIC_PRIVATE_KEY`

### Deezer
- **Auth:** None required for public search/preview endpoints
- **Endpoint:** `GET https://api.deezer.com/search?q={query}`
- **Field:** `data[0].preview` (always 30 seconds, almost always populated)
- **Env vars:** None

**Recommended ordering rationale:** Spotify first for ubiquity and quality, Apple second for catalog completeness, Deezer last as a near-guaranteed fallback (their coverage is the highest of the three).

---

## Frontend — Artist Card Modal Integration

### Component: `ArtistPreviewPlayer`

Sits in the Artist Card Modal, near the album art / artist info section.

**States:**
- `idle` → shows play button overlaid on small album art thumbnail
- `loading` → spinner while audio buffers
- `playing` → animated waveform or progress ring, click again to stop
- `ended` → resets to `idle` after 30s
- `error` → silently hidden (no preview available, don't render the component)

**Behavior:**
- On modal open, fetch `/v1/artists/:artistId/preview` (cache the response with React Query / SWR — preview URLs are stable for ~24h)
- On play button click, instantiate `new Audio(preview_url)`, attach `ended` and `error` listeners, call `.play()`
- On modal close, pause and dispose the audio element (avoid orphaned playback)
- Only one preview plays globally at a time — use a Zustand or context store to track the active player and stop others when a new one starts

**Display:**
- Small album art thumbnail (~64px) with play/pause overlay
- Track name + album name underneath ("[Track] — from [Album]")
- Tiny provider attribution badge ("via Spotify") — required by Spotify/Apple ToS
- 30-second progress bar that fills as the preview plays

---

## Admin Tooling

You'll need a lightweight admin interface to populate this table. Two options:

1. **Build it into your existing admin panel** — form with artist search → track search → preview preview (literally listening before saving)
2. **CSV import for bulk seeding** — for the initial waitlist beta, you'll want to seed the top ~200 most-listed artists at once. A CSV with `artist_name, track_name, album_name` columns + a one-time import script will save hours

For MVP, build the CSV import first (faster to seed catalog) and add the admin form in a follow-up.

---

## Operational Concerns

**Preview URL expiration.** Spotify preview URLs sometimes rotate. Schedule a weekly cron that hits `POST /v1/admin/artist-previews/:id/reverify` for any row where `last_verified_at < now() - 7 days`.

**Rate limits.** Spotify allows ~180 requests/minute on Client Credentials, Apple Music ~3000/hour, Deezer ~50 requests/5 seconds. The reverify cron should batch with delays to stay safely under all three.

**Legal — provider attribution.** Spotify and Apple both require visible attribution when using their previews. The "via Spotify" badge in the player covers this. Deezer has no requirement but it's good practice.

**Caching.** Cache the resolved preview metadata (not the audio file) at the CDN/edge for 1 hour. The audio itself is hosted by the providers — never proxy or store it yourself, that crosses into licensing territory.

---

## Phasing Suggestion

**Phase 1 (ship with beta):** Schema migration + Deezer-only integration + click-to-play component. Deezer's coverage is highest and zero-auth makes it the fastest path to a working feature.

**Phase 2:** Add Spotify and Apple to the fallback chain, add admin panel + CSV import, add the reverify cron.

**Phase 3:** Track preview play counts (`preview_plays` table) — this becomes data that feeds the artist-side microdemographic features later. Which fans listened, how often, did the preview drive an "add to Top 20" action — that's gold.
