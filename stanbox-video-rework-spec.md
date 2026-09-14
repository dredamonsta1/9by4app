# StanBox Video Rework — Spec v0.1

**Status:** Decided 2026-09-13 — building
**Origin:** Andre — "get rid of the youtube videos that are currently playing they suck, i want to play only videos uploaded on the stanbox platform, i want the videos to play in the feed and also be in the main video section"

---

## 1. The finding that shapes everything

```sql
SELECT COUNT(*) FROM video_posts;  -->  0
```

**There are no platform videos.** Not "a few" — none. The video section is 100% YouTube today, so removing YouTube leaves an empty page rather than a smaller one.

That doesn't make the direction wrong. It makes the order matter: **the upload path has to be worth using before the YouTube crutch comes out**, or the section ships blank and stays blank.

---

## 2. What already works, and what doesn't

| | state |
|---|---|
| Video upload → Cloudinary | ✅ already correct — `9by4/videos`, `resource_type: video`, durable `secure_url` |
| `GET /feed` returns video posts | ✅ already UNIONs `video_posts` |
| Feed **renders** video | ❌ the post renderer handles `music` and `image`, not `video` |
| `/art-video` page | ⚠️ exists, **not linked from anywhere** |
| YouTube in the video page | ❌ two sources merged in |
| YouTube via upload | ❌ users can paste a YouTube URL |

**The pleasant surprise:** uploads already go to Cloudinary, not local disk. On Heroku a disk-backed upload would vanish on every dyno restart. That part is already right.

**The actual gap:** video posts arrive in the feed and render as a bare caption, because `ArtistPanel`'s renderer has branches for `isMusic` and `isImage` and none for video.

---

## 3. Three YouTube entry points, all of which must close

Removing one or two leaves the others refilling it.

1. **`ArtVideoFeed`** merges `/art/combined-video-feed` *and* `/art/music-videos`, both YouTube-backed
2. **`artApi.js`** — `/youtube-feed` exists, and `combined-video-feed` injects YouTube server-side
3. **`UploadModal`** offers "paste a YouTube URL" → `POST /feed/video-url` → stores `video_type='youtube'`

**The third is the one that matters most.** Clean the display and leave the upload option, and the platform refills with YouTube by hand. Closing that is what makes the change stick.

---

## 4. Proposed work, in an order that never ships a blank page

**Phase 1 — make platform video visible where people already are.**
Add a `video` branch to the feed post renderer. The data already arrives; it just isn't drawn. This is the smallest change with the largest effect, and it makes uploading feel worthwhile *before* anything is taken away.

**Phase 2 — close the YouTube upload path.**
Drop the URL-paste option from `UploadModal`, and retire `POST /feed/video-url`. After this, every new video is a platform upload by construction.

**Phase 3 — a video filter on the feed, and `/art-video` retired.**
Decided 2026-09-13: **no separate video page.** A filter on the feed rather than a destination, so an uploads-only video surface is never a blank page — filtering an otherwise-populated feed degrades to "no videos yet" with the feed still there, while a dedicated page would just be dead.

`ArtVideoFeed` and the `/art-video` route are deleted. It was the sole consumer of `/art/combined-video-feed` and `/art/music-videos`, and nothing else imported it.

**Phase 4 — retire the YouTube plumbing.**
`/youtube-feed`, `/art/music-videos`, the `YOUTUBE_API_KEY` config var, and the `video_type='youtube'` branch in the player. Last, because it is irreversible and the earlier phases prove nothing depends on it.

---

## 5. The empty state, dissolved

This was the hard part of the original plan and the filter decision removes most of it.

A dedicated video page with zero videos is a dead page. **A video filter on a working feed is just an empty filter** — the feed is still there, the other tabs still have content, and "no videos yet" next to a working composer reads as an invitation rather than a broken section.

Remaining: the filter says so plainly and keeps the upload action in reach. Same principle as the quarterly chart's ballot floor — an honest empty state beats a padded one.

---

## 6. Open questions

1. ~~Autoplay?~~ **Decided 2026-09-13: never autoplay.** Click to play. The audio player already owns the bottom bar, and a feed that starts making noise beside it is a bad surprise. `preload="metadata"` so a poster frame appears without pulling the file.
2. ~~Separate page?~~ **Decided 2026-09-13: a filter on the feed, no page.** See §4 phase 3.
3. **What happens to the 0 existing rows?** Nothing to migrate, which is the one gift the empty table gives.
4. **Is `Feeds.jsx` dead?** It fetches `/posts` (text only) and nothing imports it. Looks like an orphan superseded by `ArtistPanel`'s feed; worth deleting in this pass but confirm first.

---

## 7. Not in scope

- Video recording limits, transcoding, thumbnails (already in `UploadModal`)
- The music player and `PlayerBar` — a video branch must not fight it, but it isn't changing
- Moderation of uploaded video, which currently runs the same agent path as other posts

---

## 8. How we'd know it worked

```sql
SELECT COUNT(*) FROM video_posts WHERE video_type = 'upload';   -- currently 0
SELECT COUNT(*) FROM video_posts WHERE video_type = 'youtube';  -- must stay 0 after phase 2
```

The first number going up is the entire point. The second staying at zero is what proves the entry points are actually closed.
