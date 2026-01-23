import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import ClickableList from "../../components/RapperList";

// Mock CSS
vi.mock("../../components/RapperList.css", () => ({}));

// Mock incrementClout action
vi.mock("../../redux/actions/artistActions", () => ({
  incrementClout: vi.fn((artistId) => ({
    type: "INCREMENT_CLOUT",
    payload: artistId,
  })),
}));

import { incrementClout } from "../../redux/actions/artistActions";

const createMockStore = () => {
  return configureStore({
    reducer: {
      artists: () => ({ artists: [], loading: false }),
    },
  });
};

const renderRapperList = (props = {}) => {
  const store = createMockStore();
  const defaultProps = {
    artists: [],
    showAdminActions: false,
    showCloutButton: false,
    ...props,
  };

  return render(
    <Provider store={store}>
      <ClickableList {...defaultProps} />
    </Provider>
  );
};

describe("RapperList Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Loading State", () => {
    it("shows loading message when artists is null", () => {
      renderRapperList({ artists: null });

      expect(screen.getByText(/loading artists/i)).toBeInTheDocument();
    });

    it("shows loading message when artists is undefined", () => {
      renderRapperList({ artists: undefined });

      expect(screen.getByText(/loading artists/i)).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("shows empty message when no artists", () => {
      renderRapperList({ artists: [] });

      expect(screen.getByText(/no artists found/i)).toBeInTheDocument();
    });
  });

  describe("Artists Display", () => {
    const mockArtists = [
      {
        artist_id: 1,
        name: "Artist One",
        genre: "Hip Hop",
        count: 100,
        image_url: "/uploads/artist1.jpg",
      },
      {
        artist_id: 2,
        name: "Artist Two",
        genre: "R&B",
        count: 50,
        image_url: null,
      },
    ];

    it("renders artist names", () => {
      renderRapperList({ artists: mockArtists });

      expect(screen.getByText("Artist One")).toBeInTheDocument();
      expect(screen.getByText("Artist Two")).toBeInTheDocument();
    });

    it("renders artist genres", () => {
      renderRapperList({ artists: mockArtists });

      expect(screen.getByText(/hip hop/i)).toBeInTheDocument();
      expect(screen.getByText(/r&b/i)).toBeInTheDocument();
    });

    it("renders images for artists with image_url", () => {
      renderRapperList({ artists: mockArtists });

      const images = screen.getAllByRole("img");
      expect(images.length).toBe(1);
      expect(images[0]).toHaveAttribute(
        "src",
        "https://ninebyfourapi.herokuapp.com/uploads/artist1.jpg"
      );
    });

    it("handles missing name gracefully", () => {
      const artistsWithMissingData = [
        { artist_id: 1, name: null, genre: "Rock", count: 10, image_url: null },
      ];

      renderRapperList({ artists: artistsWithMissingData });

      expect(screen.getByText("N/A")).toBeInTheDocument();
    });

    it("handles missing genre gracefully", () => {
      const artistsWithMissingData = [
        { artist_id: 1, name: "Artist", genre: null, count: 10, image_url: null },
      ];

      renderRapperList({ artists: artistsWithMissingData });

      expect(screen.getByText(/genre: n\/a/i)).toBeInTheDocument();
    });
  });

  describe("Clout Display", () => {
    const mockArtists = [
      { artist_id: 1, name: "Artist", genre: "Rock", count: 100, image_url: null },
    ];

    it("shows clout count as text when showCloutButton is false", () => {
      renderRapperList({ artists: mockArtists, showCloutButton: false });

      expect(screen.getByText(/clout:/i)).toBeInTheDocument();
      expect(screen.getByText("100")).toBeInTheDocument();
    });

    it("shows clout button when showCloutButton is true", () => {
      renderRapperList({ artists: mockArtists, showCloutButton: true });

      expect(screen.getByRole("button", { name: /clout: 100/i })).toBeInTheDocument();
    });

    it("dispatches incrementClout when clout button clicked", async () => {
      const user = userEvent.setup();
      renderRapperList({ artists: mockArtists, showCloutButton: true });

      await user.click(screen.getByRole("button", { name: /clout: 100/i }));

      expect(incrementClout).toHaveBeenCalledWith(1);
    });
  });

  describe("Admin Actions", () => {
    const mockArtists = [
      { artist_id: 1, name: "Artist", genre: "Rock", count: 100, image_url: null },
    ];

    it("does not show admin buttons when showAdminActions is false", () => {
      renderRapperList({ artists: mockArtists, showAdminActions: false });

      expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /edit/i })).not.toBeInTheDocument();
    });

    it("shows delete and edit buttons when showAdminActions is true", () => {
      renderRapperList({ artists: mockArtists, showAdminActions: true });

      expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    });

    it("shows confirmation dialog when delete clicked", async () => {
      const user = userEvent.setup();
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

      renderRapperList({ artists: mockArtists, showAdminActions: true });

      await user.click(screen.getByRole("button", { name: /delete/i }));

      expect(confirmSpy).toHaveBeenCalled();
    });

    it("shows alert when edit clicked", async () => {
      const user = userEvent.setup();
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

      renderRapperList({ artists: mockArtists, showAdminActions: true });

      await user.click(screen.getByRole("button", { name: /edit/i }));

      expect(alertSpy).toHaveBeenCalledWith("Editing artist with ID: 1");
    });
  });

  describe("Multiple Artists", () => {
    it("renders all artists in list", () => {
      const mockArtists = [
        { artist_id: 1, name: "Artist 1", genre: "Rock", count: 10, image_url: null },
        { artist_id: 2, name: "Artist 2", genre: "Pop", count: 20, image_url: null },
        { artist_id: 3, name: "Artist 3", genre: "Jazz", count: 30, image_url: null },
      ];

      renderRapperList({ artists: mockArtists });

      expect(screen.getByText("Artist 1")).toBeInTheDocument();
      expect(screen.getByText("Artist 2")).toBeInTheDocument();
      expect(screen.getByText("Artist 3")).toBeInTheDocument();
    });
  });
});
