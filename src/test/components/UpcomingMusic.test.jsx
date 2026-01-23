import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import UpcomingMusic from "../../components/UpcomingMusic/UpcomingMusic";

// Mock axiosInstance
vi.mock("../../utils/axiosInstance", () => ({
  default: {
    get: vi.fn(),
  },
}));

// Mock CSS module
vi.mock("../../components/UpcomingMusic/UpcomingMusic.module.css", () => ({
  default: {
    gridContainer: "gridContainer",
    card: "card",
    shimmer: "shimmer",
    error: "error",
    spotify: "spotify",
    musicbrainz: "musicbrainz",
  },
}));

import axiosInstance from "../../utils/axiosInstance";

describe("UpcomingMusic Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Loading State", () => {
    it("shows loading indicator while fetching", () => {
      axiosInstance.get.mockImplementation(() => new Promise(() => {}));

      render(<UpcomingMusic />);

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    it("displays error message on fetch failure", async () => {
      axiosInstance.get.mockRejectedValue(new Error("Network error"));

      render(<UpcomingMusic />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load music updates/i)).toBeInTheDocument();
      });
    });
  });

  describe("Releases Display", () => {
    const mockReleases = [
      {
        id: 1,
        title: "New Album",
        artist: "Artist One",
        imageUrl: "/image1.jpg",
        source: "Spotify",
      },
      {
        id: 2,
        title: "Another Album",
        artist: "Artist Two",
        imageUrl: null,
        source: "MusicBrainz",
      },
    ];

    it("renders release cards", async () => {
      axiosInstance.get.mockResolvedValue({ data: mockReleases });

      render(<UpcomingMusic />);

      await waitFor(() => {
        expect(screen.getByText("New Album")).toBeInTheDocument();
        expect(screen.getByText("Another Album")).toBeInTheDocument();
      });
    });

    it("renders artist names", async () => {
      axiosInstance.get.mockResolvedValue({ data: mockReleases });

      render(<UpcomingMusic />);

      await waitFor(() => {
        expect(screen.getByText("Artist One")).toBeInTheDocument();
        expect(screen.getByText("Artist Two")).toBeInTheDocument();
      });
    });

    it("renders source tags", async () => {
      axiosInstance.get.mockResolvedValue({ data: mockReleases });

      render(<UpcomingMusic />);

      await waitFor(() => {
        expect(screen.getByText("Spotify")).toBeInTheDocument();
        expect(screen.getByText("MusicBrainz")).toBeInTheDocument();
      });
    });

    it("renders images for releases with imageUrl", async () => {
      axiosInstance.get.mockResolvedValue({ data: mockReleases });

      render(<UpcomingMusic />);

      await waitFor(() => {
        const images = screen.getAllByRole("img");
        expect(images.length).toBe(2);
      });
    });

    it("uses placeholder for missing images", async () => {
      axiosInstance.get.mockResolvedValue({ data: mockReleases });

      render(<UpcomingMusic />);

      await waitFor(() => {
        const images = screen.getAllByRole("img");
        expect(images.some((img) => img.src.includes("placeholder"))).toBe(true);
      });
    });
  });

  describe("API Calls", () => {
    it("fetches music on mount", async () => {
      axiosInstance.get.mockResolvedValue({ data: [] });

      render(<UpcomingMusic />);

      await waitFor(() => {
        expect(axiosInstance.get).toHaveBeenCalledWith("/music/upcoming");
      });
    });

    it("calls API only once on mount", async () => {
      axiosInstance.get.mockResolvedValue({ data: [] });

      render(<UpcomingMusic />);

      await waitFor(() => {
        expect(axiosInstance.get).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Empty State", () => {
    it("renders empty grid when no releases", async () => {
      axiosInstance.get.mockResolvedValue({ data: [] });

      const { container } = render(<UpcomingMusic />);

      await waitFor(() => {
        const grid = container.querySelector(".gridContainer");
        expect(grid).toBeInTheDocument();
      });
    });
  });
});
