# StanBox Microdemographic Data Model

## Overview

The microdemographic system is StanBox's core artist-side differentiator. Where streaming platforms expose only aggregate play counts and broad demographic buckets, StanBox surfaces **devotion data** — granular, consent-based signals about who actually stans an artist, where they are, and how loyal they are over time. This data is generated natively by the Top 20 leaderboard mechanic and cannot be replicated by streaming-first platforms.

The principle: **aggregate by design, not by privacy patch.** Artists never see individual fans without explicit fan consent. All location data is metro-level or coarser. All demographic data is bucketed.

---

## Data Collection (Fan Side)

Collected per fan, with explicit consent at signup and reaffirmed in privacy settings:

- **Top 20 list** — the core signal. Position, tenure, and change history are all tracked.
- **Approximate location** — city or metro level only. Pulled from device with permission, or self-reported at signup. Never street-level.
- **Age range** — bucketed (e.g. 18–24, 25–34, 35–44). Never exact birthdate.
- **Gender identity** — optional, self-reported, with non-binary and prefer-not-to-say options.
- **Adjacent listening** — optional list of genres or artists outside the Top 20 that the fan listens to.
- **Engagement signals (passive)** — generated automatically by platform activity:
  - How often the fan updates their Top 20
  - How long each artist has been in the list
  - What rank the artist holds (and rank movement over time)
  - Cross-fandom overlap (which other artists they stan)

---

## Artist-Facing Dashboard (Aggregated)

Artists see only aggregated, anonymized data unless a fan has explicitly opted into visibility. Core dashboard surfaces:

### Heat Map
Metro-level density of stans across geography. Used for tour routing, regional merch drops, and identifying breakout markets.

### Rank Distribution
Breakdown of where the artist sits in fans' Top 20:
- Number of fans ranking the artist at #1
- Number ranking #2–5
- Number ranking #6–20

### Tenure Data
- Average length of time the artist has been in fans' Top 20
- Distribution of tenure (e.g. % of stans for 0–3 months, 3–12 months, 12+ months)
- This is the platform's sleeper differentiator: **loyalty over time**, a signal no streaming platform can produce.

### Co-Stan Graph
The other artists stanned by this artist's fans, ranked by overlap percentage. Used for collaboration discovery, feature opportunities, and tour package decisions.

### Demographic Breakdown
- Distribution by age bucket
- Distribution by metro
- Distribution by gender identity (where disclosed)
- All cells suppressed below a minimum threshold (e.g. n < 10) to prevent re-identification.

### Movement
- New stans added in the period
- Stans who dropped the artist from their Top 20
- Net change and trajectory

---

## What Artists Never See

- Any individual fan's identity tied to demographic data
- Location more granular than metro/city
- Any data from fans who have not consented to artist-side visibility
- Aggregate cells small enough to re-identify individuals

---

## Consent Model (Three Tiers)

Fans default to Tier 1. They can opt up at any time, and opt back down at any time. Tier movement is always fan-initiated; nothing about an artist's actions can change a fan's tier.

### Tier 1 — Anonymous Stan (default)
Fan is counted in aggregate dashboards only. Artist sees no identifying information. This is the baseline and the default for every new fan.

### Tier 2 — Visible Stan
Fan's profile and handle appear in the artist's "your stans" list. Artist can send broadcast messages and offers that reach this fan. Fan can revert to Tier 1 at any time.

### Tier 3 — Superfan
Fan opts into deeper engagement:
- Early access to releases and merch drops
- Direct artist communication (broadcast and, where the artist enables it, two-way)
- Priority on limited drops, presales, and ticket allocations

---

## Historical Data Strategy

Tenure and movement data become more valuable the longer they accumulate. The data model captures all relevant history from launch, even where the MVP dashboard surfaces only a subset.

By month 18 post-launch, StanBox can show artists multi-year loyalty curves — a competitive position no streaming platform can match because their data structure does not capture devotion as a first-class signal.

---

## Privacy & Consent UX Principles

1. **Plain-language onboarding.** Fans understand at signup that their leaderboard activity becomes data artists can see, and what form that takes.
2. **Granular controls.** Fans can adjust visibility per artist if needed, not only platform-wide.
3. **No dark patterns.** Opting up is never bundled with unrelated actions. Opting down is one tap and reversible.
4. **Transparency reports.** Fans can see exactly what data is shared and at what aggregation level.
5. **Aggregate suppression.** Any view that could identify an individual fan is suppressed automatically.

---

## Open Questions / To Revisit

Items deferred from MVP but worth revisiting before scaling beyond the invite-only beta:

- **Suppression threshold calibration.** The `n < 10` floor is a placeholder. With small beta cohorts, this threshold may need to be raised (e.g. `n < 25` or higher) to genuinely prevent re-identification. Re-evaluate once beta population and metro distribution are known.
- **Location resolution.** "Metro-level" needs a concrete definition — DMA, MSA, city-name string, or geohash precision. Pick one and document it. Edge case: fans in small towns or rural areas where even metro-level data could be identifying. Consider falling back to state/region for low-population areas.
- **Age bucket boundaries.** Confirm bucket ranges. Standard market research uses 18–24 / 25–34 / 35–44 / 45–54 / 55+, but music demographics may warrant tighter buckets at the younger end (e.g. 13–17 / 18–21 / 22–25).
- **Minor accounts.** Decide handling for users under 18. Likely COPPA implications for under-13, and a separate consent flow for 13–17 that may exclude them from artist-visible data entirely.
- **Tier 2 → Tier 1 revocation behavior.** When a fan downgrades from Visible to Anonymous, define what happens to data the artist has already exported or screenshotted. Document the realistic limits of the platform's control here.
- **Co-stan graph privacy floor.** Same suppression logic applies — don't show "your fans also stan [Artist X]" if it could de-anonymize a small overlapping cohort.
- **Historical event schema.** Lock the event schema for Top 20 changes, rank movements, and add/drop events early. Schema migrations on multi-year historical data are painful — get this right before launch.
- **Artist data export and portability.** Will artists be able to export their dashboard data? In what format? Decide before any artist asks.
- **Fan data export (GDPR/CCPA).** Required by law in some jurisdictions. Worth scoping the request-and-export flow before legal pressure forces it.
- **Deletion semantics.** When a fan deletes their account, what happens to their historical contribution to artist aggregates? Full purge vs. anonymized retention is a real product and legal decision.
