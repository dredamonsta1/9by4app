import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfileList } from "../../redux/actions/profileListActions";

// Set when someone chooses "I'll do this later". Deliberately NOT
// ONBOARDING_DISMISSED_KEY: skipping is "not now" and must leave the navbar
// nudge alive, while dismissing is "stop asking" and silences it.
export const WELCOME_SKIPPED_KEY = "stanbox_welcome_skipped";

/**
 * Sends logged-in users with no artists to the welcome flow.
 *
 * The redirect used to live only in the Login and Signup handlers, which
 * meant it depended on the auth code that ran being current — a tab holding
 * a pre-deploy bundle would call navigate("/") and the flow never happened.
 * Deciding at the destination instead makes it true regardless of how
 * somebody arrived: a fresh signup, a login, a bookmark, or a stale tab.
 *
 * Only fires on "/", so deep links are never hijacked — someone opening a
 * shared artist page stays on it.
 *
 * Renders nothing.
 */
const FirstRunGate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = useSelector((state) => state.auth.user);
  const list = useSelector((state) => state.profileList.list);
  const loaded = useSelector((state) => state.profileList.loaded);
  const loading = useSelector((state) => state.profileList.loading);

  // The gate can't decide anything until it knows the artist count, and
  // outside ProfilePage/ArtistPanel nothing fetches it.
  useEffect(() => {
    if (user && !loaded && !loading) dispatch(fetchProfileList());
  }, [dispatch, user, loaded, loading]);

  useEffect(() => {
    if (!user || !loaded || pathname !== "/") return;
    // An empty list here is a real zero, not "not fetched yet" — `loaded`
    // distinguishes those, which is why it exists.
    if (list.length > 0) return;
    if (localStorage.getItem(WELCOME_SKIPPED_KEY) === "1") return;
    navigate("/welcome", { replace: true });
  }, [user, loaded, list.length, pathname, navigate]);

  return null;
};

export default FirstRunGate;
