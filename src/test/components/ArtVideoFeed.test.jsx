// ArtVideoFeed now fetches two endpoints (combined-video-feed +
// music-videos) via Promise.allSettled, so a single rejected
// promise doesn't trip the error state. The previous test suite
// targeted the older single-fetch shape and broke when the merge
// logic was added.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import ArtVideoFeed from "../../components/ArtVideoFeed/ArtVideoFeed";

vi.mock("../../utils/axiosInstance", () => ({
  default: { get: vi.fn() },
}));

vi.mock("../../components/ArtVideoFeed/ArtVideoFeed.module.css", () => ({
  default: new Proxy({}, { get: (_, key) => key }),
}));

import axiosInstance from "../../utils/axiosInstance";

// Make axios mock route based on URL so tests don't need to know
// which endpoint resolves first.
const mockEndpoints = ({ combined = [], musicVideos = [] } = {}) => {
  axiosInstance.get.mockImplementation((url) => {
    if (url === "/art/combined-video-feed") {
      return Promise.resolve({ data: combined });
    }
    if (url === "/art/music-videos") {
      return Promise.resolve({ data: musicVideos });
    }
    return Promise.reject(new Error(`unmocked: ${url}`));
  });
};

describe("ArtVideoFeed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Loading State", () => {
    it("shows the loading message while fetching", () => {
      axiosInstance.get.mockImplementation(() => new Promise(() => {}));
      render(<ArtVideoFeed />);
      expect(screen.getByText(/loading video feed/i)).toBeInTheDocument();
    });
  });

  describe("Success State", () => {
    const combined = [
      {
        id: 1,
        video_url: "video1",
        caption: "Art Documentary 1",
        video_type: "youtube",
        source: "youtube_playlist",
        created_at: "2026-06-20T00:00:00Z",
      },
      {
        id: 2,
        video_url: "video2",
        caption: "Art Documentary 2",
        video_type: "youtube",
        source: "youtube_playlist",
        created_at: "2026-06-19T00:00:00Z",
      },
    ];

    it("renders videos from /art/combined-video-feed", async () => {
      mockEndpoints({ combined });
      render(<ArtVideoFeed />);
      expect(
        await screen.findByText("Art Documentary 1"),
      ).toBeInTheDocument();
      expect(screen.getByText("Art Documentary 2")).toBeInTheDocument();
    });

    it("fetches both endpoints on mount", async () => {
      mockEndpoints({ combined: [] });
      render(<ArtVideoFeed />);
      await waitFor(() => {
        expect(axiosInstance.get).toHaveBeenCalledWith(
          "/art/combined-video-feed",
        );
        expect(axiosInstance.get).toHaveBeenCalledWith("/art/music-videos");
      });
    });

    it("merges music-videos and sorts everything by created_at desc", async () => {
      mockEndpoints({
        combined: [
          {
            id: 10,
            video_url: "older",
            caption: "Older Art",
            video_type: "youtube",
            source: "youtube_playlist",
            created_at: "2026-06-01T00:00:00Z",
          },
        ],
        musicVideos: [
          {
            videoId: "mv1",
            title: "Newest Music Video",
            thumbnail: "thumb.jpg",
            publishedAt: "2026-06-22T00:00:00Z",
            artist: "Drake",
          },
        ],
      });
      render(<ArtVideoFeed />);
      const headings = await screen.findAllByRole("heading", { level: 3 });
      expect(headings[0]).toHaveTextContent("Newest Music Video");
      expect(headings[1]).toHaveTextContent("Older Art");
    });

    it("renders the iframe with the embed URL", async () => {
      mockEndpoints({ combined });
      render(<ArtVideoFeed />);
      const iframe = await screen.findByTitle("Art Documentary 1");
      expect(iframe).toHaveAttribute(
        "src",
        "https://www.youtube.com/embed/video1?autoplay=1&mute=1&loop=1&playlist=video1",
      );
    });
  });

  describe("Edge cases", () => {
    it("renders nothing when both endpoints return empty", async () => {
      mockEndpoints({ combined: [], musicVideos: [] });
      const { container } = render(<ArtVideoFeed />);
      await waitFor(() => {
        expect(
          screen.queryByText(/loading video feed/i),
        ).not.toBeInTheDocument();
      });
      expect(
        container.querySelectorAll("[class*=videoSlide]"),
      ).toHaveLength(0);
    });

    it("uses 'Video' as the iframe title when caption is null", async () => {
      mockEndpoints({
        combined: [
          {
            id: 99,
            video_url: "x",
            caption: null,
            video_type: "youtube",
            source: "youtube_playlist",
            created_at: "2026-06-22T00:00:00Z",
          },
        ],
      });
      render(<ArtVideoFeed />);
      expect(await screen.findByTitle("Video")).toBeInTheDocument();
    });

    it("falls back to an empty feed if combined-video-feed rejects", async () => {
      axiosInstance.get.mockImplementation((url) => {
        if (url === "/art/combined-video-feed") {
          return Promise.reject(new Error("server 500"));
        }
        return Promise.resolve({ data: [] });
      });
      const { container } = render(<ArtVideoFeed />);
      await waitFor(() =>
        expect(
          screen.queryByText(/loading video feed/i),
        ).not.toBeInTheDocument(),
      );
      // Promise.allSettled means a single failed endpoint doesn't
      // flip the whole component to the error path.
      expect(
        container.querySelectorAll("[class*=videoSlide]"),
      ).toHaveLength(0);
    });
  });
});
