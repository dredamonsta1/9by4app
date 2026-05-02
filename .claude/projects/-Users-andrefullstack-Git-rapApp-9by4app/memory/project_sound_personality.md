---
name: Sound Personality Feature
description: BPM + key based music personality types and Your Sound page — planned 2026-04-28, revisit 2026-05-28
type: project
---

Feature planned 2026-04-28. Revisit and refine 2026-05-28.

**Why:** Adds storytelling and identity to stanbox — moves it from a list app to something that tells users about themselves through music.

**How to apply:** When user brings this up, resume from where planning left off — names are locked to Option A (crate digger culture), descriptions drafted below.

## Two sub-features

### 1. Your Sound Page (dedicated page)
- Analyzes BPM + key of artists in user's Top 20
- Outputs a personality type (or blend of two)
- Layout: hero type name + description, 2-axis grid (energy vs. mood), Top 20 artists grouped by type
- CTA: "Your taste is evolving — update your Top 20"

### 2. Artist Song DNA (extends artist card)
- New section below Albums/Singles on the artist card
- Two tabs: Hits / Deep Cuts
- Each song shows: title, year, BPM badge, key badge (e.g. A Minor)
- Stream URL optional

## DB addition needed
`songs` table: `song_id, artist_id, title, year, bpm, key, mode (major/minor), song_type (hit | deep_cut), stream_url`
- Data stored manually in DB
- Extends naturally from existing singles table concept

## Personality Types — Option A (Crate Digger Archetypes)

| Type | BPM | Mode | Description |
|---|---|---|---|
| **The Selector** | Mid 90–124 | Major | You move the room. Your taste is precise, feel-good, and always on time. You don't just listen — you curate. |
| **The Headnodder** | Mid 90–124 | Minor | You ride the pocket. Raw bars, grimy production, real stories. You respect the craft above all. |
| **The Banger** | High 125+ | Major | Volume up, windows down. You live for the rush — the drop, the hook, the moment the track takes over. |
| **The Griever** | Low <90 | Minor | You go deep. Music is how you process. Your crates hold the records most people sleep on. |
| **The Vibe** | Low <90 | Major | You set the atmosphere. Warm, soulful, unhurried. Your playlist is the reason the session feels right. |
| **The Seeker** | High 125+ | Minor | You chase intensity. Dark energy, heavy production, music that hits like a statement. |

## Blend Logic
- Users whose Top 20 splits across two dominant quadrants get a Blend type
- 15 possible pairs — plan to define only the 6–8 most common
- Each blend gets its own one-liner (not just concatenated descriptions)
- Example: **The Headnodder / Vibe** — *You know when to turn it down as much as when to turn it up. The crates run deep on both ends.*

## Still needs before building
- Lock and wordsmith final type descriptions
- Define the 6–8 most common blend combinations + one-liners
- Finalize DB schema
- Decide colors per type (for the Your Sound page visual)
