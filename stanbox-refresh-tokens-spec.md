# StanBox Refresh Tokens — Spec v1.0 (PARKED)

**Status:** Specced 2026-08-14, **not scheduled**
**Backlog origin:** Future Stories #8
**Parked behind:** moving the API to a stanbox subdomain, which is post-funding
**Stopgap shipped instead:** JWT TTL raised 24h → 30d (`src/authConfig.ts`, nineByFourApi)

---

## 1. Why this is parked, not cancelled

The felt problem was "I log in every day." That came from a 24-hour JWT, and raising it to 30 days fixed the symptom for one line of code.

What the stopgap does **not** fix:

- **No revocation.** A stolen token is valid until it expires. There is no way to end a session, and no "log out all devices."
- **A wider window.** 30 days of exposure instead of 1 if a token leaks.

That's a wider window on an exposure that already existed rather than a new class of risk — the 24h token was equally non-revocable. Acceptable at current volume. It stops being acceptable when Pillar B GMV grows enough that account takeover means real money, or the first time someone needs a session killed.

**The trigger to un-park this:** the API moving to `api.stanbox.com` (or any stanbox subdomain). That's what makes first-party cookies possible, and it's the thing worth waiting for — see §3.

---

## 2. Locked decisions

From the Story 8 workshop (2026-07-23), plus the storage decision revisited 2026-08-14 once the cross-origin constraint surfaced.

| Decision | Choice |
|---|---|
| Pattern | Access token + refresh token. Not a longer JWT |
| User experience | Zero visible friction. No "session expired" screen, no "remember me" |
| Access token TTL | **1 hour** |
| Refresh token TTL | **90 days**, rolling — extended on every successful refresh |
| Rotation | **Rotate on use.** A refresh token is single-use |
| Sessions | **Per device.** `refresh_tokens` keyed on `(user_id, device_id)` with `revoked_at` |
| Access token storage | `localStorage` |
| Refresh token storage | **httpOnly cookie — requires the subdomain move first** |
| iOS | **Deferred.** Keychain-stored JWT keeps working; web proves the pattern first |

---

## 3. The constraint that parks this

The frontend is on Netlify; the API is `ninebyfourapi.herokuapp.com`. **Different origins.** That makes an httpOnly refresh cookie expensive and fragile:

- `src/index.ts` sets `cors({ origin: "*" })`. A wildcard origin is **spec-incompatible** with `credentials: true` — browsers reject it. Cookies mean replacing the wildcard with an explicit allowlist.
- No `cookie-parser` in the dependency tree.
- The cookie needs `SameSite=None; Secure`, plus `withCredentials` on axios and `Access-Control-Allow-Credentials` on the server.
- **Safari.** Its tracking prevention treats the Heroku domain as third-party relative to the app domain and may drop the cookie outright — silently breaking refresh for iPhone browser users, a meaningful slice of a music platform's audience.

Once the API sits on a stanbox subdomain, all four problems disappear at once: same-site cookie, no CORS credentials dance, no ITP exposure.

**The alternative considered and rejected for now:** build it with `localStorage` for the refresh token. It works everywhere and carries no worse XSS exposure than today's JWT — but it means building the transport twice, and the whole reason to do this story is the security posture that `localStorage` undercuts. Not worth doing twice when the stopgap already removes the pain.

---

## 4. What the work actually is

Most of it is transport-agnostic. When this un-parks, only the storage/transport layer depends on the cookie decision — the table, endpoints, rotation, and revocation are identical either way.

### Backend

**New table:**

```sql
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  token_hash   VARCHAR(128) NOT NULL,
  device_id    VARCHAR(64),
  expires_at   TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked_at   TIMESTAMP WITH TIME ZONE,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP WITH TIME ZONE
);
CREATE UNIQUE INDEX ON refresh_tokens(token_hash);
CREATE INDEX ON refresh_tokens(user_id, revoked_at);
```

Store a **hash**, never the raw token — same reasoning as `login_codes.code_hash`, which already does this.

**Endpoints:**

- `POST /api/auth/refresh` — verify the presented token is unrevoked and unexpired, issue a new access token **and a new refresh token**, mark the old one used. Rotation means a stolen token is dead the moment the legitimate user next refreshes.
- `POST /api/auth/logout` — revoke the presented refresh token. Frontend-only logout leaves a valid token in the wild.
- `POST /api/auth/verify-code` — also issue a refresh token alongside the access token.

**Middleware:** `authenticateToken` already distinguishes expiry (401 "Authentication token expired.") from invalidity (403). Add a machine-readable `reason: "token_expired"` — the codebase already uses this pattern (`top20_required`, `export_rate_limited`, `signup_required`) and the interceptor shouldn't have to match on prose.

### Frontend

**`utils/axiosInstance.ts` is the crux.** Today its 401 handler does the blunt thing:

```js
localStorage.removeItem("token");
store.dispatch(logout());
window.location.href = "/login";
```

That becomes: on a 401 with `reason: "token_expired"`, call `/auth/refresh`, retry the original request with the new access token, and only fall through to logout if the refresh itself fails.

Three things that will bite whoever builds it:

1. **Concurrent 401s.** A page firing six requests when the token expires must not fire six refreshes. Queue them behind a single in-flight refresh promise and replay once it resolves.
2. **Infinite loops.** The retry must be marked so a second 401 on the same request doesn't recurse. A `_retried` flag on the config.
3. **The refresh call itself must bypass the interceptor**, or a failing refresh triggers a refresh.

Also: `axiosInstance.ts` still carries ~25 lines of commented-out legacy code at the top. Delete it while in there.

**Elsewhere:** `authSlice` tracks the access token (refresh lives in the cookie); `Login.jsx` and `Signup.jsx` store what comes back from verify; the logout action calls `/auth/logout` before clearing local state.

---

## 5. PR sequence

| # | Repo | Content |
|---|---|---|
| 0 | infra | **Move the API to a stanbox subdomain.** Blocks everything below |
| 1 | nineByFourApi | `refresh_tokens` table + `/auth/refresh` + `/auth/logout`, cookie-based |
| 2 | nineByFourApi | CORS allowlist + `credentials: true` + cookie-parser; `reason` on expiry |
| 3 | 9by4app | Interceptor rework: queued refresh, retry, loop guard. Delete dead code |
| 4 | 9by4app | Logout hits the backend; `authSlice` and auth screens updated |

PRs 1 and 2 could merge, but the CORS change is independently risky enough to isolate — it's the one that can take the whole API offline for the browser.

---

## 6. When it un-parks, re-verify these

Specs rot. Before building, confirm:

- `ACCESS_TOKEN_TTL` is still the only place TTL is set (`src/authConfig.ts`)
- `authenticateToken` still returns 401 for expiry and 403 for invalid (`src/middleware.ts`)
- CORS is still `origin: "*"` in `src/index.ts` — if it changed, the §3 analysis may be stale
- The legacy `POST /api/users/login` still exists. It signs its own token; if it's been removed, PR 1 is simpler
- iOS is still on a Keychain JWT and unaffected

---

## 7. Explicitly out of scope

- **iOS.** Web first. iOS keeps working throughout, since existing token issuance stays valid.
- **Renaming legacy `/api/users/login`.** The backlog is explicit: don't batch auth cleanups into this. Keep the PR focused.
- **"Log out all devices" UI.** The per-device model enables it; building the surface is separate.
