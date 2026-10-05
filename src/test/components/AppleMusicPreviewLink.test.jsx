import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../utils";
import PlayerBar from "../../components/PlayerBar/PlayerBar";
import AlbumPreviewButton from "../../components/AlbumPreviewButton/AlbumPreviewButton";
import StanboxPreviewButton from "../../components/StanboxPreviewButton/StanboxPreviewButton";
import axiosInstance from "../../utils/axiosInstance";

// Preview clips from Apple Music come with listen_url, the track's page on
// Apple Music. Showing it is the attribution; it must open in a new tab and
// never replace the in-app clip. Deezer clips have no listen_url and show
// nothing.

vi.mock("../../utils/axiosInstance", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

const APPLE_PREVIEW = "https://audio-ssl.itunes.apple.com/p.m4a";
const APPLE_LISTEN = "https://music.apple.com/us/album/x/1?i=2";

const playerTrack = (overrides = {}) => ({
  album_id: 4836,
  title: "Playing With Fire · preview",
  audio_url: APPLE_PREVIEW,
  artist_name: "Ballad",
  ...overrides,
});

describe("PlayerBar — Apple Music attribution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axiosInstance.get.mockResolvedValue({ data: [] }); // comment markers
  });

  it("links to the track on Apple Music, in a new tab", () => {
    renderWithProviders(<PlayerBar />, {
      preloadedState: { player: { queue: [playerTrack({ listen_url: APPLE_LISTEN })] } },
    });

    const link = screen.getByRole("link", { name: /listen on apple music/i });
    expect(link).toHaveAttribute("href", APPLE_LISTEN);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("shows no link for tracks without one", () => {
    renderWithProviders(<PlayerBar />, {
      preloadedState: { player: { queue: [playerTrack({ audio_url: "https://cdnt-preview.dzcdn.net/a.mp3" })] } },
    });

    expect(screen.queryByRole("link", { name: /apple music/i })).not.toBeInTheDocument();
  });
});

describe("AlbumPreviewButton — Apple Music attribution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      "Audio",
      vi.fn(() => ({ play: vi.fn(() => Promise.resolve()), pause: vi.fn() }))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const play = async (data) => {
    axiosInstance.get.mockResolvedValue({ data });
    renderWithProviders(<AlbumPreviewButton artistId={1} albumName="Playing With Fire" />);
    fireEvent.click(screen.getByRole("button", { name: /preview album/i }));
    await screen.findByRole("button", { name: /stop preview/i });
  };

  it("shows the Apple Music link while an Apple clip plays", async () => {
    await play({ preview_url: APPLE_PREVIEW, listen_url: APPLE_LISTEN, provider: "apple" });

    const link = screen.getByRole("link", { name: /apple music/i });
    expect(link).toHaveAttribute("href", APPLE_LISTEN);
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("shows no link for a Deezer clip", async () => {
    await play({ preview_url: "https://cdnt-preview.dzcdn.net/a.mp3", listen_url: null, provider: "deezer" });

    expect(screen.queryByRole("link", { name: /apple music/i })).not.toBeInTheDocument();
  });
});

describe("StanboxPreviewButton — store-clip fallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("carries listen_url into the player queue when it falls back to an Apple clip", async () => {
    axiosInstance.get.mockImplementation((url) =>
      url.startsWith("/albums/")
        ? Promise.reject({ response: { status: 404 } })
        : Promise.resolve({
            data: { track_name: "Playing With Fire", preview_url: APPLE_PREVIEW, listen_url: APPLE_LISTEN },
          })
    );
    const album = { album_id: 4835, album_name: "Playing With Fire" };
    const artist = { artist_id: 130427, artist_name: "Ballad" };

    const { store } = renderWithProviders(<StanboxPreviewButton album={album} artist={artist} />);
    fireEvent.click(screen.getByRole("button", { name: /preview playing with fire/i }));

    await waitFor(() => expect(store.getState().player.queue).toHaveLength(1));
    expect(store.getState().player.queue[0]).toMatchObject({
      audio_url: APPLE_PREVIEW,
      listen_url: APPLE_LISTEN,
    });
  });
});
