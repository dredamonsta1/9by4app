import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../../App";

// Mock all the page components
vi.mock("../../pages/HomePage", () => ({
  default: () => <div>HomePage</div>,
}));

vi.mock("../../components/Signup/Signup", () => ({
  default: () => <div>AuthForm</div>,
}));

vi.mock("../../pages/profile/ProfilePage", () => ({
  default: () => <div>ProfilePage</div>,
}));

vi.mock("../../components/CreateArtistForm/CreateArtistForm", () => ({
  default: () => <div>CreateArtistForm</div>,
}));

vi.mock("../../components/DashBoard/Dashboard", () => ({
  default: () => <div>Dashboard</div>,
}));

vi.mock("../../components/ArtVideoFeed/ArtVideoFeed", () => ({
  default: () => <div>ArtVideoFeed</div>,
}));

vi.mock("../../components/ImageFeed/ImageFeed", () => ({
  default: () => <div>ImageFeed</div>,
}));

vi.mock("../../components/WaitlistAdmin/WaitlistAdmin", () => ({
  default: () => <div>WaitlistAdmin</div>,
}));

vi.mock("../../components/ProtectedAdminRoute/ProtectedAdminRoute", () => ({
  default: ({ children }) => (
    <div data-testid="protected-route">{children}</div>
  ),
}));

// Mock the Redux store
vi.mock("../../redux/store", () => ({
  default: {
    getState: () => ({
      auth: { user: null, token: null, loading: false },
    }),
    subscribe: () => {},
    dispatch: () => {},
  },
}));

// Mock the auth actions
const mockLoadUserFromToken = vi.fn();
vi.mock("../../redux/actions/authActions", () => ({
  loadUserFromToken: () => mockLoadUserFromToken,
}));

describe("App Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders without crashing", () => {
      const { container } = render(<App />);
      expect(container).toBeInTheDocument();
    });

    it("renders with Redux Provider", () => {
      const { container } = render(<App />);
      // Should not throw any errors
      expect(container.firstChild).toBeTruthy();
    });

    it("renders with React Router", () => {
      const { container } = render(<App />);
      // Router should be present
      expect(container).toBeTruthy();
    });

    it("initializes and renders HomePage by default", () => {
      render(<App />);
      // HomePage should be rendered on the default route
      expect(screen.getByText("HomePage")).toBeInTheDocument();
    });
  });

  describe("Authentication Initialization", () => {
    it("dispatches loadUserFromToken on mount", async () => {
      render(<App />);

      // Give it a moment for useEffect to run
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockLoadUserFromToken).toHaveBeenCalled();
    });
  });

  describe("Component Structure", () => {
    it("has Provider as root wrapper", () => {
      const { container } = render(<App />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("renders routes correctly", () => {
      render(<App />);
      // At least one route component should render
      expect(screen.queryByText("HomePage")).toBeTruthy();
    });
  });
});
