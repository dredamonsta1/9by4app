# Refactor Notes — needs Andre's review

Captured during the chartreuse brand rollout (branch `feat/brand-chartreuse`).
Files listed here were touched during the rollout but either didn't produce the
visible change we expected, or are workshop artifacts that need a decision.

---

## 1. Dormant edits — visible in code, invisible in the running app

### `src/components/WeeklyTrending/WeeklyTrending.tsx` + `WeeklyTrending.module.css`
Added a `.rankFirst` chartreuse treatment for the `#1` rank in both the
`ArtistCard` and `CreatorCard` renderings inside WeeklyTrending. **Problem:**
`WeeklyTrending` is not currently mounted in any parent JSX (grep confirms).
Per memory `project_weekly_trending_next_steps.md`, this component was built
on `feat/weekly-trending` but not merged / wired into the app yet.

**What to review:**
- If WeeklyTrending is going to ship, the chartreuse `.rankFirst` treatment is
  ready to go — no action needed
- If WeeklyTrending is being sunset, the `.rankFirst` styles + conditional
  className logic can be deleted with the rest of the component

### `src/components/StanCard/StanCard.tsx` + `StanCard.module.css`
Added a `.slotRankFirst` chartreuse treatment for the `#1` slot rank number in
the Stan Card. **Not verified in the running app yet** — StanCard renders in
`src/pages/profile/ProfilePage.jsx`; the workshop screenshots didn't include a
profile page so we don't know if it actually renders chartreuse in real content.

**What to review:**
- Open a user's `/profile/:id` page and confirm the #1 slot rank number
  glows chartreuse
- If not visible, investigate whether the `.slot` positioning is clipping the
  rank number or if the container is preventing text-shadow from rendering

---

## 2. What the "Rankings" box actually is (context for future edits)

The visible "Rankings" box in the ArtistPanel left sidebar is rendered by
`RankView` inside `ArtistPanel.jsx` line 884. It is NOT `StanCard` and NOT
`WeeklyTrending`. Any future work on the Rankings box should target:
- `src/components/RankView/RankView.jsx`
- `src/components/RankView/RankView.module.css`

Chartreuse rank-#1 treatment was added here as part of this rollout
(`.tdRankFirst`), so this is already covered — but flagging it so we don't
accidentally chase it in the wrong component again.

---

## 3. Design system consistency (deferred)

Story 3 memory (`project_future_stories.md`) noted a broader design-system
pass. The current chartreuse rollout is scoped to primary CTAs + rank #1 +
"New" chips. Still open for a later pass:

- `ArtistDashboard.module.css` `.rank.top5` gold gradient — applies to ranks
  1–5; if we want #1-only chartreuse there, split into `.rank.top1`
- Chip / badge component consolidation — currently every module.css defines
  its own chip variants (see `NavBar`, `MessagesPanel`, `ArtistPanel`, etc.)
- `DESIGN_SYSTEM.md` — needs the `--color-contrast` token family + usage
  guidelines documented alongside the existing accent gradient rules

---

*Delete this file once each item has been reviewed and either shipped or
punted to a follow-up ticket.*
