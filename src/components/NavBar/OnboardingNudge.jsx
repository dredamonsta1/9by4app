import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfileList } from "../../redux/actions/profileListActions";
import {
  ONBOARDING_TARGET,
  ONBOARDING_DISMISSED_KEY,
} from "../OnboardingChecklist/OnboardingChecklist";
import styles from "./OnboardingNudge.module.css";

/**
 * Progress toward three artists, in the navbar.
 *
 * OnboardingChecklist already does this properly, but it only renders on
 * the profile — and a new user lands on the landing page, so the one place
 * the goal is stated is the one place they may never visit. This carries
 * the same goal everywhere without repeating the card.
 *
 * Deliberately a pointer, not a second checklist: it links to the profile
 * where the real thing lives. Two components explaining the same task in
 * different words is how copy drifts apart.
 *
 * Shares ONBOARDING_TARGET and ONBOARDING_DISMISSED_KEY with the checklist,
 * so dismissing there silences this too. A badge that outlives an explicit
 * "I'm done with this" reads as nagging.
 */
const OnboardingNudge = ({ onNavigate }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const list = useSelector((state) => state.profileList.list);
  const loaded = useSelector((state) => state.profileList.loaded);
  const loading = useSelector((state) => state.profileList.loading);

  // Only ArtistPanel and ProfilePage fetch this, so on /library, /rooms,
  // /picks and the rest the list is empty for want of a request rather than
  // for want of artists. Fetching here means the count is right wherever
  // the navbar is, which is everywhere.
  useEffect(() => {
    if (user && !loaded && !loading) dispatch(fetchProfileList());
  }, [dispatch, user, loaded, loading]);

  if (!user) return null;

  // Waiting for the fetch rather than assuming zero. Rendering "0/3" first
  // and correcting to "5/3" a moment later would be worse than a beat of
  // nothing, and for most returning users the correct answer is to render
  // nothing at all.
  if (!loaded) return null;

  const dismissed = localStorage.getItem(ONBOARDING_DISMISSED_KEY) === "1";
  if (dismissed) return null;

  const count = list.length;
  if (count >= ONBOARDING_TARGET) return null;

  const remaining = ONBOARDING_TARGET - count;

  return (
    <Link
      to="/profile"
      className={styles.nudge}
      onClick={onNavigate}
      aria-label={`Onboarding: ${count} of ${ONBOARDING_TARGET} artists added. ${remaining} more to finish setting up.`}
    >
      <span className={styles.dots} aria-hidden="true">
        {Array.from({ length: ONBOARDING_TARGET }, (_, i) => (
          <span key={i} className={i < count ? styles.dotOn : styles.dot} />
        ))}
      </span>
      <span className={styles.label} aria-hidden="true">
        {remaining === 1 ? "1 more artist" : `Add ${remaining} artists`}
      </span>
    </Link>
  );
};

export default OnboardingNudge;
