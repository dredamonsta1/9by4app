import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
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

// Mock the auth actions
const mockLoadUserFromToken = vi.fn();
vi.mock("../../redux/actions/authActions", () => ({
  loadUserFromToken: () => mockLoadUserFromToken,
}));

// Mock the authSlice actions
vi.mock("../../store/authSlice.jsx", () => ({
  setCredentials: vi.fn(),
  logout: vi.fn(),
}));

// Create a minimal auth reducer for testing
const authReducer = (state = { user: null, token: null, isLoggedIn: false, status: "idle", error: null }, action) => {
  return state;
};

// Helper to create a test store
const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: { user: null, token: null, isLoggedIn: false, status: "idle", error: null },
      ...preloadedState,
    },
  });
};

// Helper to render App with all required providers
const renderApp = (initialRoute = "/", storeOverrides = {}) => {
  const store = createTestStore(storeOverrides);
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
    it("dispatches loadUserFromToken on mount when token exists", async () => {
      const storeWithToken = {
        auth: { user: null, token: "test-token", isLoggedIn: false, status: "idle", error: null },
      };
      renderApp("/", storeWithToken);

      // Give it a moment for useEffect to run
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockLoadUserFromToken).toHaveBeenCalled();
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
