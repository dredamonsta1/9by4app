# StanBox Account Deletion — Spec v0.1

**Status:** Decided 2026-09-16 — ready to build
**Origin:** Andre, 2026-09-16 — *"account deletion should be the customers choice so yes that should be there"*
**Trigger:** App Store review requires in-app account deletion for any app that creates accounts. StanBox creates them via passwordless signup, so this is a hard launch blocker, not a nice-to-have.

---

## 1. Why anonymise rather than hard delete

The obvious implementation is `DELETE FROM users WHERE user_id = $1` and let the cascades run. **The schema says that would be wrong.** 29 foreign keys cascade from `users`, and three of them destroy things that must survive.

### `quarterly_picks` — cascade breaks a sealed chart

Q3 2026 is published and reads *"from 5 ballots"*. A user deleting their account silently makes it 4, and the chart changes.

The entire point of locking a quarter is that it becomes an artifact — immutable, citable, the same thing for everyone who looks at it. A delete that rewrites history retroactively defeats the feature. **Picks must survive the person.**

### `purchases` — financial records

Stripe keeps its own record, but destroying ours makes disputes, refunds and artist payouts unreconstructable. Financial records are also the clearest case where retention is defensible under both App Store policy and privacy law.

### `crate_adoptions` — measurement integrity

Adoption counts are how crates get judged. A deleted account silently decrementing them makes the one number that justifies the feature unreliable.

### The conclusion

**Anonymise the user row; keep the rows that point at it.** The person becomes unidentifiable, the platform's history stays intact. This is standard practice and it satisfies the requirement — Apple asks that the account be deleted and personal data removed, with an explicit carve-out for data retained for legitimate legal and financial purposes.

---

## 2. What happens to what

| Table | Action | Why |
|---|---|---|
| `users` — email, username, profile_image, country/region | **Overwritten** | This is the PII. Username becomes `deleted_<id>` so nothing collides with the unique index |
| `users` — row itself | **Kept** | Every FK points here; removing it is what triggers the destructive cascades |
| `quarterly_picks` | **Kept** | A sealed quarter must not change |
| `purchases` | **Kept** | Financial record |
| `crate_adoptions` | **Kept** | Measurement integrity |
| `login_codes` | **Deleted** | Live credentials — must not outlive the account |
| `user_profile_artists` (Top 20) | **Deleted** | Personal taste, not platform history |
| `crates` owned | **Kept**, attributed to `deleted_<id>` | Decided 2026-09-16. A crate is a recommendation others may have adopted; a link that 404s breaks their page, not the deleter's |
| `posts` / `image_posts` / `music_posts` / `video_posts` | **Kept**, attributed to `deleted_<id>` | Decided 2026-09-16 — *"park posts not delete them as community historical data"*. Threads stay whole |
| `messages` | **Kept**, attributed to `deleted_<id>` | Decided 2026-09-16. A conversation has two people; one leaving must not destroy the other's half |

**Clout is not recomputed.** Removing a Top 20 currently decrements clout, and doing that on deletion would let someone quietly damage every artist they ever stanned on the way out. Deletion should not be a weapon.

---

## 3. The flow

**Not one tap.** Deletion is irreversible and the App Store requirement is that it be *available*, not that it be frictionless.

```
Profile → Settings → Delete account
   ↓
what will happen, in plain words
   ↓
type the username to confirm
   ↓
DELETE /users/me   (auth required)
   ↓
token cleared, signed out, home
```

Typing the username rather than a checkbox, because the action cannot be undone and a misclick is unrecoverable. Same standard as the crate reissue confirmation, scaled to the stakes.

**Both platforms.** Web and iOS. iOS is the compliance driver, but a web-only deletion is worse than none — it teaches people the app can't do something the site can.

---

## 4. Decisions

**Decided 2026-09-16 — posts are parked, not deleted.** Andre: *"we could park posts not delete them as community historical data"*. Threads stay whole, replies keep their context, and the platform's record of what was said survives the person who said it.

**Decided 2026-09-16 — crates survive**, attributed to `deleted_<id>`.

### What this simplifies

Both decisions make the implementation *smaller*, not larger. Because the `users` row is anonymised rather than removed, a post or crate that is "kept" needs **no handling at all** — the foreign key still resolves, and the author renders as `deleted_<id>` because that is now the username. Deleting posts was the branch that would have needed real work.

The rule across the whole feature collapses to one line: **anonymise the person, touch nothing that points at them**, except credentials and personal taste.

**Decided 2026-09-16 — messages survive**, attributed. A conversation has two people, and one leaving must not destroy the other's half of an exchange they never agreed to lose.

**Decided 2026-09-16 — immediate, no grace period.** A soft window is kinder and standard, but accounts that are "deleted" while still existing muddy the compliance story, and nothing in the product is expensive to rebuild.

### One consequence worth accepting deliberately

Parking posts means content a person wrote **stays public** after they ask to be erased. If a post contains something personally identifying — their own name, their location, a photo of themselves — anonymising the author does not remove it.

That is a real and normal trade, and it is how Reddit works. Worth stating plainly rather than discovering when someone asks. If it ever becomes a problem, the answer is a per-post delete the user runs *before* deleting the account, which already exists.

---

## 5. Not in scope

- Admin deletion, which already exists in `admin.ts` and is a different act with different rules
- Data export ("download my data") — a separate right, not required for App Store review
- Artist account claims — a claimed artist page belongs to the platform, not the claimer; deleting the user should unlink, not remove the artist

---

## 6. How we'd know it worked

```sql
-- the person is gone
SELECT email, username FROM users WHERE user_id = <id>;   -- anonymised

-- the history is not
SELECT COUNT(*) FROM quarterly_picks WHERE user_id = <id>;   -- unchanged
SELECT COUNT(*) FROM purchases      WHERE user_id = <id>;    -- unchanged

-- and the published chart still says 5
SELECT ballot_count FROM ... /quarterly-picks/aggregate?year=2026&quarter=3;
```

The last one is the real test. **If deleting an account changes a locked quarter's ballot count, the implementation is wrong**, however clean the rest looks.
