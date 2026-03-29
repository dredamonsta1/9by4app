import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import type { WeeklyTrendingData } from "../types/api";

// Stub data — replace with real API once backend endpoint is live
const STUB: WeeklyTrendingData = {
  week_of: new Date(Date.now() - ((new Date().getDay() || 7) - 1) * 86400000)
    .toISOString()
    .split("T")[0],
  artists: [
    {
      artist_id: 1,
      artist_name: "Kendrick Lamar",
      image_url: null,
      genre: "Hip-Hop",
      play_count: 142000,
      play_delta: 38000,
      rank: 1,
      rank_delta: 2,
      momentum_score: 0.97,
    },
    {
      artist_id: 2,
      artist_name: "JID",
      image_url: null,
      genre: "Rap",
      play_count: 98000,
      play_delta: 21000,
      rank: 2,
      rank_delta: 1,
      momentum_score: 0.89,
    },
    {
      artist_id: 3,
      artist_name: "Doechii",
      image_url: null,
      genre: "Rap",
      play_count: 87000,
      play_delta: 44000,
      rank: 3,
      rank_delta: 5,
      momentum_score: 0.93,
    },
    {
      artist_id: 4,
      artist_name: "GloRilla",
      image_url: null,
      genre: "Hip-Hop",
      play_count: 76000,
      play_delta: 12000,
      rank: 4,
      rank_delta: 0,
      momentum_score: 0.78,
    },
    {
      artist_id: 5,
      artist_name: "Latto",
      image_url: null,
      genre: "Rap",
      play_count: 61000,
      play_delta: -4000,
      rank: 5,
      rank_delta: -1,
      momentum_score: 0.71,
    },
  ],
  creators: [
    {
      user_id: 101,
      username: "beatsbydre_jr",
      profile_image: null,
      social_followers: 284000,
      social_delta: 18000,
      platform: "tiktok",
      rank: 1,
      rank_delta: 3,
      momentum_score: 0.95,
    },
    {
      user_id: 102,
      username: "rapradar_clips",
      profile_image: null,
      social_followers: 195000,
      social_delta: 9500,
      platform: "instagram",
      rank: 2,
      rank_delta: 1,
      momentum_score: 0.88,
    },
    {
      user_id: 103,
      username: "lyricbreakdown",
      profile_image: null,
      social_followers: 143000,
      social_delta: 31000,
      platform: "youtube",
      rank: 3,
      rank_delta: 6,
      momentum_score: 0.91,
    },
    {
      user_id: 104,
      username: "trapwire_daily",
      profile_image: null,
      social_followers: 98000,
      social_delta: 4200,
      platform: "twitter",
      rank: 4,
      rank_delta: 0,
      momentum_score: 0.74,
    },
    {
      user_id: 105,
      username: "drillscene_chi",
      profile_image: null,
      social_followers: 77000,
      social_delta: 11000,
      platform: "tiktok",
      rank: 5,
      rank_delta: 2,
      momentum_score: 0.82,
    },
  ],
};

interface UseWeeklyTrendingResult {
  data: WeeklyTrendingData | null;
  loading: boolean;
  error: string | null;
}

export function useWeeklyTrending(): UseWeeklyTrendingResult {
  const [data, setData] = useState<WeeklyTrendingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axiosInstance
      .get<WeeklyTrendingData>("/trending/weekly")
      .then((res) => setData(res.data))
      .catch(() => {
        // Backend not yet implemented — fall back to stub
        setData(STUB);
      })
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
