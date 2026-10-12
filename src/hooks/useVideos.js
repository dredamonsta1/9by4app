import { useCallback, useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

// The video section's data (Story 31): GET /api/videos, a page at a time.
// `tab` is "all" | "following", `type` is "all" | "music".
// `refreshKey`: bump it to reload from the top (e.g. after posting).
export function useVideos({ tab = "all", type = "all", enabled = true, refreshKey = 0 } = {}) {
  const [videos, setVideos] = useState([]);
  const [nextBefore, setNextBefore] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error | signin
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPage = useCallback(
    (before) =>
      axiosInstance.get("/videos", {
        params: { tab, type: type === "music" ? "music" : undefined, before: before ?? undefined },
      }),
    [tab, type]
  );

  useEffect(() => {
    if (!enabled) return undefined;
    let active = true;
    setStatus("loading");
    setVideos([]);
    setNextBefore(null);
    fetchPage(null)
      .then((res) => {
        if (!active) return;
        setVideos(res.data?.videos ?? []);
        setNextBefore(res.data?.next_before ?? null);
        setStatus("ready");
      })
      .catch((err) => active && setStatus(err?.response?.status === 401 ? "signin" : "error"));
    return () => {
      active = false;
    };
  }, [fetchPage, enabled, refreshKey]);

  const loadMore = useCallback(async () => {
    if (!nextBefore || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetchPage(nextBefore);
      setVideos((v) => [...v, ...(res.data?.videos ?? [])]);
      setNextBefore(res.data?.next_before ?? null);
    } catch {
      // Keep what's shown; the button stays for another try.
    } finally {
      setLoadingMore(false);
    }
  }, [fetchPage, nextBefore, loadingMore]);

  return { videos, status, hasMore: !!nextBefore, loadMore, loadingMore };
}
