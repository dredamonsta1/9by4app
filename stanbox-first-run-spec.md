# StanBox First-Run Flow — Spec v1.0

**Status:** Decided 2026-09-11 — ready to build
**Origin:** Andre — "when someone finally registers and then signs in they shouldn't be taken to the platform immediately, they should be taken to a page that allows them to pick their first 3 artists and then move to the profile to see the personality type"

---

## 1. The problem, measured

Every user who has ever registered, as of 2026-09-11:

| | users |
|---|---|
| **0 artists** | **13** |
| 1–2 artists | 1 |
| 3+ artists | 10 |
| **total** | **24** |

**54% of everyone who ever registered never added a single artist.** Not "didn't finish" — never started.

The zero-artist accounts span **2026-02-19 to 2026-09-03**, which rules out the obvious explanation. Story 10's onboarding checklist shipped 2026-08-12 and the navbar nudge on 2026-09-05; people were still landing at zero after both.

**Why those didn't fix it:** the checklist lives on `/profile`, and signup and login both `navigate("/")`. A new user lands on the landing page — rankings, feed, artist card, player, nav — where the one action that makes the platform work is one of a dozen available. The navbar nudge helps but is a badge competing with a full page.

**Why it matters beyond activation:** a user with no artists has no Top 20, no Music Personality, no taste comps, and cannot meaningfully use quarterly picks. They have an account and nothing else. And with the picks ballot needing 5 users to publish, 13 dormant accounts is the difference between a working feature and a withheld one.

---

## 2. The flow

```
verify code / login
        ↓
  /welcome   ← genre pills → artist grid, or search
        ↓     pick 3 (of 20 possible)
  payoff      "You're a ___" — the personality, revealed here
        ↓
  /profile    lands with the personality already on it
```

**Decided 2026-09-11:**

| Decision | Choice |
|---|---|
| Where picking happens | Dedicated `/welcome` page, not a modal or a widget |
| How artists are found | **Genre pills first** → grid of that genre. **Search bar** always available for a specific artist |
| Target | 3 to proceed, **but the page states all 20 slots exist** |
| Skippable | Yes — quiet "I'll do this later", not an equal-weight button |
| Payoff | **The personality is revealed on the welcome flow**, then the user moves to the profile with it already there |
| Existing users | **Yes** — the 13 at zero see it on next login |

---

## 3. Why a page rather than a better widget

It removes the choice. A landing page offers a dozen actions and one of them is the right one; a page with nothing on it but "pick three artists" has a completion rate a widget cannot match, because there is nothing else to do.

This is the same reasoning as the auth wall placement: put the moment where the commitment is, and don't surround it with alternatives.

---

## 4. Artist selection — the hard part

Three surfaces, in this order:

**1. Genre pills.** Reuse the existing `FiltersBar` vocabulary: Hip Hop, R&B, Pop, Rock, Country, Latin, Drill, Trap, Reggae, Dancehall. Tapping one loads a grid of artists in that genre.

**2. The grid.** Art-forward, tap to add. Server-side filtered (shipped 2026-08-27), so it searches all 112k artists rather than a loaded page.

**3. Search.** Always visible, not behind a tab. Accent-insensitive since 2026-09-02, so `calu` finds `Calú Carlos`.

### Resolved 2026-09-11 — a genre tap comes first

**No grid until a genre is tapped or something is searched.** The pills are the hero element of the page, not a filter sitting above an empty shelf.

The alternative was showing a default grid, and the default ordering is `count DESC, artist_name ASC` with **only ~57 artists holding any clout** — so an ungated grid opens on `:wumpscut:` and `!!!`. A page whose job is to prevent hesitation should not open on punctuation.

### Known bias to accept

Genre pills inherit the catalogue's shape. 7,975 artists share a wrong image ([[artist images]], Story 14), and an artist with no image in an art-forward grid looks broken. The grid should prefer artists that have one — which is a **soft bias toward well-known artists**, and works against the indie visibility this platform is for. Worth naming rather than discovering later.

---

## 5. The payoff

**The personality is revealed in the welcome flow, not on arrival at the profile.** Andre, 2026-09-11: *"there should be the payoff of the identity then we move them to the profile with that information there."*

The mechanism already exists: `POST /users/me/music-personality` with the artist list, and `MusicPersonalityCard` already has a `celebratory` variant — built for exactly this moment and currently fired from the profile.

So the sequence is: third artist added → generate → reveal → "See your profile" → land on `/profile` with the card present and no second reveal.

**The risk:** the personality call is an AI generation and can be slow or fail. The flow must not strand someone on a spinner at the moment it is trying to delight them. If it fails, proceed to the profile anyway — the artists are saved regardless, and the card can generate there.

---

## 6. Skipping, and the nudge that follows

Skippable, quietly. A small "I'll do this later" rather than a button with equal weight to continuing.

**Andre, 2026-09-11: "there has to be something that nudges them to actually do it later."**

What exists today:
- `OnboardingChecklist` on the profile — progress toward 3
- `OnboardingNudge` in the navbar — `◉◉○ Add 1 artist`, links to `/profile`

**The problem:** both honour `ONBOARDING_DISMISSED_KEY` in localStorage. Dismiss the checklist once and both go silent permanently. That was the right call when the nudge was an extra; it is the wrong call when skipping the welcome page is the expected path for anyone who wants to look around first.

**Resolved 2026-09-11:**
- Skipping `/welcome` does **not** set the dismissal key — skipping is "not now", dismissing is "stop asking"
- The navbar nudge links to `/welcome` rather than `/profile`, so it returns them to the purpose-built page rather than a checklist on a busy profile
- **The auto-redirect fires once.** After a skip, `/welcome` is reachable only via the nudge — re-routing someone who deliberately opted out on every login is nagging, and the nudge is already persistent and visible on every page
- **Nudge wording is unchanged.** It does not know or care whether someone skipped; one message is one thing to maintain, and "Add 3 artists" is accurate either way

---

## 7. Existing users

The 13 zero-artist accounts see `/welcome` on next login.

**Gating rule:** redirect to `/welcome` after auth when the user has **0 artists**, not when they have fewer than 3. Someone with 2 has already understood the mechanic and doesn't need the page; someone with 0 never started.

**Do not use:** "has this user seen the welcome page", which needs new state. Artist count is already the truth and already fetched.

---

## 8. Where the 20 slots get said

Andre, 2026-09-11: *"I want mention of the full 20 slots they can fill with artists."*

`MAX_FAVORITE_ARTISTS = 20`. Three is the unlock, twenty is the shrine. The page should make clear that three is a start, not a limit — the Top 20 is the identity artifact the profile is built around, and a user who thinks the job is "pick 3" has a different mental model from one who knows they are starting a list of 20.

Suggested framing: progress shown as `3 of 20`, with the third slot marked as the unlock point rather than the finish line.

---

## 9. Not in scope

- Changing the Top 20, personality, or quarterly picks themselves
- Fixing the shared-image problem (Story 14) — the grid works around it
- A "recently added" or indie-surfacing view (Story 13) — related, separate
- Onboarding for artists claiming a page — different flow entirely

---

## 10. Open questions

**All closed 2026-09-11.** Genre tap first (§4), redirect fires once and thereafter only the nudge returns them (§6), nudge wording unchanged (§6).

Worth revisiting after it ships: whether the once-only redirect is too shy. If skip rates are high and the nudge alone doesn't recover them, re-showing on the second login is the obvious next lever.

---

## 11. Re-verify before building

The activation numbers are the entire justification, and they move:

```sql
SELECT COUNT(*) FILTER (WHERE n = 0) AS zero,
       COUNT(*) FILTER (WHERE n >= 3) AS reached
  FROM (SELECT u.user_id,
               (SELECT COUNT(*) FROM user_profile_artists p WHERE p.user_id = u.user_id) n
          FROM users u) x;
```

If the zero-artist share has dropped substantially on its own, the case for redirecting every user post-auth weakens.
