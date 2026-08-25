import { useCallback, useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

// Data layer for quarterly picks. Components stay presentational —
// ProfilePage already owns a lot of state, and putting five picks' worth of
// fetching in there would make it worse.

/** "Q3 2026" */
export const quarterLabel = (year, quarter) => `Q${quarter} ${year}`;

/** "Jul–Sep 2026" — the months a quarter covers, for a subtitle. */
export const quarterMonths = (year, quarter) => {
  const names = ["Jan", "Apr", "Jul", "Oct"];
  const ends = ["Mar", "Jun", "Sep", "Dec"];
  return `${names[quarter - 1]}–${ends[quarter - 1]} ${year}`;
};

/**
 * "Locks 14 Oct" / "Locked" — the deadline is the reason to come back, so
 * it needs to read as a date rather than a countdown that goes stale in a
 * cached page.
 */
export const lockLabel = (locksAt, locked) => {
  if (locked) return "Locked";
  if (!locksAt) return null;
  const d = new Date(locksAt);
  if (Number.isNaN(d.getTime())) return null;
  return `Locks ${d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  })}`;
};

const quarterQuery = (year, quarter) =>
  year != null && quarter != null ? `?year=${year}&quarter=${quarter}` : "";

/**
 * One user's picks for one quarter, plus the lock state.
 *
 * `userId` null means "me". Passing null year/quarter lets the server pick
 * the open ballot, so the client never has to work out which quarter that
 * is — that logic lives in one place, server-side.
 */
export function useQuarterlyPicks({ userId = null, year = null, quarter = null } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const path = userId == null ? "/quarterly-picks/me" : `/quarterly-picks/user/${userId}`;
      const res = await axiosInstance.get(`${path}${quarterQuery(year, quarter)}`);
      setData(res.data);
    } catch (err) {
      setError(
        err?.response?.data?.message ?? "Couldn't load picks."
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [userId, year, quarter]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}

/**
 * The releases eligible for a quarter.
 *
 * Deferred: nothing fetches a ballot until someone opens the picker. It's
 * the largest payload here and most profile views never edit.
 */
export function useQuarterlyBallot({ year = null, quarter = null, enabled = true } = {}) {
  const [ballot, setBallot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get(
          `/quarterly-picks/ballot${quarterQuery(year, quarter)}`
        );
        // The picker can be closed mid-flight; setting state then would warn
        // and, worse, show a ballot for a quarter the user has moved off.
        if (!cancelled) setBallot(res.data);
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.message ?? "Couldn't load the ballot.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [year, quarter, enabled]);

  return { ballot, loading, error };
}

/** Which quarters a user has filled — drives the history list. */
export function useQuarterList({ userId = null, enabled = true } = {}) {
  const [quarters, setQuarters] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const path =
        userId == null
          ? "/quarterly-picks/me/quarters"
          : `/quarterly-picks/user/${userId}/quarters`;
      const res = await axiosInstance.get(path);
      setQuarters(res.data?.quarters ?? []);
    } catch {
      // A missing history list shouldn't take down the profile — the open
      // quarter still renders from its own request.
      setQuarters([]);
    } finally {
      setLoading(false);
    }
  }, [userId, enabled]);

  useEffect(() => {
    load();
  }, [load]);

  return { quarters, loading, reload: load };
}

/** Saves a ranked list. Returns the server's error message on rejection. */
export async function saveQuarterlyPicks({ year, quarter, albumIds }) {
  const res = await axiosInstance.put("/quarterly-picks/me", {
    year,
    quarter,
    album_ids: albumIds,
  });
  return res.data;
}
