# StanBox Crates — Spec v0.1

**Status:** Draft, 2026-09-12 — not approved, several open decisions
**Origin:** Andre, 2026-09-12 — "bluesky's social media platform, is there a way to incorporate that thought into stanbox"

---

## 1. What's worth stealing, and what isn't

Bluesky's interesting bet isn't decentralization. It's that **curation is a first-class, shareable object** — custom feeds, starter packs, stackable labelers. The algorithm is a user-level choice rather than a platform decree.

**Not worth taking:**

| Bluesky mechanism | Why not here |
|---|---|
| Federation / ATProto | Solves lock-in and owner-distrust. StanBox has 25 personally-invited users and you are the owner |
| Portable identity (DIDs, PDS) | Same — enormous lift, no current problem |
| Open firehose | The invite gate is load-bearing: the Q3 chart has 5 genuine ballots because of it, not 500 bot ballots |
| Composable moderation | The AI moderation layer exists and is unproven; stacking labelers on top is premature |

Federation would also fragment the single population that makes a global ranking mean anything. Rankings need one pool.

**Worth taking: starter packs.** They were Bluesky's strongest growth mechanism, and the insight behind them is the one StanBox needs.

---

## 2. Why this fits a problem already measured

> The hardest problem in a social product is the empty state, and the fix isn't better browsing — it's letting someone you trust hand you a curated bundle in one tap.

**14 of 25 users have zero artists** ([[first-run-flow]]). `/welcome` attacks that with genre pills, which is the *help me decide* answer. A crate is the *decide for me* answer, and it is usually stronger.

**The primitive already exists.** The Top 20 is a curated ranked list. Public profiles, a `follows` table and TasteComps are all live. What's missing is only that lists cannot travel.

**And the design intent is already there.** The sticky CTA bar was shaped for social-share screenshots of a shrine ([[auth-wall-placement]], #134). **A crate is the interactive version of that screenshot.**

### It also routes around the indie bootstrapping trap

[[future-stories]] Story 13: clout comes from being added, being added requires being seen, and browsing sorts a zero-clout artist to position 448 of 618.

A crate ignores ranking entirely. If someone with taste puts ProfitVsProphet and Soulaan Marie in a crate, those artists enter new users' lists **directly**. That is a distribution mechanism independent of clout — which is exactly what Story 13 is missing.

---

## 3. Naming

**"Crate"**, not "starter pack". The catalogue already speaks this language — [[sound-personality]] is built on *crate digger* archetypes, and digging through crates is what the platform is about.

Tradeoff: "starter pack" is instantly understood and "crate" needs one beat of explanation. Worth it for a term that is StanBox's rather than borrowed.

---

## 4. What a crate actually is

Three candidates, and the choice matters more than it looks:

| Model | Pro | Con |
|---|---|---|
| **Live view of someone's Top 20** | Zero storage, always fresh | Changes under adopters' feet; the Top 20 is *ranked and personal* — sharing it whole is "be me", not "here's a start" |
| **Snapshot of the Top 20** | Stable | Goes stale silently, and nobody curated it |
| **A chosen subset, stored** | Real intent, stable, nameable | Needs a table and a small creation UI |

**Proposed: a chosen subset, stored.** The creator picks from their existing Top 20 — so there is no separate curation chore — but *choosing* is what makes it a recommendation rather than a self-portrait. The #1 slot on a shrine is the most personal thing on the platform; a crate should be breadth, not the top of someone's identity.

**Proposed shape:** 3–10 artists, a name, an owner. Ten is a cap rather than a target — adopting more than half of a 20-slot list leaves the adopter little room to be themselves, which defeats the purpose.

---

## 5. Storage

```sql
CREATE TABLE crates (
  crate_id    SERIAL PRIMARY KEY,
  owner_id    INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  slug        VARCHAR(24) UNIQUE NOT NULL,   -- URL-safe, crypto-random
  name        VARCHAR(60) NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE crate_artists (
  crate_id   INTEGER NOT NULL REFERENCES crates(crate_id) ON DELETE CASCADE,
  artist_id  INTEGER NOT NULL REFERENCES artists(artist_id) ON DELETE CASCADE,
  position   SMALLINT NOT NULL,
  PRIMARY KEY (crate_id, artist_id)
);

CREATE TABLE crate_adoptions (
  crate_id    INTEGER NOT NULL REFERENCES crates(crate_id) ON DELETE CASCADE,
  user_id     INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  added_count SMALLINT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (crate_id, user_id)
);
```

**Why a table rather than a stateless `/crate?a=1,2,3` URL:** adoption has to be *measurable*. The entire justification for this feature is moving the zero-artist number, and a stateless URL can't tell you whether anyone ever used one. `crate_adoptions` is the evidence.

`slug` is crypto-random, not sequential — the same reasoning as invite codes ([[invite codes]]). A guessable slug lets anyone enumerate every crate on the platform.

---

## 6. Adopting

Adoption is `addArtistToProfileList` in a loop, which already:
- no-ops on a duplicate
- no-ops at `MAX_FAVORITE_ARTISTS = 20`
- **grants clout** via `incrementClout`

**Capacity:** fills available slots in crate order, skipping artists the adopter already has. An adopter with 18 artists taking a 5-crate gets 2. The UI must say what actually happened — *"Added 2 of 5, your Top 20 is full"* — not report success and quietly drop three.

**Guests can view, not adopt.** Matches [[auth-wall-placement]]: browsing is free, committing needs an account. `GuestAddPrompt` already exists for exactly this. A crate link that 404s for logged-out visitors is useless, since travelling is the whole point.

### The clout vector, named rather than discovered

Adoption grants clout to every artist in the crate. That is *correct* — the adopter genuinely added them — and it is also **a ranking attack**: make a crate of your own music, get friends to adopt it, climb the rankings.

At 25 invite-gated users this is negligible. It stops being negligible the moment signup opens. Options, undecided:
- Leave it (adoption is a real add — the honest position)
- Cap clout from adoptions per user per window
- Grant clout only on the adopter's *first* crate

**Recommendation: leave it and record the vector.** Only ~57 artists have any clout at all, so the ranking is not yet worth attacking — but this must be revisited before any public launch.

---

## 7. Where crates come from and go

**Creation:** a "Share a crate" action on the profile, next to the shrine. Pick from your Top 20, name it, get a link.

**The crate page** (`/crate/:slug`): whose it is, its name, the artists art-forward, one **Adopt** button. Nothing else — the same reasoning as `/welcome`, which works because there is nothing else to do on it.

**After adopting:** straight into the `/welcome` payoff if the adopter is now at 3+ — personality reveal, then profile. A crate adoption that lands someone at three artists should feel identical to picking three by hand, because it *is*.

### The strong idea, phase 2: crates in the invite email

You approve someone; the email carries the inviter's crate. `/register?code=X&crate=Y` → signup → the crate is already there → adopt → activated in one unbroken flow.

That closes the loop between the invite system (#119–#121) and the activation problem (#170) — the two things worked on most recently, and currently unconnected. Deliberately phase 2: it depends on crates existing and being worth sending.

---

## 8. Open decisions

1. **Who can create crates?** Any user is right at 25; a public browse-all directory is not. Proposal: anyone creates, no directory — crates travel by link only, so junk crates have no surface to pollute.
2. **Live or snapshot?** §4 proposes stored subsets. If a creator's taste changes, is their crate stale or do they edit it? Proposal: editable by the owner, with adoption counts preserved.
3. **Quarterly picks as crates?** A locked quarterly list is a natural crate, but those are *albums* and a crate holds *artists*. Mapping albums→artists is lossy. Out of scope, noted because it will come up.
4. **Does adopting follow the creator?** Bluesky's packs do both. Here it conflates two things; proposal is no, keep them separate.

---

## 9. How we'd know it worked

The justification is the zero-artist number, so that is the measure:

```sql
-- activation, before and after
SELECT COUNT(*) FILTER (WHERE n = 0) AS zero, COUNT(*) FILTER (WHERE n >= 3) AS reached
  FROM (SELECT u.user_id,
               (SELECT COUNT(*) FROM user_profile_artists p WHERE p.user_id = u.user_id) n
          FROM users u) x;

-- did anyone actually use one
SELECT COUNT(*) adoptions, SUM(added_count) artists_added FROM crate_adoptions;
```

**Baseline at spec time: 14 of 25 at zero, 10 at 3+.**

Three ways this fails, worth naming up front:
- **Nobody shares** — no distribution, and the feature needs a share surface people actually reach
- **People share, nobody adopts** — the crate page isn't compelling
- **Adoption without retention** — activation is not the same as sticking, and a crate gives someone a list they didn't choose

The third is the real risk. A hand-picked list is identity; an adopted one might not be. Worth watching whether adopters go on to *edit* their list — that would be the signal it took.

---

## 10. Why this rather than the alternatives

| Option | Direction |
|---|---|
| Better `/welcome` | platform → user |
| Story 13 recently-added | platform → user |
| More invites | platform → user |
| **Crates** | **user → user** |

Crates are the only one that creates a loop where existing users bring new ones in. At 25 users that matters more than another platform-side surface.
