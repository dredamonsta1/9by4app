// src/redux/playerSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Track {
  // Identity — at least one must be set so the audio swap effect can key off
  // a stable identifier. Music posts use post_id (legacy); album tracks use
  // track_id + album_id; back-compat album-level audio uses album_id only.
  post_id?: number;
  track_id?: number;
  album_id?: number;
  position?: number | null;

  title?: string | null;
  audio_url: string;
  username?: string;           // music post author (optional now)
  artist_name?: string | null; // album/track artist
  album_image_url?: string | null;
}

interface PlayerState {
  queue:        Track[];
  currentIndex: number;
  isPlaying:    boolean;
}

const initialState: PlayerState = {
  queue:        [],
  currentIndex: 0,
  isPlaying:    false,
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setQueue(state, action: PayloadAction<{ tracks: Track[]; startIndex?: number }>) {
      state.queue        = action.payload.tracks;
      state.currentIndex = action.payload.startIndex ?? 0;
      state.isPlaying    = true;
    },
    playTrack(state, action: PayloadAction<number>) {
      state.currentIndex = action.payload;
      state.isPlaying    = true;
    },
    nextTrack(state) {
      if (state.currentIndex < state.queue.length - 1) {
        state.currentIndex += 1;
        state.isPlaying = true;
      }
    },
    prevTrack(state) {
      if (state.currentIndex > 0) {
        state.currentIndex -= 1;
        state.isPlaying = true;
      }
    },
    togglePlay(state) {
      state.isPlaying = !state.isPlaying;
    },
    setPlaying(state, action: PayloadAction<boolean>) {
      state.isPlaying = action.payload;
    },
    clearPlayer(state) {
      state.queue        = [];
      state.currentIndex = 0;
      state.isPlaying    = false;
    },
  },
});

export const { setQueue, playTrack, nextTrack, prevTrack, togglePlay, setPlaying, clearPlayer } = playerSlice.actions;
export default playerSlice.reducer;
