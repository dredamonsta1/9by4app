# StanBox Quarterly Picks — Spec v1.0

**Status:** Draft, 2026-08-25
**Origin:** Andre, 2026-08-25 — "users pick their favourite releases per quarter of the calendar year"

---

## 1. Why this one is different from the rest of the backlog

Most open stories get *more* valuable after launch because they need users: the fan-location heatmap needs people to plot, the comps section needs filled Top 20s, the creator platform needs creators.

This one is the opposite. It's the first mechanic that **creates** a reason to return. The Top 20 is permanent — once built, there's no occasion to come back to it. A quarterly list has a clock on it, so four times a year every user has something to do. For a platform where 1 of 20 users has logged in since August, a recurring ritual is worth more than another feature.

It also produces something the platform can publish. "StanBox's Q3 2026" is an artifact with outside-world value in a way that individual Top 20s aren't, and quarterly is differentiated from the year-end-list pileup every December.

---

## 2. Locked decisions (2026-08-25)

| Decision | Choice | Why |
|---|---|---|
| Eligibility | **Releases from that quarter only** | "The best records of Q3" is a claim; "records people liked in Q3" isn't. Ties directly to the existing new-releases pipeline. |
| Picks | **5** | A five-minute task. This gets asked four times a year, so the bar has to stay low. |
| Ranked | **Yes** | Matches the Top 20's grammar, and gives the aggregate weighted signal instead of raw counts. |
| Quarter end | **Locks, 14 days after it ends** | A frozen quarter is an artifact you can look back on and publish. An editable one is just a Top 20 with a date on it. 14 days so a late-September record heard in early October isn't stranded. |
| Aggregate chart | **Deferred** | With ~20 users a "StanBox Q3" built from one or two ballots is worse than no chart. Revisit after launch. |
| Indie artists | **Must be able to appear on the ballot** | Non-negotiable. See §4a — the current code makes this impossible, and fixing it is a prerequisite. |

---

## 3. The ballot is small, and that's fine

Verified 2026-08-25 against production:

- **25 albums** carry a `release_date` after 2026-07-01 (Q3, ~8 weeks in)
- Most recent `release_date` is **2026-08-17** — the pipeline is alive, just low-yield

`new-releases.js` pulls Spotify's `/browse/new-releases` (a curated feed of a couple hundred) and keeps only albums whose primary artist is **already in the DB**. So the ballot is "new releases by artists StanBox tracks," which lands around 25–40 per full quarter.

Treat that as a feature rather than a shortfall. A tight curated shortlist is better UX than an open search across thousands, and it means the picker can be a simple scrollable list with no search infrastructure.

**Known skew to accept:** Spotify's editorial feed leans major-label and mainstream. Independent and self-released records will be under-represented on the ballot. Worth stating out loud, because "StanBox's best of Q3" implicitly claims completeness it won't have.

---

## 4a. Prerequisite: indie releases can't reach the ballot today

Andre, 2026-08-25: *"when stanbox has indie artists on the platform we want them to be a part of the voting process."*

**They can't be, as the code stands.** Verified:

| Path | Writes `release_date`? |
|---|---|
| `jobs/new-releases.js` | ✅ yes |
| `routes/artists.js:619` (artist/admin adds an album) | ❌ no — `year` only |
| `routes/artists.js:1632` (album creation) | ❌ no — `year` only |
| `seed.js`, `seed-production.js` | ❌ no |

Only the Spotify pipeline sets a real date. Everything a human adds gets a bare `year`, and a year-only album cannot be bucketed to a quarter.

So quarterly picks built on today's code would be **structurally limited to Spotify-surfaced, major-label releases** — precisely the artists who least need the exposure, and precisely the opposite of the intent.

**Prerequisite work, before or alongside the ballot:**
1. Add `release_date` to the artist/admin album-creation paths, and to the UI that feeds them (ArtistSettings + the admin album form).
2. Decide the rule for existing year-only albums — most likely: excluded from ballots, since inventing a date would put records in arbitrary quarters.
3. Consider making `release_date` required for any album an artist creates going forward. `year` alone is not enough for anything time-boxed, and this won't be the last such feature.

This is the difference between "indie artists can participate" and "indie artists are invisible to the mechanic". It is not a nice-to-have.

---

## 4. Data model

`albums.release_date DATE` and `albums.release_type` already exist, and `idx_albums_release_date` is already there. **No album migration needed.**

```sql
CREATE TABLE IF NOT EXISTS quarterly_picks (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  album_id    INTEGER NOT NULL REFERENCES albums(album_id) ON DELETE CASCADE,
  year        INTEGER NOT NULL,
  quarter     SMALLINT NOT NULL CHECK (quarter BETWEEN 1 AND 4),
  position    SMALLINT NOT NULL CHECK (position BETWEEN 1 AND 5),
  created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, year, quarter, position),
  UNIQUE (user_id, year, quarter, album_id)
);
```

Two uniqueness constraints, both load-bearing: one slot per position, and the same album can't be picked twice in a quarter. Enforced in the schema rather than in JS, same reasoning as the buyer-email `CASE` — a constraint in the database can't be bypassed by a caller that forgot.

`(year, quarter)` is stored rather than derived from `created_at`, because a pick made during the grace period belongs to the *previous* quarter.

---

## 5. Locking, and the grace period

**A quarter does not lock the instant it ends.** Releases land on Fridays and people catch up on weekends; locking Q3 at midnight on 30 September strands anyone who hears a late-September record on 2 October.

**Confirmed: quarters lock 14 days after the quarter ends.** Q3 (Jul–Sep) seals on 14 October.

Locking means:
- No writes to a sealed `(year, quarter)` — enforced server-side, not just hidden in the UI
- The aggregate can be computed once and cached forever rather than recomputed against a moving target

**Consequence to accept deliberately:** a user who joins in Q4 has no Q1–Q3 and can never backfill them. Their history starts empty and fills one quarter at a time. That's what makes the lists mean anything — but it does mean the feature is thin for new users, the same shape as tenure tiers on the Top 20 shrine.

---

## 6. Open questions

1. **Where does it live?** Profile, alongside the Top 20 shrine, is the obvious home — it's the same kind of identity artifact. A dedicated page becomes justified once there's history to browse.
2. **Ranked scoring weights** for the aggregate — 5/4/3/2/1, or something steeper that rewards a #1.
3. **Does a pick imply anything else?** E.g. does picking a release you can buy surface a buy button. Probably yes, but it's a separate decision from the mechanic.

---

## 7. Not in scope

- **Backfilling past quarters.** The whole point of locking.
- **Picking releases outside the ballot.** No free-text or search-the-world entry at v1; the ballot is what the pipeline produced.
- **Fixing the pipeline's yield.** 25/quarter is workable. If the ballot should be broader, that's a New Music Pipeline story, not this one.

---

## 8. Re-verify before building

Specs rot, and this one rests on live data:

- `select count(*) from albums where release_date > '<quarter start>'` — is the ballot still ~25–40?
- `select max(release_date) from albums` — is the pipeline still current? If it goes stale, the ballot silently empties and the feature breaks with no error.
- Confirm `release_date` is a real DATE for ballot rows. `new-releases.js:181` notes incoming values arrive as `YYYY-MM-DD`, `YYYY-MM` **or `YYYY`** — a year-only value can't be bucketed to a quarter and must be excluded from the ballot.
