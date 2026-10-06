import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, within } from "@testing-library/react";
import { renderWithProviders } from "../utils";
import AlbumSongList from "../../components/AlbumSongList/AlbumSongList";
import axiosInstance from "../../utils/axiosInstance";

vi.mock("../../utils/axiosInstance", () => ({
  default: { get: vi.fn() },
}));

const album = { album_id: 7, album_name: "Channel Orange", album_image_url: "https://cdn/co.jpg" };
const artist = { artist_id: 1, artist_name: "Frank Ocean" };

const appleSamples = {
  album_id: 7,
  provider: "apple",
  album_listen_url: "https://music.apple.com/album/co",
  tracks: [
    { position: 1, title: "Start", duration_seconds: 45, preview_url: "https://a/1.m4a", listen_url: "https://music.apple.com/1" },
    { position: 2, title: "Thinkin Bout You", duration_seconds: 200, preview_url: "https://a/2.m4a", listen_url: "https://music.apple.com/2" },
    { position: 3, title: "Fertilizer", duration_seconds: 39, preview_url: "https://a/3.m4a", listen_url: "https://music.apple.com/3" },
  ],
};

const openList = async (data = appleSamples) => {
  axiosInstance.get.mockResolvedValue({ data });
  const utils = renderWithProviders(<AlbumSongList album={album} artist={artist} />);
  fireEvent.click(screen.getByRole("button", { name: /songs/i }));
  return utils;
};

describe("AlbumSongList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("is closed by default and fetches nothing until opened", () => {
    renderWithProviders(<AlbumSongList album={album} artist={artist} />);

    expect(screen.getByRole("button", { name: /songs/i })).toHaveAttribute("aria-expanded", "false");
    expect(axiosInstance.get).not.toHaveBeenCalled();
  });

  it("opens to every song, in order, with durations", async () => {
    await openList();

    expect(screen.getByRole("button", { name: /songs/i })).toHaveAttribute("aria-expanded", "true");
    expect(axiosInstance.get).toHaveBeenCalledWith("/albums/7/samples");
    const songs = await screen.findAllByRole("button", { name: /play preview of/i });
    expect(songs.map((b) => b.getAttribute("aria-label"))).toEqual([
      "Play preview of Start",
      "Play preview of Thinkin Bout You",
      "Play preview of Fertilizer",
    ]);
    expect(within(songs[1]).getByText("3:20")).toBeInTheDocument();
  });

  it("tapping a song queues the whole album from that song, so ⏭ plays the rest", async () => {
    const { store } = await openList();

    fireEvent.click(await screen.findByRole("button", { name: "Play preview of Thinkin Bout You" }));

    const { queue, currentIndex, isPlaying } = store.getState().player;
    expect(queue.map((t) => t.audio_url)).toEqual(["https://a/1.m4a", "https://a/2.m4a", "https://a/3.m4a"]);
    expect(currentIndex).toBe(1);
    expect(isPlaying).toBe(true);
    expect(queue[1]).toMatchObject({
      album_id: 7,
      title: "Thinkin Bout You · preview",
      artist_name: "Frank Ocean",
      album_image_url: "https://cdn/co.jpg",
      listen_url: "https://music.apple.com/2",
      artist_id: 1,
      source: "apple",
    });
  });

  it("Play all starts from the first song", async () => {
    const { store } = await openList();

    fireEvent.click(await screen.findByRole("button", { name: /play all/i }));

    expect(store.getState().player.currentIndex).toBe(0);
    expect(store.getState().player.queue).toHaveLength(3);
  });

  it("marks the song that's playing", async () => {
    await openList();
    fireEvent.click(await screen.findByRole("button", { name: "Play preview of Fertilizer" }));

    expect(screen.getByRole("button", { name: "Play preview of Fertilizer" })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("button", { name: "Play preview of Start" })).not.toHaveAttribute("aria-current");
  });

  it("links the album on Apple Music for Apple samples only", async () => {
    await openList();
    expect(await screen.findByRole("link", { name: /apple music/i })).toHaveAttribute("href", "https://music.apple.com/album/co");
  });

  it("shows no Apple link for Deezer samples", async () => {
    await openList({ ...appleSamples, provider: "deezer", album_listen_url: null });
    await screen.findByRole("button", { name: /play all/i });
    expect(screen.queryByRole("link", { name: /apple music/i })).not.toBeInTheDocument();
  });

  it("shows an empty state when there are no samples", async () => {
    await openList({ album_id: 7, provider: "none", album_listen_url: null, tracks: [] });
    expect(await screen.findByText(/no samples available/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /play all/i })).not.toBeInTheDocument();
  });

  it("shows an error with a retry that refetches", async () => {
    axiosInstance.get.mockRejectedValueOnce(new Error("502"));
    renderWithProviders(<AlbumSongList album={album} artist={artist} />);
    fireEvent.click(screen.getByRole("button", { name: /songs/i }));

    expect(await screen.findByText(/couldn't load songs/i)).toBeInTheDocument();

    axiosInstance.get.mockResolvedValueOnce({ data: appleSamples });
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(await screen.findByRole("button", { name: /play all/i })).toBeInTheDocument();
    expect(axiosInstance.get).toHaveBeenCalledTimes(2);
  });

  it("only fetches once across close and reopen", async () => {
    await openList();
    await screen.findByRole("button", { name: /play all/i });
    const toggle = screen.getByRole("button", { name: /songs/i });

    fireEvent.click(toggle);
    fireEvent.click(toggle);

    expect(axiosInstance.get).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: /play all/i })).toBeInTheDocument();
  });
});
