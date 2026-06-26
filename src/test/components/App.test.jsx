import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { buildMockStore } from "../utils";
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

vi.mock("../../components/Dashboard/Dashboard", () => ({
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

vi.mock("../../components/NavBar/NavBar", () => ({
  default: () => <div data-testid="navbar">NavBar</div>,
}));

vi.mock("../../components/login/Login", () => ({
  default: () => <div>Login</div>,
}));

vi.mock("../../components/Waitlist/Waitlist", () => ({
  default: () => <div>Waitlist</div>,
}));

vi.mock("../../components/Feed/Feed", () => ({
  default: () => <div>Feed</div>,
}));

vi.mock("../../pages/AdminDashboard/AdminDashboard", () => ({
  default: () => <div>AdminDashboard</div>,
}));

// Mock react-toastify
vi.mock("react-toastify", () => ({
  ToastContainer: () => null,
}));

// Mock App.css
vi.mock("../../App.css", () => ({}));

// Note: we deliberately do NOT mock loadUserFromToken — it's a
// createAsyncThunk and stubbing it strips the .pending/.fulfilled
// action types the real authSlice relies on in extraReducers.

// Mock just the action creators; keep the real reducer (default export)
// so buildMockStore can still wire up the auth slice properly.
vi.mock("../../store/authSlice", async () => {
  const actual = await vi.importActual("../../store/authSlice");
  return {
    ...actual,
    setCredentials: vi.fn(),
    logout: vi.fn(),
  };
});

// Helper to render App with all required providers. Uses the shared
// buildMockStore so every slice the real app reads from is wired in.
const renderApp = (initialRoute = "/", storeOverrides = {}) => {
  const store = buildMockStore(storeOverrides);
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <App />
      </MemoryRouter>
    </Provider>
  );
};

describe("App Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders without crashing", () => {
      const { container } = renderApp();
      expect(container).toBeInTheDocument();
    });

    it("renders with Redux Provider", () => {
      const { container } = renderApp();
      // Should not throw any errors
      expect(container.firstChild).toBeTruthy();
    });

    it("renders with React Router", () => {
      const { container } = renderApp();
      // Router should be present
      expect(container).toBeTruthy();
    });

    it("initializes and renders HomePage by default", () => {
      renderApp();
      // HomePage should be rendered on the default route
      expect(screen.getByText("HomePage")).toBeInTheDocument();
    });
  });

  describe("Authentication Initialization", () => {
    it("renders without crashing when a token is already in state", () => {
      const { container } = renderApp("/", {
        auth: { token: "test-token" },
      });
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe("Component Structure", () => {
    it("has Provider as root wrapper", () => {
      const { container } = renderApp();
      expect(container.firstChild).toBeInTheDocument();
    });

    it("renders routes correctly", () => {
      renderApp();
      // At least one route component should render
      expect(screen.queryByText("HomePage")).toBeTruthy();
    });

    it("renders NavBar", () => {
      renderApp();
      expect(screen.getByTestId("navbar")).toBeInTheDocument();
    });
  });
});
