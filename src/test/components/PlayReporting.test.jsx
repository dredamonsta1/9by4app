import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, fireEvent, act } from "@testing-library/react";
import { renderWithProviders } from "../utils";
import PlayerBar from "../../components/PlayerBar/PlayerBar";
import AlbumPreviewButton from "../../components/AlbumPreviewButton/AlbumPreviewButton";
import axiosInstance from "../../utils/axiosInstance";

// Story 29: a preview counts as a play after 10 seconds, for signed-in users
// only, once per track. These reports feed co-listening similarity.

vi.mock("../../utils/axiosInstance", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

const signedIn = { user: { user_id: 1, username: "andrew3" }, isLoggedIn: true };
const signedOut = { user: null, isLoggedIn: false };

const clip = (overrides = {}) => ({
  album_id: 7,
  title: "Start · preview",
  audio_url: "https://audio-ssl.itunes.apple.com/1.m4a",
  artist_name: "Frank Ocean",
  artist_id: 42,
  source: "apple",
  ...overrides,
});

const plays = () => axiosInstance.post.mock.calls.filter(([url]) => url === "/plays");

// jsdom doesn't play media; drive currentTime by hand and fire timeupdate.
const playTo = (seconds) => {
  const audio = document.querySelector("audio");
  Object.defineProperty(audio, "currentTime", { configurable: true, get: () => seconds, set: () => {} });
  fireEvent.timeUpdate(audio);
};

describe("PlayerBar — play reporting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axiosInstance.get.mockResolvedValue({ data: [] });
    axiosInstance.post.mockResolvedValue({});
  });

  const renderBar = ({ auth = signedIn, track = clip() } = {}) =>
    renderWithProviders(<PlayerBar />, { preloadedState: { auth, player: { queue: [track], currentIndex: 0, isPlaying: false } } });

  it("reports once the clip passes 10 seconds", () => {
    renderBar();
    playTo(9);
    expect(plays()).toHaveLength(0);
    playTo(10.2);
    expect(plays()).toEqual([["/plays", { artist_id: 42, album_id: 7, source: "apple" }]]);
  });

  it("reports only once per track, however much it's scrubbed", () => {
    renderBar();
    playTo(12);
    playTo(20);
    playTo(11);
    expect(plays()).toHaveLength(1);
  });

  it("never reports for a signed-out listener", () => {
    renderBar({ auth: signedOut });
    playTo(25);
    expect(plays()).toHaveLength(0);
  });

  it("doesn't report tracks that aren't previews (no artist_id), like music posts", () => {
    renderBar({ track: clip({ artist_id: undefined, post_id: 5 }) });
    playTo(25);
    expect(plays()).toHaveLength(0);
  });

  it("keeps playing if the report fails", () => {
    axiosInstance.post.mockRejectedValue(new Error("offline"));
    renderBar();
    expect(() => playTo(15)).not.toThrow();
  });
});

describe("AlbumPreviewButton — play reporting", () => {
  let audio;

  beforeEach(() => {
    vi.clearAllMocks();
    axiosInstance.post.mockResolvedValue({});
    axiosInstance.get.mockResolvedValue({ data: { preview_url: "https://cdnt-preview.dzcdn.net/a.mp3", provider: "deezer" } });
    vi.stubGlobal(
      "Audio",
      vi.fn(() => {
        audio = { play: vi.fn(() => Promise.resolve()), pause: vi.fn(), currentTime: 0, duration: 30 };
        return audio;
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const start = async (auth = signedIn) => {
    renderWithProviders(<AlbumPreviewButton artistId={42} albumName="Channel Orange" />, { preloadedState: { auth } });
    fireEvent.click(screen.getByRole("button", { name: /preview album/i }));
    await screen.findByRole("button", { name: /stop preview/i });
  };

  const tick = (seconds) =>
    act(() => {
      audio.currentTime = seconds;
      audio.ontimeupdate();
    });

  it("reports once after 10 seconds, with the source", async () => {
    await start();
    tick(5);
    tick(11);
    tick(20);
    expect(plays()).toEqual([["/plays", { artist_id: 42, album_id: undefined, source: "deezer" }]]);
  });

  it("never reports for a signed-out listener", async () => {
    await start(signedOut);
    tick(20);
    expect(plays()).toHaveLength(0);
  });
});
