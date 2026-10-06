import { useCallback, useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

// The signed-in fan's discovery playlists (Story 27). The first visit can
// take several seconds — the server builds them then (similar artists,
// Gemini, preview lookups) — so `loading` is a real state, not a flash.

export function useDiscoveryPlaylists({ enabled = true } = {}) {
  const [state, setState] = useState({ status: "loading", playlists: [], seedsNeeded: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState(null);

  const apply = (data) =>
    setState({
      status: data?.status ?? "ready",
      playlists: Array.isArray(data?.playlists) ? data.playlists : [],
      seedsNeeded: data?.seeds_needed ?? 0,
    });

  useEffect(() => {
    if (!enabled) return undefined;
    let active = true;
    setState((s) => ({ ...s, status: "loading" }));
    axiosInstance
      .get("/playlists/me")
      .then((res) => active && apply(res.data))
      .catch(() => active && setState({ status: "error", playlists: [], seedsNeeded: 0 }));
    return () => {
      active = false;
    };
  }, [enabled]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setNotice(null);
    try {
      const res = await axiosInstance.post("/playlists/me/refresh");
      apply(res.data);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 429) {
        const mins = err.response.data?.retry_after_minutes;
        setNotice(mins ? `Fresh playlists in ${mins} min.` : "Just refreshed — try again soon.");
      } else if (status === 409) {
        setNotice(err.response.data?.message ?? "Add more artists to your Top 20 first.");
      } else {
        setNotice("Couldn't refresh right now.");
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  return { ...state, refresh, refreshing, notice };
}
