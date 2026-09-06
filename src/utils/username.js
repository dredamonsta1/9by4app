// Username rules, mirrored from the API.
//
// The server is authoritative — nineByFourApi src/utils/username.js, enforced
// in POST /auth/verify-code and by idx_users_username_lower. This copy exists
// only to move the error earlier.
//
// Without it the rules fire *after* code verification, which is the correct
// order server-side (nothing about usernames should leak to someone without a
// valid code) but the worst possible moment for the user: they type `admin`,
// wait for an email, enter a six-digit code, and only then find out. Then
// they start again.
//
// The duplication is a drift risk. If the API's rules change, change these
// too — and if they disagree, the server wins and the user sees the later
// error, which is the failure this file exists to prevent.

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;

const SHAPE = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;

const RESERVED = new Set([
  "admin", "administrator", "root", "system", "support", "help", "moderator",
  "mod", "staff", "official", "stanbox", "9by4", "ninebyfour", "api", "www",
  "null", "undefined", "anonymous", "deleted", "me", "settings", "login",
  "signup", "register", "profile", "picks", "rankings",
]);

/** Returns null when the name is fine, or a message naming what's wrong. */
export function validateUsername(raw) {
  if (typeof raw !== "string") return "Username is required.";
  const name = raw.trim();

  if (name.length === 0) return "Username is required.";
  if (name.length < USERNAME_MIN) return `Username must be at least ${USERNAME_MIN} characters.`;
  if (name.length > USERNAME_MAX) return `Username must be ${USERNAME_MAX} characters or fewer.`;
  if (!SHAPE.test(name)) {
    return "Username can use letters, numbers, hyphens and underscores, and must start with a letter or number.";
  }
  if (RESERVED.has(name.toLowerCase())) return "That username is reserved.";
  return null;
}
