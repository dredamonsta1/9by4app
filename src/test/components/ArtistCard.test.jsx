import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ArtistCard from "../../components/ArtistCard";

// Mock CSS module
vi.mock("../../components/ArtistCard.module.css", () => ({
  default: {
    artistCard: "artistCard",
    artistHeader: "artistHeader",
    artistHeaderH3: "artistHeaderH3",
    artistHeaderP: "artistHeaderP",
    artistImage: "artistImage",
    cloutItem: "cloutItem",
  },
}));

// Note: The component has a bug - it uses `style.artistHeaderP` instead of `styles.artistHeaderP`
// Skipping tests until the component is fixed

describe("ArtistCard Component", () => {
  const mockArtist = {
    name: "Test Artist",
    genre: "Hip Hop",
    image_url: "/uploads/artist.jpg",
    count: 150,
  };

  describe("Rendering", () => {
    it("renders artist name", () => {
      render(<ArtistCard artist={mockArtist} />);

      expect(screen.getByText("Test Artist")).toBeInTheDocument();
    });

    it("renders artist genre", () => {
      render(<ArtistCard artist={mockArtist} />);

      expect(screen.getByText(/genre: hip hop/i)).toBeInTheDocument();
    });

    it("renders clout count", () => {
      render(<ArtistCard artist={mockArtist} />);

      expect(screen.getByText(/clout:/i)).toBeInTheDocument();
      expect(screen.getByText("150")).toBeInTheDocument();
    });
  });

  describe("Image Handling", () => {
    it("renders image with correct src when image_url exists", () => {
      render(<ArtistCard artist={mockArtist} />);

      const image = screen.getByRole("img");
      expect(image).toHaveAttribute(
        "src",
        "https://ninebyfourapi.herokuapp.com/uploads/artist.jpg"
      );
    });

    it("renders image with alt text", () => {
      render(<ArtistCard artist={mockArtist} />);

      const image = screen.getByRole("img");
      expect(image).toHaveAttribute("alt", "Test Artist");
    });

    it("uses placeholder when no image_url", () => {
      const artistWithoutImage = { ...mockArtist, image_url: null };
      render(<ArtistCard artist={artistWithoutImage} />);

      const image = screen.getByRole("img");
      expect(image.src).toContain("placeholder");
    });
  });

  describe("Missing Data Handling", () => {
    it("renders with missing name", () => {
      const artistWithoutName = { ...mockArtist, name: null };
      render(<ArtistCard artist={artistWithoutName} />);

      const image = screen.getByRole("img");
      expect(image).toHaveAttribute("alt", "Artist Image");
    });

    it("renders with zero clout count", () => {
      const artistWithZeroClout = { ...mockArtist, count: 0 };
      render(<ArtistCard artist={artistWithZeroClout} />);

      expect(screen.getByText("0")).toBeInTheDocument();
    });
  });

  describe("Structure", () => {
    it("renders with correct card structure", () => {
      const { container } = render(<ArtistCard artist={mockArtist} />);

      expect(container.querySelector(".artistCard")).toBeInTheDocument();
    });

    it("renders header section", () => {
      const { container } = render(<ArtistCard artist={mockArtist} />);

      expect(container.querySelector(".artistHeader")).toBeInTheDocument();
    });

    it("uses heading for artist name", () => {
      render(<ArtistCard artist={mockArtist} />);

      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading).toHaveTextContent("Test Artist");
    });
  });
});
