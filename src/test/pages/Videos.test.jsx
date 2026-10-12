import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../utils";
import Videos from "../../pages/Videos/Videos";
import axiosInstance from "../../utils/axiosInstance";

// The /videos section (Story 31).

vi.mock("../../utils/axiosInstance", () => ({ default: { get: vi.fn(), post: vi.fn() } }));

const signedIn = { auth: { user: { user_id: 1, username: "andrew3" }, isLoggedIn: true } };
const signedOut = { auth: { user: null, isLoggedIn: false } };

const video = (id, overrides = {}) => ({
  id,
  user_id: 2,
  username: "ballad",
  title: `Clip ${id}`,
  caption: null,
  video_url: `https://res.cloudinary.com/x/video/upload/v1/c${id}.webm`,
  playback_url: `https://res.cloudinary.com/x/video/upload/v1/c${id}.mp4`,
  is_music_video: false,
  created_at: "2026-10-11T12:00:00Z",
  ...overrides,
});

const lastParams = () => axiosInstance.get.mock.calls.at(-1)[1].params;

describe("Videos page", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows everyone's videos by default, playing the MP4 URL, never autoplaying", async () => {
    axiosInstance.get.mockResolvedValue({ data: { videos: [video(2, { is_music_video: true }), video(1, { title: null, caption: "just a caption" })], next_before: null } });
    const { container } = renderWithProviders(<Videos />, { preloadedState: signedOut });

    expect(await screen.findByText("Clip 2")).toBeInTheDocument();
    expect(screen.getByText("just a caption")).toBeInTheDocument(); // caption stands in for a missing title
    expect(screen.getByText("Music video")).toBeInTheDocument();
    const players = container.querySelectorAll("video");
    expect(players[0]).toHaveAttribute("src", "https://res.cloudinary.com/x/video/upload/v1/c2.mp4");
    expect(players[0]).not.toHaveAttribute("autoplay");
    expect(players[0]).toHaveAttribute("playsinline");
    expect(axiosInstance.get).toHaveBeenCalledWith("/videos", { params: { tab: "all", type: undefined, before: undefined } });
  });

  it("Following asks a signed-out visitor to log in, without a request", async () => {
    axiosInstance.get.mockResolvedValue({ data: { videos: [], next_before: null } });
    renderWithProviders(<Videos />, { preloadedState: signedOut });
    await screen.findByText(/no videos yet/i);
    axiosInstance.get.mockClear();

    fireEvent.click(screen.getByRole("tab", { name: "Following" }));

    expect(screen.getByRole("link", { name: /log in/i })).toBeInTheDocument();
    expect(axiosInstance.get).not.toHaveBeenCalled();
  });

  it("Following loads the people you follow when signed in", async () => {
    axiosInstance.get.mockResolvedValue({ data: { videos: [], next_before: null } });
    renderWithProviders(<Videos />, { preloadedState: signedIn });
    await screen.findByText(/no videos yet/i);

    fireEvent.click(screen.getByRole("tab", { name: "Following" }));

    await waitFor(() => expect(lastParams().tab).toBe("following"));
    expect(await screen.findByText(/no videos from people you follow yet/i)).toBeInTheDocument();
  });

  it("the Music videos filter asks for music only", async () => {
    axiosInstance.get.mockResolvedValue({ data: { videos: [], next_before: null } });
    renderWithProviders(<Videos />, { preloadedState: signedOut });
    await screen.findByText(/no videos yet/i);

    fireEvent.click(screen.getByRole("button", { name: "Music videos" }));

    await waitFor(() => expect(lastParams().type).toBe("music"));
    expect(await screen.findByText(/no music videos yet/i)).toBeInTheDocument();
  });

  it("Load more appends the next page using the cursor", async () => {
    axiosInstance.get
      .mockResolvedValueOnce({ data: { videos: [video(9), video(8)], next_before: 8 } })
      .mockResolvedValueOnce({ data: { videos: [video(7)], next_before: null } });
    renderWithProviders(<Videos />, { preloadedState: signedOut });

    fireEvent.click(await screen.findByRole("button", { name: "Load more" }));

    expect(await screen.findByText("Clip 7")).toBeInTheDocument();
    expect(lastParams().before).toBe(8);
    expect(screen.getByText("Clip 9")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Load more" })).toBeNull();
  });

  it("invites a signed-in fan to post the first video when empty", async () => {
    axiosInstance.get.mockResolvedValue({ data: { videos: [], next_before: null } });
    renderWithProviders(<Videos />, { preloadedState: signedIn });
    expect(await screen.findByRole("button", { name: /post the first one/i })).toBeInTheDocument();
  });

  it("asks a guest to join to post, instead of an upload button", async () => {
    axiosInstance.get.mockResolvedValue({ data: { videos: [], next_before: null } });
    renderWithProviders(<Videos />, { preloadedState: signedOut });
    expect(await screen.findByRole("link", { name: /join stanbox/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /post/i })).toBeNull();
  });

  it("shows an error state", async () => {
    axiosInstance.get.mockRejectedValue(new Error("500"));
    renderWithProviders(<Videos />, { preloadedState: signedOut });
    expect(await screen.findByText(/couldn't load videos/i)).toBeInTheDocument();
  });
});
