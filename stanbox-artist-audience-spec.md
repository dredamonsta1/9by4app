# StanBox Artist Audience Dashboard — Spec v1.0

**Status:** Draft, 2026-08-10
**Depends on:** Pillar B downloads commerce (shipped, validated 2026-06-09), artist claim flow (shipped), passwordless auth (shipped)
**Blocks on:** checkout disclosure copy (§6) — no buyer email renders until that ships

---

## 1. Problem

`ArtistDashboard.jsx` is fandom-only. It calls `GET /api/artists/:artist_id/stans`, renders three stat cards and a ranked list of `@username` + avatar, and stops there.

Meanwhile Pillar B has been live and transacting since 2026-06-09, and **the only read on `purchases` is `GET /api/users/me/purchases` (`routes/users.ts:257`) — the fan's library.** There is no artist-side sales endpoint anywhere in the API. An artist who makes a sale cannot see that it happened. Stripe onboarding lives in `ArtistSettings`, pricing lives in the admin panel, and the revenue is only visible in the Stripe dashboard.

This spec closes that gap and, in doing so, delivers the platform's actual artist-side differentiator: **a single list of people that carries both devotion and purchase on the same row.**

### Why this is defensible

Pulled 2026-08-10 from primary sources:

- **Spotify for Artists** gives aggregate segments (Monthly Active — subdivided Super 15+ / Moderate 3–14 / Light 1–2 streams per 28 days — plus Previously Active and Programmed), top 100 cities, age/gender buckets, CSV export. No identity, ever.
- **Apple Music for Artists** gives plays, listeners, purchases, Shazam counts by country/region/city, demographics on Shazam listeners, and a "top emerging cities" velocity view. No identity, ever.
- **Bandcamp** gives buyer email on every sale — and that, not analytics, is why artists are loyal to it.

Spotify's own documentation reports that monthly active listeners are ~33% of an artist's audience but drive 60% of streams and **80% of merch purchases**. That is external validation of the Top-20 gate: declared engagement predicts purchase at roughly 2.4x. StanBox is the only one of these that has the declaration.

---

## 2. Reconciling with `stanbox-microdemographic-spec.md`

The microdemographic spec states: *"Artists never see individual fans without explicit fan consent"* and *"aggregate by design, not by privacy patch."*

That principle stands, and this spec does not overturn it. The reconciliation:

| Surface | Visibility | Basis |
|---|---|---|
| Heatmap, tenure, demographics, co-stan graph | Aggregate only, n-threshold suppressed | Microdemographic spec, unchanged |
| Stan list — `@username` + rank | Individual | Pre-existing shipped behavior (see below) |
| **Buyer email** | **Individual** | **Purchase is the explicit consent event**, disclosed at checkout |

A purchase, with clear disclosure at the point of sale, *is* the "explicit fan consent" the microdemographic spec carves out. Email is released by the act of buying and by nothing else.

**Pre-existing condition to note, not introduced here:** the shipped stan list already exposes every stan's `@username`, avatar, and profile link to the artist, with no visibility filter in the query and no fan-side opt-out. That is already inconsistent with the microdemographic spec's stated default. This spec does not widen it, but §11 flags it as a decision Andre should make deliberately rather than inherit.

---

## 3. Locked decisions

| Decision | Choice | Rationale |
|---|---|---|
| Buyer emails to artists | **Yes** | Bandcamp parity. Decided 2026-08-10. The point of Pillar B is an owned artist↔fan channel. |
| Email visibility scope | **Buyers only** | Non-buying stans stay `@username`-only. Purchase is the consent event; the locked rows make the mechanic self-evident. |
| One list or two | **One** | The Top-20 gate makes buyers a strict subset of stans. Two tables would be a reconciliation problem invented for no reason. |
| Endpoint strategy | **Extend `/artists/:artist_id/stans`** | It is already correctly gated (admin OR the linked verified artist, `artists.js:1325`). Additive response fields; no new route, no new auth surface. |
| Email storage | **No snapshot column** | `purchases.user_id` → `users.email`. Serve live. A changed email should reach the artist. |
| Sending email | **Out of scope** | v1 hands over the list. Deliverability and spam liability are a separate project. See §10. |
| Revenue charting | **Out of scope at v1** | First purchase was 2026-06-09. A time series on this data is two points and whitespace. |

---

## 4. Data model

**No migration required.** Everything needed already exists:

- `user_profile_artists` — `user_id`, `artist_id`, `position`, `created_at`, `updated_at`
- `purchases` — `id`, `user_id`, `album_id`, `artist_id`, `amount_cents`, `platform_fee_cents`, `artist_share_cents`, `stripe_payment_intent_id`, `stripe_charge_id`, `created_at`
- `users` — `user_id`, `username`, `profile_image`, `email` (`VARCHAR(255) UNIQUE NOT NULL`)
- `albums` — `album_name`, `album_image_url`

Because [[passwordless-auth]] makes email the account identifier, **every buyer email is verified by construction** — the user proved control by receiving an OTP. StanBox buyer lists are cleaner than Bandcamp's, where checkout email is unverified. Worth saying to artists explicitly.

---

## 5. API

### `GET /api/artists/:artist_id/stans` (extended)

File: `src/routes/artists.js` (still plain JS — do **not** scope a TS conversion into this PR).

Auth unchanged: `authenticateToken`, then `role === "admin"` OR `users.artist_id === :artist_id`, else 403.

Query becomes a left join with a purchase aggregate:

```sql
SELECT u.user_id, u.username, u.profile_image,
       upa.position,
       upa.created_at AS added_at,
       upa.updated_at,
       COALESCE(p.purchase_count, 0)::int AS purchase_count,
       COALESCE(p.total_cents, 0)::int    AS total_spent_cents,
       COALESCE(p.artist_share_cents, 0)::int AS artist_earned_cents,
       p.last_purchase_at,
       CASE WHEN p.purchase_count > 0 THEN u.email ELSE NULL END AS email,
       p.albums AS purchased_albums
  FROM user_profile_artists upa
  JOIN users u ON u.user_id = upa.user_id
  LEFT JOIN (
    SELECT pu.user_id,
           COUNT(*)                     AS purchase_count,
           SUM(pu.amount_cents)         AS total_cents,
           SUM(pu.artist_share_cents)   AS artist_share_cents,
           MAX(pu.created_at)           AS last_purchase_at,
           JSON_AGG(JSON_BUILD_OBJECT(
             'album_id',   al.album_id,
             'album_name', al.album_name,
             'amount_cents', pu.amount_cents,
             'created_at', pu.created_at
           ) ORDER BY pu.created_at DESC) AS albums
      FROM purchases pu
      JOIN albums al ON al.album_id = pu.album_id
     WHERE pu.artist_id = $1
     GROUP BY pu.user_id
  ) p ON p.user_id = upa.user_id
 WHERE upa.artist_id = $1
 ORDER BY upa.position ASC NULLS LAST, upa.created_at DESC
```

The `CASE WHEN` is the privacy contract expressed in SQL: email is `NULL` for non-buyers, at the database layer, so no frontend mistake can leak it.

Response:

```jsonc
{
  "stans": [ /* rows as above */ ],
  "count": 38,
  "summary": {
    "total_stans": 38,
    "buyers": 11,
    "non_buyers": 27,
    "gross_cents": 10989,
    "artist_earned_cents": 9890,
    "top5": 6
  }
}
```

**Fixes a live bug in passing.** The current query selects `upa.created_at` with no alias, but `ArtistDashboard.jsx:165` renders `formatDate(s.added_at)` — a field that does not exist in the response. `formatDate` returns `""` for nullish input, so the UI currently renders a dangling `"Added "` label with no date on every row. Aliasing to `added_at` fixes it. Per CLAUDE.md this needs a regression test.

### Churn edge case

A user can buy and later drop the artist from their Top 20. That row then has purchases but no `user_profile_artists` row, so the `JOIN` drops it — the artist would see revenue vanish from the list. Handle with a `FULL OUTER JOIN` or a `UNION` of purchasers not currently stanning, surfaced as a distinct **"Bought · no longer ranked"** state. Small population today; correctness matters more than the volume.

### `GET /api/artists/:artist_id/stans.csv`

Same auth, same query, `text/csv`, `Content-Disposition: attachment`. Columns: `rank, username, email, purchase_count, total_spent, last_purchase, added_at`. Log every call (artist_id, requesting user, row count, timestamp) for the audit trail in §6.

---

## 6. Consent and disclosure — **ships first, blocks everything else**

No buyer email may render until all three are live:

1. **Checkout disclosure.** The buy flow (`components/AlbumBuyButton/`) must state before payment: *"Your email address will be shared with the artist so they can contact you about this release."* Plain, adjacent to the buy button, not buried in a tooltip.
2. **Terms clause.** `src/pages/TermsOfUse/TermsOfUse.jsx` uses a `sections` array of `{ title, body }`. Add a section covering: what is shared (email + purchase detail), with whom (the selling artist), when (on completed purchase only), and that it cannot be retracted after the sale.
3. **Fan-side transparency.** The Library page (`src/pages/Library/`) shows a line per purchase: *"[Artist] has your email."* Cheap, pairs with a page fans already visit, and reads as trustworthy precisely because nobody else does it.

Rate-limit and log CSV export. The real abuse gate is the claim flow — a bad actor must first pass artist verification with structured proof — so controls here should stay proportionate.

---

## 7. Frontend

`src/pages/ArtistDashboard/ArtistDashboard.jsx`, additive.

### Stat cards

Replace the "Ranked top 10" card — it is a weaker cut of the same data as "Ranked top 5." New row:

| Total stans | Bought | Haven't bought | You've earned |
|---|---|---|---|
| 38 | 11 | **27** | $98.90 |

"Haven't bought" is the headline number. It is a warm-lead count no DSP can produce, because nobody declares fandom on Spotify.

### The row

```
 #3   @marcus_b     marcus@…    Playing With Fire · $9.99    Jun 9
 #7   @dee          —           —                            Jul 2
 #1   @nina.k       nina@…      Playing With Fire · $9.99     Jun 14
#12   @sol          —           —                            Aug 1
```

Sorted by rank. Email column present but empty on non-buyers — the locked rows teach the mechanic without copy. Reuse the existing `tierFor()` helper and `styles.top5 / top10 / top20` rank pills; no new visual language.

Email cell: click-to-copy, with a `mailto:` affordance. No compose UI (§10).

### Filters

Pills over the one list: **All · Top 5 · 6–10 · 11–20**, cross-cut by **Bought / Haven't**. This is StanBox's version of Spotify's Super/Moderate/Light ladder — except ordinal and declared rather than inferred from play counts.

### Required states

Per CLAUDE.md, all three explicit:

- **Loading** — existing `styles.muted` treatment.
- **Error** — existing `styles.error`.
- **Empty, no stans** — keep current copy.
- **Empty, stans but no sales** — *"No sales yet. 27 people have you in their Top 20 — they're who to release for."* Turns a zero into the actionable number.
- **Commerce not enabled** — if `commerce_enabled` is false or Stripe onboarding is incomplete, the money column collapses and links to `ArtistSettings` instead of rendering `$0.00` as though it were a result.

---

## 8. PR sequence

Per [[feedback_git_branching]], a new branch per PR — never stacked.

| # | Repo | Branch | Content |
|---|---|---|---|
| 1 | 9by4app | `feat/purchase-email-disclosure` | Checkout disclosure copy, ToS section, Library transparency line. **Ships and merges before #2.** |
| 2 | nineByFourApi | `feat/artist-audience-endpoint` | Extend `/stans` with purchase join + `summary`; alias `added_at`; churn edge case |
| 3 | 9by4app | `feat/artist-audience-dashboard` | Stat cards, email column, filter pills, empty/error states |
| 4 | nineByFourApi | `feat/artist-audience-csv` | `.csv` variant + export audit log |
| 5 | 9by4app | `feat/artist-audience-export` | Export button |

PRs 4–5 are independently shippable; drop them if the list view proves sufficient.

---

## 9. Testing

Backend:
- Non-owner, non-admin → 403 (regression — this is the email-leak path)
- Non-buyer rows return `email: null`
- Buyer rows return email
- Stan with zero purchases → zeroed aggregates, not `null` arithmetic
- `added_at` present and populated (the §5 bug)
- Buyer who dropped the artist still appears

Frontend (Vitest + RTL, `src/test/components/`, behavior not implementation):
- Email cell renders for buyers, renders empty for non-buyers
- Filter pills narrow the list correctly
- Each empty state renders its own copy
- Commerce-disabled state links to settings rather than showing `$0.00`

Coverage must not drop below baseline.

---

## 10. Explicitly out of scope

- **Email sending.** Resend is already in the stack for claim approve/reject, so a blast tool is one import away. Resist it — deliverability, unsubscribe handling, spam complaints, and liability for artist-authored content are a separate project.
- **Revenue time-series charts.** Revisit at volume.
- **"Emerging cities."** Apple's velocity view is worth stealing eventually; it needs volume to be anything but noise.
- **Heatmap / tenure / co-stan graph.** Owned by `stanbox-microdemographic-spec.md`, aggregate-only, unaffected by this work.

---

## 11. Open questions

1. **Should non-buying stans stay `@username`-only long-term, or should fans get an opt-in to share email without purchasing?** Current answer is purchase-only. An opt-in would grow the artist's channel but weakens purchase as the consent event.
2. **Should the shipped stan list respect a fan visibility preference?** Today every stan's username, avatar, and profile link is exposed to the artist with no filter and no opt-out — inconsistent with the microdemographic spec's stated default. Pre-existing, not introduced here, but worth deciding deliberately.
3. **Refunds.** v1 has none (Pillar B decision). If Andre processes one manually in Stripe, the `purchases` row persists and the artist keeps the email. Acceptable at current volume; revisit if refunds become routine.
4. **`artist_follows`** remains orphaned in schema after the Top-20 pivot. Unrelated to this work, still worth a cleanup PR.
