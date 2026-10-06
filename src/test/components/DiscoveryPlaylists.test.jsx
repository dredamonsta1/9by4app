import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, within } from "@testing-library/react";
import { renderWithProviders } from "../utils";
import DiscoveryPlaylists from "../../components/DiscoveryPlaylists/DiscoveryPlaylists";
import axiosInstance from "../../utils/axiosInstance";

vi.mock("../../utils/axiosInstance", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

const track = (n, overrides = {}) => ({
  position: n,
  artist_id: 100 + n,
  artist_name: `Artist ${n}`,
  image_url: `https://img/${n}.jpg`,
  album_id: 200 + n,
  title: `Song ${n}`,
  preview_url: `https://audio-ssl.itunes.apple.com/${n}.m4a`,
  listen_url: `https://music.apple.com/${n}`,
  source: "apple",
  reason: `Shares the warmth of SZA`,
  indie: false,
  ...overrides,
});

const playlist = {
  playlist_id: 1,
  title: "Smooth R&B Grooves",
  blurb: "Soulful voices and atmospheric production.",
  tracks: [track(1), track(2, { indie: true, artist_name: "Maeta" }), track(3)],
};

const signedIn = { auth: { user: { user_id: 1 }, isLoggedIn: true } };
const load = (data) => axiosInstance.get.mockResolvedValue({ data });

describe("DiscoveryPlaylists", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows a building state while the server builds them", () => {
    axiosInstance.get.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<DiscoveryPlaylists />, { preloadedState: signedIn });
    expect(screen.getByText(/building your playlists/i)).toBeInTheDocument();
  });

  it("renders each playlist with its blurb and small-artist count", async () => {
    load({ status: "ready", playlists: [playlist] });
    renderWithProviders(<DiscoveryPlaylists />, { preloadedState: signedIn });

    expect(await screen.findByText("Smooth R&B Grooves")).toBeInTheDocument();
    expect(screen.getByText(/soulful voices/i)).toBeInTheDocument();
    expect(screen.getByText("3 tracks · 1 under the radar")).toBeInTheDocument();
    expect(axiosInstance.get).toHaveBeenCalledWith("/playlists/me");
  });

  it("Play queues the whole playlist, tagged so plays get counted", async () => {
    load({ status: "ready", playlists: [playlist] });
    const { store } = renderWithProviders(<DiscoveryPlaylists />, { preloadedState: signedIn });

    fireEvent.click(await screen.findByRole("button", { name: /▶ play/i }));

    const { queue, currentIndex, isPlaying } = store.getState().player;
    expect(queue).toHaveLength(3);
    expect(currentIndex).toBe(0);
    expect(isPlaying).toBe(true);
    expect(queue[1]).toMatchObject({
      artist_id: 102,
      source: "apple",
      audio_url: "https://audio-ssl.itunes.apple.com/2.m4a",
      listen_url: "https://music.apple.com/2",
      title: "Song 2 · preview",
      artist_name: "Maeta",
    });
  });

  it("lists tracks with reasons and marks small artists", async () => {
    load({ status: "ready", playlists: [playlist] });
    renderWithProviders(<DiscoveryPlaylists />, { preloadedState: signedIn });

    fireEvent.click(await screen.findByRole("button", { name: "Tracks" }));

    const maeta = screen.getByRole("button", { name: "Play Song 2 by Maeta" });
    expect(within(maeta).getByText("Under the radar")).toBeInTheDocument();
    expect(within(maeta).getByText("Shares the warmth of SZA")).toBeInTheDocument();
    expect(within(screen.getByRole("button", { name: "Play Song 1 by Artist 1" })).queryByText("Under the radar")).toBeNull();
  });

  it("tapping a track starts the playlist there", async () => {
    load({ status: "ready", playlists: [playlist] });
    const { store } = renderWithProviders(<DiscoveryPlaylists />, { preloadedState: signedIn });

    fireEvent.click(await screen.findByRole("button", { name: "Tracks" }));
    fireEvent.click(screen.getByRole("button", { name: "Play Song 3 by Artist 3" }));

    expect(store.getState().player.currentIndex).toBe(2);
    expect(screen.getByRole("button", { name: "Play Song 3 by Artist 3" })).toHaveAttribute("aria-current", "true");
  });

  it("says how many more Top 20 artists are needed", async () => {
    load({ status: "needs_seeds", playlists: [], seeds_needed: 2 });
    renderWithProviders(<DiscoveryPlaylists />, { preloadedState: signedIn });
    expect(await screen.findByText(/add 2 more artists to your top 20/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /refresh/i })).toBeNull();
  });

  it("explains when nothing is playable yet", async () => {
    load({ status: "no_playable", playlists: [] });
    renderWithProviders(<DiscoveryPlaylists />, { preloadedState: signedIn });
    expect(await screen.findByText(/check back tomorrow/i)).toBeInTheDocument();
  });

  it("shows an error state when loading fails", async () => {
    axiosInstance.get.mockRejectedValue(new Error("500"));
    renderWithProviders(<DiscoveryPlaylists />, { preloadedState: signedIn });
    expect(await screen.findByText(/couldn't load your playlists/i)).toBeInTheDocument();
  });

  it("refresh replaces the playlists", async () => {
    load({ status: "ready", playlists: [playlist] });
    axiosInstance.post.mockResolvedValue({ data: { status: "ready", playlists: [{ ...playlist, playlist_id: 2, title: "Late Night Soul" }] } });
    renderWithProviders(<DiscoveryPlaylists />, { preloadedState: signedIn });

    fireEvent.click(await screen.findByRole("button", { name: "Refresh" }));

    expect(await screen.findByText("Late Night Soul")).toBeInTheDocument();
    expect(axiosInstance.post).toHaveBeenCalledWith("/playlists/me/refresh");
  });

  it("explains the cooldown when refreshed too soon", async () => {
    load({ status: "ready", playlists: [playlist] });
    axiosInstance.post.mockRejectedValue({ response: { status: 429, data: { retry_after_minutes: 42 } } });
    renderWithProviders(<DiscoveryPlaylists />, { preloadedState: signedIn });

    fireEvent.click(await screen.findByRole("button", { name: "Refresh" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Fresh playlists in 42 min.");
    expect(screen.getByText("Smooth R&B Grooves")).toBeInTheDocument();
  });
});
