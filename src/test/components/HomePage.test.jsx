import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import HomePage from "../../pages/HomePage";

// Mock CSS module
vi.mock("../../pages/HomePage.module.css", () => ({
  default: {
    homePageContainer: "homePageContainer",
    mainContent: "mainContent",
    homePageHeader: "homePageHeader",
    upcomingMusicSection: "upcomingMusicSection",
  },
}));

// Mock child components
vi.mock("../../components/NavBar/NavBar", () => ({
  default: () => <div data-testid="navbar">NavBar</div>,
}));

vi.mock("../../components/RapperList", () => ({
  default: ({ artists, showAdminActions, showCloutButton }) => (
    <div data-testid="clickable-list">
      <div data-testid="show-admin-actions">{showAdminActions.toString()}</div>
      <div data-testid="show-clout-button">{showCloutButton.toString()}</div>
      {artists.map((artist) => (
        <div key={artist.artist_id} data-testid={`artist-${artist.artist_id}`}>
          {artist.artist_name}
        </div>
      ))}
    </div>
  ),
}));

vi.mock("../../components/UpcomingMusic/UpcomingMusic", () => ({
  default: () => <div data-testid="upcoming-music">UpcomingMusic</div>,
}));

// Mock Redux actions
const mockFetchArtists = vi.fn();
vi.mock("../../redux/actions/artistActions", () => ({
  fetchArtists: () => mockFetchArtists,
}));

// Helper function to render with providers
const renderWithProviders = (
  component,
  { preloadedState = {}, store = null, ...renderOptions } = {}
) => {
  const defaultState = {
    artists: {
      artists: [],
      loading: false,
      error: null,
    },
    auth: {
      user: null,
      token: null,
    },
    ...preloadedState,
  };

  const testStore =
    store ||
    configureStore({
      reducer: {
        artists: (state = defaultState.artists) => state,
        auth: (state = defaultState.auth) => state,
      },
      preloadedState: defaultState,
    });

  const Wrapper = ({ children }) => (
    <Provider store={testStore}>
      <BrowserRouter>{children}</BrowserRouter>
    </Provider>
  );

  return {
    store: testStore,
    ...render(component, { wrapper: Wrapper, ...renderOptions }),
  };
};

describe("HomePage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders without crashing", () => {
      renderWithProviders(<HomePage />);
      expect(screen.getByText("Home Page")).toBeInTheDocument();
    });

    it("renders NavBar component", () => {
      renderWithProviders(<HomePage />);
      expect(screen.getByTestId("navbar")).toBeInTheDocument();
    });

    it('renders "Home Page" heading', () => {
      renderWithProviders(<HomePage />);
      expect(screen.getByText("Home Page")).toBeInTheDocument();
    });

    it('renders "Artists List" heading', () => {
      renderWithProviders(<HomePage />);
      expect(screen.getByText("Artists List")).toBeInTheDocument();
    });

    it("renders UpcomingMusic component", () => {
      renderWithProviders(<HomePage />);
      expect(screen.getByTestId("upcoming-music")).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("displays loading message when loading is true", () => {
      const preloadedState = {
        artists: {
          artists: [],
          loading: true,
          error: null,
        },
      };

      renderWithProviders(<HomePage />, { preloadedState });
      expect(screen.getByText("Loading artists...")).toBeInTheDocument();
    });

    it("does not render ClickableList when loading", () => {
      const preloadedState = {
        artists: {
          artists: [],
          loading: true,
          error: null,
        },
      };

      renderWithProviders(<HomePage />, { preloadedState });
      expect(screen.queryByTestId("clickable-list")).not.toBeInTheDocument();
    });

    it("still renders NavBar when loading", () => {
      const preloadedState = {
        artists: {
          artists: [],
          loading: true,
          error: null,
        },
      };

      renderWithProviders(<HomePage />, { preloadedState });
      expect(screen.getByTestId("navbar")).toBeInTheDocument();
    });

    it("still renders UpcomingMusic when loading", () => {
      const preloadedState = {
        artists: {
          artists: [],
          loading: true,
          error: null,
        },
      };

      renderWithProviders(<HomePage />, { preloadedState });
      expect(screen.getByTestId("upcoming-music")).toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    it("displays error message when error exists", () => {
      const preloadedState = {
        artists: {
          artists: [],
          loading: false,
          error: "Failed to fetch artists",
        },
      };

      renderWithProviders(<HomePage />, { preloadedState });
      expect(
        screen.getByText("Error: Failed to fetch artists")
      ).toBeInTheDocument();
    });

    it("displays error in red color", () => {
      const preloadedState = {
        artists: {
          artists: [],
          loading: false,
          error: "Network error",
        },
      };

      renderWithProviders(<HomePage />, { preloadedState });
      const errorElement = screen.getByText("Error: Network error");
      expect(errorElement).toHaveStyle({ color: "red" });
    });

    it("does not render ClickableList when error exists", () => {
      const preloadedState = {
        artists: {
          artists: [],
          loading: false,
          error: "Error occurred",
        },
      };

      renderWithProviders(<HomePage />, { preloadedState });
      expect(screen.queryByTestId("clickable-list")).not.toBeInTheDocument();
    });

    it("still renders NavBar when error exists", () => {
      const preloadedState = {
        artists: {
          artists: [],
          loading: false,
          error: "Error",
        },
      };

      renderWithProviders(<HomePage />, { preloadedState });
      expect(screen.getByTestId("navbar")).toBeInTheDocument();
    });
  });

  describe("Success State with Artists", () => {
    const mockArtists = [
      {
        artist_id: 1,
        artist_name: "Artist One",
        genre: "Hip Hop",
      },
      {
        artist_id: 2,
        artist_name: "Artist Two",
        genre: "R&B",
      },
      {
        artist_id: 3,
        artist_name: "Artist Three",
        genre: "Pop",
      },
    ];

    it("renders ClickableList when artists are loaded", () => {
      const preloadedState = {
        artists: {
          artists: mockArtists,
          loading: false,
          error: null,
        },
      };

      renderWithProviders(<HomePage />, { preloadedState });
      expect(screen.getByTestId("clickable-list")).toBeInTheDocument();
    });

    it("passes artists to ClickableList", () => {
      const preloadedState = {
        artists: {
          artists: mockArtists,
          loading: false,
          error: null,
        },
      };

      renderWithProviders(<HomePage />, { preloadedState });

      expect(screen.getByTestId("artist-1")).toHaveTextContent("Artist One");
      expect(screen.getByTestId("artist-2")).toHaveTextContent("Artist Two");
      expect(screen.getByTestId("artist-3")).toHaveTextContent("Artist Three");
    });

    it("passes showAdminActions={false} to ClickableList", () => {
      const preloadedState = {
        artists: {
          artists: mockArtists,
          loading: false,
          error: null,
        },
      };

      renderWithProviders(<HomePage />, { preloadedState });
      expect(screen.getByTestId("show-admin-actions")).toHaveTextContent(
        "false"
      );
    });

    it("passes showCloutButton={false} to ClickableList", () => {
      const preloadedState = {
        artists: {
          artists: mockArtists,
          loading: false,
          error: null,
        },
      };

      renderWithProviders(<HomePage />, { preloadedState });
      expect(screen.getByTestId("show-clout-button")).toHaveTextContent(
        "false"
      );
    });

    it("does not show loading message when artists are loaded", () => {
      const preloadedState = {
        artists: {
          artists: mockArtists,
          loading: false,
          error: null,
        },
      };

      renderWithProviders(<HomePage />, { preloadedState });
      expect(screen.queryByText("Loading artists...")).not.toBeInTheDocument();
    });

    it("does not show error message when artists are loaded", () => {
      const preloadedState = {
        artists: {
          artists: mockArtists,
          loading: false,
          error: null,
        },
      };

      renderWithProviders(<HomePage />, { preloadedState });
      expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
    });
  });

  describe("Redux Integration", () => {
    it("dispatches fetchArtists on mount", async () => {
      renderWithProviders(<HomePage />);

      await waitFor(() => {
        expect(mockFetchArtists).toHaveBeenCalled();
      });
    });

    it("dispatches fetchArtists only once", async () => {
      const { rerender } = renderWithProviders(<HomePage />);

      await waitFor(() => {
        expect(mockFetchArtists).toHaveBeenCalledTimes(1);
      });

      // Rerender
      rerender(
        <Provider
          store={configureStore({
            reducer: {
              artists: () => ({ artists: [], loading: false, error: null }),
              auth: () => ({ user: null, token: null }),
            },
          })}
        >
          <BrowserRouter>
            <HomePage />
          </BrowserRouter>
        </Provider>
      );

      // Should still only be called once due to dependency array
      expect(mockFetchArtists).toHaveBeenCalledTimes(1);
    });

    it("reads artists from Redux state", () => {
      const preloadedState = {
        artists: {
          artists: [{ artist_id: 99, artist_name: "Redux Artist" }],
          loading: false,
          error: null,
        },
      };

      renderWithProviders(<HomePage />, { preloadedState });
      expect(screen.getByTestId("artist-99")).toHaveTextContent("Redux Artist");
    });

    it("reads loading state from Redux", () => {
      const preloadedState = {
        artists: {
          artists: [],
          loading: true,
          error: null,
        },
      };

      renderWithProviders(<HomePage />, { preloadedState });
      expect(screen.getByText("Loading artists...")).toBeInTheDocument();
    });

    it("reads error state from Redux", () => {
      const preloadedState = {
        artists: {
          artists: [],
          loading: false,
          error: "Redux Error",
        },
      };

      renderWithProviders(<HomePage />, { preloadedState });
      expect(screen.getByText("Error: Redux Error")).toBeInTheDocument();
    });
  });

  describe("Component Structure", () => {
    it("renders main container div", () => {
      const { container } = renderWithProviders(<HomePage />);
      const mainContainer = container.querySelector(".homePageContainer");
      expect(mainContainer).toBeInTheDocument();
    });

    it("renders main content div", () => {
      const { container } = renderWithProviders(<HomePage />);
      const mainContent = container.querySelector(".mainContent");
      expect(mainContent).toBeInTheDocument();
    });

    it("renders upcoming music section", () => {
      const { container } = renderWithProviders(<HomePage />);
      const upcomingSection = container.querySelector(".upcomingMusicSection");
      expect(upcomingSection).toBeInTheDocument();
    });

    it("Home Page header has correct CSS class", () => {
      const { container } = renderWithProviders(<HomePage />);
      const header = container.querySelector(".homePageHeader");
      expect(header).toBeInTheDocument();
      expect(header).toHaveTextContent("Home Page");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty artists array", () => {
      const preloadedState = {
        artists: {
          artists: [],
          loading: false,
          error: null,
        },
      };

      renderWithProviders(<HomePage />, { preloadedState });
      expect(screen.getByTestId("clickable-list")).toBeInTheDocument();
      expect(screen.queryByTestId(/artist-/)).not.toBeInTheDocument();
    });

    it("handles null error gracefully", () => {
      const preloadedState = {
        artists: {
          artists: [],
          loading: false,
          error: null,
        },
      };

      renderWithProviders(<HomePage />, { preloadedState });
      expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
    });

    it("handles loading and error both false", () => {
      const preloadedState = {
        artists: {
          artists: [{ artist_id: 1, artist_name: "Test" }],
          loading: false,
          error: null,
        },
      };

      renderWithProviders(<HomePage />, { preloadedState });
      expect(screen.getByTestId("clickable-list")).toBeInTheDocument();
    });

    it("handles very long error message", () => {
      const longError = "A".repeat(200);
      const preloadedState = {
        artists: {
          artists: [],
          loading: false,
          error: longError,
        },
      };

      renderWithProviders(<HomePage />, { preloadedState });
      expect(screen.getByText(`Error: ${longError}`)).toBeInTheDocument();
    });

    it("handles large number of artists", () => {
      const manyArtists = Array.from({ length: 100 }, (_, i) => ({
        artist_id: i + 1,
        artist_name: `Artist ${i + 1}`,
      }));

      const preloadedState = {
        artists: {
          artists: manyArtists,
          loading: false,
          error: null,
        },
      };

      renderWithProviders(<HomePage />, { preloadedState });
      expect(screen.getByTestId("clickable-list")).toBeInTheDocument();
      expect(screen.getByTestId("artist-1")).toBeInTheDocument();
      expect(screen.getByTestId("artist-100")).toBeInTheDocument();
    });

    it("handles artists with special characters in names", () => {
      const specialArtists = [
        {
          artist_id: 1,
          artist_name: 'Artist & Co. "The Best" <2024>',
        },
      ];

      const preloadedState = {
        artists: {
          artists: specialArtists,
          loading: false,
          error: null,
        },
      };

      renderWithProviders(<HomePage />, { preloadedState });
      expect(
        screen.getByText('Artist & Co. "The Best" <2024>')
      ).toBeInTheDocument();
    });
  });

  describe("Conditional Rendering Logic", () => {
    it("shows only loading when loading is true", () => {
      const preloadedState = {
        artists: {
          artists: [{ artist_id: 1, artist_name: "Test" }],
          loading: true,
          error: "Some error",
        },
      };

      renderWithProviders(<HomePage />, { preloadedState });
      expect(screen.getByText("Loading artists...")).toBeInTheDocument();
      expect(screen.queryByTestId("clickable-list")).not.toBeInTheDocument();
      // Error should not show when loading
      expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
    });

    it("shows only error when error exists and not loading", () => {
      const preloadedState = {
        artists: {
          artists: [{ artist_id: 1, artist_name: "Test" }],
          loading: false,
          error: "Error message",
        },
      };

      renderWithProviders(<HomePage />, { preloadedState });
      expect(screen.getByText("Error: Error message")).toBeInTheDocument();
      expect(screen.queryByTestId("clickable-list")).not.toBeInTheDocument();
      expect(screen.queryByText("Loading artists...")).not.toBeInTheDocument();
    });

    it("shows ClickableList only when not loading and no error", () => {
      const preloadedState = {
        artists: {
          artists: [{ artist_id: 1, artist_name: "Test" }],
          loading: false,
          error: null,
        },
      };

      renderWithProviders(<HomePage />, { preloadedState });
      expect(screen.getByTestId("clickable-list")).toBeInTheDocument();
      expect(screen.queryByText("Loading artists...")).not.toBeInTheDocument();
      expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
    });
  });

  describe("Integration with Child Components", () => {
    it("NavBar always renders regardless of state", () => {
      const states = [
        { artists: [], loading: true, error: null },
        { artists: [], loading: false, error: "Error" },
        {
          artists: [{ artist_id: 1, artist_name: "Test" }],
          loading: false,
          error: null,
        },
      ];

      states.forEach((artistsState) => {
        const { unmount } = renderWithProviders(<HomePage />, {
          preloadedState: { artists: artistsState },
        });
        expect(screen.getByTestId("navbar")).toBeInTheDocument();
        unmount();
      });
    });

    it("UpcomingMusic always renders regardless of state", () => {
      const states = [
        { artists: [], loading: true, error: null },
        { artists: [], loading: false, error: "Error" },
        {
          artists: [{ artist_id: 1, artist_name: "Test" }],
          loading: false,
          error: null,
        },
      ];

      states.forEach((artistsState) => {
        const { unmount } = renderWithProviders(<HomePage />, {
          preloadedState: { artists: artistsState },
        });
        expect(screen.getByTestId("upcoming-music")).toBeInTheDocument();
        unmount();
      });
    });
  });
});
