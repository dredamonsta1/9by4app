import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import ArtVideoFeed from "../../components/ArtVideoFeed/ArtVideoFeed";

// Mock axiosInstance
vi.mock("../../utils/axiosInstance", () => ({
  default: {
    get: vi.fn(),
  },
}));

// Mock NavBar component
vi.mock("../../components/NavBar/NavBar", () => ({
  default: () => <div data-testid="navbar">NavBar</div>,
}));

// Mock CSS module
vi.mock("../../components/ArtVideoFeed/ArtVideoFeed.module.css", () => ({
  default: {
    container: "container",
    videoFeedContainer: "videoFeedContainer",
    videoSlide: "videoSlide",
    videoPlayer: "videoPlayer",
    videoOverlay: "videoOverlay",
  },
}));

import axiosInstance from "../../utils/axiosInstance";

describe("ArtVideoFeed Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Loading State", () => {
    it("displays loading message while fetching videos", () => {
      axiosInstance.get.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<ArtVideoFeed />);

      expect(screen.getByText("Loading art feed...")).toBeInTheDocument();
    });

    it("renders NavBar even while loading", () => {
      axiosInstance.get.mockImplementation(() => new Promise(() => {}));

      render(<ArtVideoFeed />);

      expect(screen.getByTestId("navbar")).toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    it("displays error message when API call fails", async () => {
      axiosInstance.get.mockRejectedValue(new Error("Network error"));

      render(<ArtVideoFeed />);

      await waitFor(() => {
        expect(
          screen.getByText("Failed to load video feed.")
        ).toBeInTheDocument();
      });
    });

    it("displays error in red color", async () => {
      axiosInstance.get.mockRejectedValue(new Error("Network error"));

      render(<ArtVideoFeed />);

      const errorElement = await screen.findByText(
        "Failed to load video feed."
      );
      expect(errorElement).toHaveStyle({ color: "red" });
    });

    it("logs error to console", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const error = new Error("API Error");
      axiosInstance.get.mockRejectedValue(error);

      render(<ArtVideoFeed />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(error);
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Success State", () => {
    const mockVideos = [
      {
        videoId: "video1",
        title: "Art Documentary 1",
        thumbnail: "https://example.com/thumb1.jpg",
      },
      {
        videoId: "video2",
        title: "Art Documentary 2",
        thumbnail: "https://example.com/thumb2.jpg",
      },
      {
        videoId: "video3",
        title: "Art Documentary 3",
        thumbnail: "https://example.com/thumb3.jpg",
      },
    ];

    it("renders videos after successful API call", async () => {
      axiosInstance.get.mockResolvedValue({ data: mockVideos });

      render(<ArtVideoFeed />);

      await waitFor(() => {
        expect(screen.getByText("Art Documentary 1")).toBeInTheDocument();
        expect(screen.getByText("Art Documentary 2")).toBeInTheDocument();
        expect(screen.getByText("Art Documentary 3")).toBeInTheDocument();
      });
    });

    it("calls the correct API endpoint", async () => {
      axiosInstance.get.mockResolvedValue({ data: mockVideos });

      render(<ArtVideoFeed />);

      await waitFor(() => {
        expect(axiosInstance.get).toHaveBeenCalledWith("/art/youtube-feed");
      });
    });

    it("calls API only once on mount", async () => {
      axiosInstance.get.mockResolvedValue({ data: mockVideos });

      render(<ArtVideoFeed />);

      await waitFor(() => {
        expect(axiosInstance.get).toHaveBeenCalledTimes(1);
      });
    });

    it("renders video iframes with correct src", async () => {
      axiosInstance.get.mockResolvedValue({ data: mockVideos });

      render(<ArtVideoFeed />);

      await waitFor(() => {
        const iframes = screen.getAllByTitle(/Art Documentary/);
        expect(iframes).toHaveLength(3);
        expect(iframes[0]).toHaveAttribute(
          "src",
          "https://www.youtube.com/embed/video1?autoplay=1&mute=1&loop=1&playlist=video1"
        );
      });
    });

    it("renders iframe with correct attributes", async () => {
      axiosInstance.get.mockResolvedValue({ data: mockVideos });

      render(<ArtVideoFeed />);

      const iframe = await screen.findByTitle("Art Documentary 1");

      expect(iframe).toHaveAttribute("width", "100%");
      expect(iframe).toHaveAttribute("height", "100%");
      expect(iframe).toHaveAttribute("frameBorder", "0");
      expect(iframe).toHaveAttribute("allowFullScreen");
      expect(iframe).toHaveAttribute(
        "allow",
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      );
    });

    it("renders all video titles in overlay", async () => {
      axiosInstance.get.mockResolvedValue({ data: mockVideos });

      render(<ArtVideoFeed />);

      await waitFor(() => {
        mockVideos.forEach((video) => {
          expect(screen.getByText(video.title)).toBeInTheDocument();
        });
      });
    });

    it("renders videos in correct order", async () => {
      axiosInstance.get.mockResolvedValue({ data: mockVideos });

      render(<ArtVideoFeed />);

      await waitFor(() => {
        const titles = screen.getAllByRole("heading", { level: 3 });
        expect(titles[0]).toHaveTextContent("Art Documentary 1");
        expect(titles[1]).toHaveTextContent("Art Documentary 2");
        expect(titles[2]).toHaveTextContent("Art Documentary 3");
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles empty video array", async () => {
      axiosInstance.get.mockResolvedValue({ data: [] });

      render(<ArtVideoFeed />);

      await waitFor(() => {
        expect(screen.queryByText(/Art Documentary/)).not.toBeInTheDocument();
      });

      // Should still render NavBar
      expect(screen.getByTestId("navbar")).toBeInTheDocument();
    });

    it("handles single video", async () => {
      const singleVideo = [
        {
          videoId: "solo",
          title: "Solo Documentary",
          thumbnail: "https://example.com/solo.jpg",
        },
      ];

      axiosInstance.get.mockResolvedValue({ data: singleVideo });

      render(<ArtVideoFeed />);

      await waitFor(() => {
        expect(screen.getByText("Solo Documentary")).toBeInTheDocument();
      });

      const iframes = screen.getAllByTitle(/Documentary/);
      expect(iframes).toHaveLength(1);
    });

    it("handles videos with long titles", async () => {
      const longTitleVideos = [
        {
          videoId: "long1",
          title: "A".repeat(200),
          thumbnail: "https://example.com/long.jpg",
        },
      ];

      axiosInstance.get.mockResolvedValue({ data: longTitleVideos });

      render(<ArtVideoFeed />);

      await waitFor(() => {
        expect(screen.getByText("A".repeat(200))).toBeInTheDocument();
      });
    });

    it("handles videos with special characters in title", async () => {
      const specialVideos = [
        {
          videoId: "special",
          title: 'Art & Culture: "Modern" <Renaissance> 2024 🎨',
          thumbnail: "https://example.com/special.jpg",
        },
      ];

      axiosInstance.get.mockResolvedValue({ data: specialVideos });

      render(<ArtVideoFeed />);

      await waitFor(() => {
        expect(
          screen.getByText('Art & Culture: "Modern" <Renaissance> 2024 🎨')
        ).toBeInTheDocument();
      });
    });

    it("handles videos with missing thumbnail", async () => {
      const noThumbVideos = [
        {
          videoId: "nothumb",
          title: "No Thumbnail Video",
          thumbnail: null,
        },
      ];

      axiosInstance.get.mockResolvedValue({ data: noThumbVideos });

      render(<ArtVideoFeed />);

      await waitFor(() => {
        expect(screen.getByText("No Thumbnail Video")).toBeInTheDocument();
      });
    });
  });

  describe("Component Structure", () => {
    it("renders NavBar component", async () => {
      axiosInstance.get.mockResolvedValue({ data: [] });

      render(<ArtVideoFeed />);

      await waitFor(() => {
        expect(screen.getByTestId("navbar")).toBeInTheDocument();
      });
    });

    it("renders container div", async () => {
      axiosInstance.get.mockResolvedValue({ data: [] });

      const { container } = render(<ArtVideoFeed />);

      await waitFor(() => {
        const containerDiv = container.querySelector(".container");
        expect(containerDiv).toBeInTheDocument();
      });
    });

    it("renders video feed container after loading", async () => {
      const mockVideos = [
        { videoId: "v1", title: "Video 1", thumbnail: "thumb1.jpg" },
      ];

      axiosInstance.get.mockResolvedValue({ data: mockVideos });

      const { container } = render(<ArtVideoFeed />);

      await waitFor(() => {
        const feedContainer = container.querySelector(".videoFeedContainer");
        expect(feedContainer).toBeInTheDocument();
      });
    });
  });

  describe("Video Attributes", () => {
    it("sets autoplay, mute, and loop parameters", async () => {
      const mockVideos = [
        { videoId: "test", title: "Test Video", thumbnail: "test.jpg" },
      ];

      axiosInstance.get.mockResolvedValue({ data: mockVideos });

      render(<ArtVideoFeed />);

      const iframe = await screen.findByTitle("Test Video");
      const src = iframe.getAttribute("src");

      expect(src).toContain("autoplay=1");
      expect(src).toContain("mute=1");
      expect(src).toContain("loop=1");
      expect(src).toContain("playlist=test");
    });

    it("embeds YouTube videos correctly", async () => {
      const mockVideos = [
        { videoId: "abc123", title: "YouTube Video", thumbnail: "thumb.jpg" },
      ];

      axiosInstance.get.mockResolvedValue({ data: mockVideos });

      render(<ArtVideoFeed />);

      const iframe = await screen.findByTitle("YouTube Video");

      expect(iframe.src).toContain("youtube.com/embed/abc123");
    });
  });

  describe("Performance", () => {
    it("does not re-fetch videos on re-render", async () => {
      const mockVideos = [
        { videoId: "v1", title: "Video 1", thumbnail: "thumb1.jpg" },
      ];

      axiosInstance.get.mockResolvedValue({ data: mockVideos });

      const { rerender } = render(<ArtVideoFeed />);

      await waitFor(() => {
        expect(axiosInstance.get).toHaveBeenCalledTimes(1);
      });

      // Rerender the component
      rerender(<ArtVideoFeed />);

      // Should still only have been called once
      expect(axiosInstance.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("Accessibility", () => {
    it("provides title attribute for iframes", async () => {
      const mockVideos = [
        { videoId: "v1", title: "Accessible Video", thumbnail: "thumb.jpg" },
      ];

      axiosInstance.get.mockResolvedValue({ data: mockVideos });

      render(<ArtVideoFeed />);

      const iframe = await screen.findByTitle("Accessible Video");
      expect(iframe).toBeInTheDocument();
    });

    it("renders video titles as headings", async () => {
      const mockVideos = [
        { videoId: "v1", title: "Video Title", thumbnail: "thumb.jpg" },
      ];

      axiosInstance.get.mockResolvedValue({ data: mockVideos });

      render(<ArtVideoFeed />);

      await waitFor(() => {
        const heading = screen.getByRole("heading", { name: "Video Title" });
        expect(heading).toBeInTheDocument();
      });
    });
  });
});
