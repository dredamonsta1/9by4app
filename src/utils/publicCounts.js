// Public counts (fans, ballots, members, followers…) are only shown once
// they're big enough to help. Below the threshold a visitor reads "14 fans
// voting" or "1 fans claim them" as "nobody is here", which says more about
// how early StanBox is than about the artist. Hidden, never faked: each
// number reappears by itself once it passes the threshold.
//
// Private views keep the real numbers: the admin dashboard, an artist's own
// dashboard, and your own profile.
export const PUBLIC_COUNT_THRESHOLD = 100;

/** True when a public count is big enough to show. */
export const showPublicCount = (n) => Number(n) >= PUBLIC_COUNT_THRESHOLD;
