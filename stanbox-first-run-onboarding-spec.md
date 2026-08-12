# StanBox First-Run Onboarding — Spec v1.0

**Status:** Draft, 2026-08-12
**Backlog origin:** Future Stories #10, plus #7 (profile fan-side only) folded in
**Depends on:** passwordless auth (shipped), auth-wall placement (shipped), related-artists engine (shipped, per-artist only)

---

## 1. What's actually missing

The backlog frames Story 10 as building the activation loop. It isn't — **the loop already exists**. What's missing is that it's invisible.

Verified in the current code:

| Piece | State | Where |
|---|---|---|
| 3-artist threshold | **Already enforced** | `ProfilePage.jsx:596` — `disabled={profileList.length < 3}` |
| Reward at 3 | **Already works** | Music Personality: AI title + description, public/private toggle (`POST /users/me/music-personality`) |
| Empty-state copy | **Already written** | `ProfilePage.jsx:630` — *"Add at least 3 artists to your Top 20 to analyze your taste."* |
| Top 20 rail + counter | **Already built** | `ProfilePage.jsx:490–541` — `Add to Top 20 (N/20)` |

So a new user *can* complete onboarding today. They just have to discover it by scrolling to Section 5, noticing a greyed-out button, and reading its tooltip. Nothing on arrival says "three artists is the goal" or "you're 1 of 3 there."

**This is a guidance and progress problem, not a mechanism problem.** That makes the widget cheap and the surrounding work (comps surface, guest credit) the real build.

### Correction to the backlog

Story 10 is recorded as blocked on [[sound-personality]]. It isn't. The BPM+key archetype system genuinely doesn't exist (no `archetype`, `song-dna`, or `bassbin` references anywhere in `src/`), but that's a *different, fancier* feature. The shipped **Music Personality** is a working reward today. Story 10 is unblocked.

---

## 2. Locked decisions (2026-08-12)

| Decision | Choice | Rationale |
|---|---|---|
| Scope | Widget **+** profile comps surface **+** guest auto-credit | Full activation path, not just the counter |
| Story 7 coupling | **Folded in** — kill the Fan/Artist toggle in the same pass | Widget lands top-of-profile; shipping it above a toggle that's already slated for deletion means placing it twice |
| Threshold | **3 artists** | Matches what the code already enforces |
| Reward moment | **Auto-generate + reveal** | Adding the third artist fires the analysis and reveals it. The user gets something about themselves without pressing anything |
| Widget placement | **Top of profile, above the Top 20 rail** | First thing on the page for someone with an empty one |
| Retroactive | **Yes** | Any user under 3 artists sees it, not just new signups |
| Dismissible | **Yes**, permanently | Never blocks exploration. The inline Section 5 prompt remains as the quieter fallback |

---

## 3. Architecture notes

### Auto-generate is the one risky decision

Hitting 3 fires an AI call without the user asking. Three consequences to handle:

- **Fire exactly once.** Trigger on the *transition* to 3 (`prev < 3 && next >= 3`), not on any render where `length >= 3`. A user who already has 3+ artists and reloads must not re-trigger.
- **Never block the add.** The artist add must commit and the rail must update regardless of whether the analysis succeeds. Wrap the trigger so a failed or slow AI call degrades to the existing manual "Analyze My Taste" button.
- **Don't overwrite.** If the user already has a personality (e.g. they dropped to 2 artists and came back to 3), do not regenerate. Auto-generate is a first-time-only reveal.

### Guest auto-credit has to survive an OTP round-trip

`GuestAddPrompt` (`ArtistPanel.jsx:1613`) currently links to `/signup` carrying no artist context. The signup flow is: enter details → receive emailed code → enter code → `POST /auth/verify-code` → token → `navigate("/")`.

A query param would not reliably survive that, so the pending artist goes to **`localStorage` under `stanbox_pending_stan`**, holding `{ artist_id, artist_name, image_url }`. Both `Login.jsx:72` and `Signup.jsx:90` share the same post-verify path, so the redemption belongs in one shared helper called from both.

Redemption rules:
- Clear the key **whether or not** the add succeeds — a stale pending artist must never re-add on a later login.
- Ignore it if the artist is already in the list.
- Respect `MAX_FAVORITE_ARTISTS`.

### Comps need one query, not twenty

`GET /artists/:artist_id/related` exists but is per-artist. Aggregating on the frontend would mean up to 20 requests to render one section. New endpoint instead:

**`GET /api/users/me/related-artists?limit=12`**

```sql
WITH my_list AS (
  SELECT artist_id FROM user_profile_artists WHERE user_id = $1
),
co_listers AS (
  SELECT DISTINCT upa.user_id
    FROM user_profile_artists upa
    JOIN my_list m ON m.artist_id = upa.artist_id
   WHERE upa.user_id <> $1
)
SELECT a.artist_id, a.artist_name, a.image_url, a.genre,
       COUNT(*)::int AS overlap_count
  FROM user_profile_artists upa
  JOIN co_listers c ON c.user_id = upa.user_id
  JOIN artists a    ON a.artist_id = upa.artist_id
 WHERE upa.artist_id NOT IN (SELECT artist_id FROM my_list)
 GROUP BY a.artist_id, a.artist_name, a.image_url, a.genre
 ORDER BY overlap_count DESC, a.count DESC NULLS LAST
 LIMIT $2
```

Mirrors the existing `/artists/:id/related` shape so the frontend can reuse artist-chip rendering. Excludes artists already in the user's list — recommending what they've already picked is the obvious failure mode.

**Signal will be thin at current user counts.** Most results will have `overlap_count = 1`. The endpoint returns whatever it finds and the frontend decides whether to render, same as the existing per-artist version does.

---

## 4. The widget

Renders only when `isOwnProfile && profileList.length < 3 && !dismissed`.

```
┌────────────────────────────────────────────┐
│  Build your stanbox            [ Skip ]    │
│                                            │
│  ●───────●───────○                         │
│  2 of 3 artists picked                     │
│                                            │
│  One more to unlock your Music Personality │
│  and see what fans like you are listening  │
│  to.                        [ Add artist ] │
└────────────────────────────────────────────┘
```

- **Progress dots**, not a percentage bar — three steps reads as achievable in a way that "67%" doesn't.
- **Copy names the reward**, and it changes per step (3 remaining → 2 → 1) so the last one reads as nearly done.
- **"Add artist"** opens the existing add panel (`setShowAddArtistModal(true)`) — no new picker.
- **Skip** sets `stanbox_onboarding_dismissed` and the widget never returns. The Section 5 inline prompt stays as the quiet fallback.
- Uses the chartreuse contrast colour for the completed dots, consistent with the `#1` rank treatment from [[brand-contrast-color]].

At 3, the widget is replaced in place by the reveal — the personality title and description, with the same card treatment Section 5 uses — then disappears on the next visit.

---

## 5. Story 7, folded in

Per the locked decisions in the backlog:

- Delete the Fan/Artist toggle JSX (`ProfilePage.jsx:389–407`), the `profileMode` state, `handleSetMode`, and the `PROFILE_MODE_KEY` constant (line 27).
- Collapse any content branch gated on `profileMode === "artist"` — including the fetch at line 158 — to fan-side only.
- Remove `.viewToggleSection`, `.viewToggle`, `.toggleBtn`, `.toggleActive` from the CSS module.
- One-time `localStorage.removeItem("cratesfyi_profile_mode")` on mount so stale values don't linger in users' browsers.

Artists keep their business surface at `/artist-dashboard` and `/artist-settings`, both already linked conditionally from the NavBar when `user.artist_id` is set. No new work there.

**Leave `cratesfyi_cta_dismissed` alone** — it's still functional per [[auth-wall-placement]], and renaming it would silently re-show the CTA to everyone who already dismissed it.

---

## 6. PR sequence

New branch per PR, off `master`/`main`, never stacked.

| # | Repo | Branch | Content |
|---|---|---|---|
| 1 | 9by4app | `feat/profile-fan-side-only` | Story 7: kill the toggle, clean the legacy key |
| 2 | nineByFourApi | `feat/user-related-artists` | `GET /users/me/related-artists` |
| 3 | 9by4app | `feat/onboarding-checklist` | Widget, progress, auto-generate + reveal |
| 4 | 9by4app | `feat/guest-stan-credit` | `stanbox_pending_stan` through signup/login |
| 5 | 9by4app | `feat/profile-comps` | "Fans of your Top 20 also love" section |

PR 1 ships first so the widget lands on a clean page. PRs 2 and 3 are independent. PR 5 needs PR 2 merged.

---

## 7. Testing

Per CLAUDE.md, behaviour not implementation, all async states explicit.

**Widget** — renders under 3 artists and not at 3+; copy changes per step; Skip hides it permanently; hidden entirely on someone else's profile.

**Auto-generate** — fires exactly once on the 2→3 transition; does *not* fire on mount for a user already at 3+; does not overwrite an existing personality; a failed analysis still leaves the artist added and falls back to the manual button.

**Guest credit** — a pending artist is added after verify; the key is cleared even when the add fails; a stale key doesn't re-add on a later login; a full Top 20 is respected.

**Comps** — excludes artists already in the list; renders nothing rather than an empty shell when there's no signal; loading and error states.

**Story 7** — no Fan/Artist toggle renders; the legacy key is removed on mount.

---

## 8. Out of scope

- **Sound Personality (BPM + key archetypes).** Separate feature, still unbuilt. The shipped Music Personality is the v1 reward.
- **iOS.** Should mirror eventually per [[ios-v1-fan-app]], but web-first.
- **Moving the threshold off 3.** Treat as a knob to revisit after real usage data, not a v1 decision.

---

## 9. Open questions

1. **Does the reveal need a name?** "Music Personality" is functional. If this becomes the activation payoff, it may deserve better branding — but that's a naming workshop, not a blocker.
2. **What does the guest-credited artist do to the reveal?** A user who arrives via `GuestAddPrompt` starts at 1/3 rather than 0/3. Worth watching whether that materially improves completion, once there's data.
3. **Should comps render below 3 artists?** Currently specced to unlock at 3 with the rest. Arguably it could show from 1 artist, since the signal exists — but that weakens the 3-artist goal the widget is built around.
