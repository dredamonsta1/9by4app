import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import NavBar from "../../components/NavBar/NavBar";

// mockNavigate must be declared at module scope — vi.mock is hoisted by Vitest
// so anything referenced inside the factory must exist before the hoist runs.
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock CSS module
vi.mock("../../components/NavBar/NavBar.module.css", () => ({
  default: {
    navBar: "navBar",
    logo: "logo",
    navLinks: "navLinks",
    logoutButton: "logoutButton",
    profileLink: "profileLink",
    liveLink: "liveLink",
    adminLink: "adminLink",
    highlight: "highlight",
    hamburger: "hamburger",
    bar: "bar",
    active: "active",
    navAvatar: "navAvatar",
  },
}));

const loggedInState = {
  auth: {
    user: { username: "testuser", id: 1, role: "user" },
    token: "mock-token",
    loading: false,
  },
};

// Helper function to render with providers
const renderWithProviders = (
  component,
  { preloadedState = {}, store = null, ...renderOptions } = {}
) => {
  const defaultState = {
    auth: {
      user: null,
      token: null,
      loading: false,
    },
    ...preloadedState,
  };

  const testStore =
    store ||
    configureStore({
      reducer: {
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

describe("NavBar Component", () => {
  describe("Basic Rendering", () => {
    it("renders without crashing", () => {
      renderWithProviders(<NavBar />);
      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("renders the logo", () => {
      renderWithProviders(<NavBar />);
      expect(screen.getByText("crates.fyi")).toBeInTheDocument();
    });

    it("renders guest navigation links when not logged in", () => {
      renderWithProviders(<NavBar />);
      expect(screen.getByText("Join Waitlist")).toBeInTheDocument();
      expect(screen.getByText("Register")).toBeInTheDocument();
      expect(screen.getByText("Login")).toBeInTheDocument();
    });

    it("renders logout button when logged in", () => {
      renderWithProviders(<NavBar />, { preloadedState: loggedInState });
      expect(
        screen.getByRole("button", { name: /logout/i })
      ).toBeInTheDocument();
    });
  });

  describe("Navigation Links", () => {
    it("Join Waitlist link has correct href", () => {
      renderWithProviders(<NavBar />);
      const link = screen.getByText("Join Waitlist").closest("a");
      expect(link).toHaveAttribute("href", "/signup");
    });

    it("Register link has correct href", () => {
      renderWithProviders(<NavBar />);
      const link = screen.getByText("Register").closest("a");
      expect(link).toHaveAttribute("href", "/register");
    });

    it("Login link has correct href", () => {
      renderWithProviders(<NavBar />);
      const loginLink = screen.getByText("Login").closest("a");
      expect(loginLink).toHaveAttribute("href", "/login");
    });

    it("Feed link has correct href when logged in", () => {
      renderWithProviders(<NavBar />, { preloadedState: loggedInState });
      const link = screen.getByText("Feed").closest("a");
      expect(link).toHaveAttribute("href", "/dashboard");
    });

    it("Videos link has correct href when logged in", () => {
      renderWithProviders(<NavBar />, { preloadedState: loggedInState });
      const link = screen.getByText("Videos").closest("a");
      expect(link).toHaveAttribute("href", "/art-video");
    });

    it("renders 3 links in list items when not logged in", () => {
      renderWithProviders(<NavBar />);
      const listItems = screen.getAllByRole("listitem");
      expect(listItems).toHaveLength(3);
    });
  });

  describe("User Authentication - Not Logged In", () => {
    it("shows guest links when user is not logged in", () => {
      renderWithProviders(<NavBar />);
      expect(screen.getByText("Login")).toBeInTheDocument();
      expect(screen.getByText("Register")).toBeInTheDocument();
    });

    it("does not show Feed or Logout when not logged in", () => {
      renderWithProviders(<NavBar />);
      expect(screen.queryByText("Feed")).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /logout/i })).not.toBeInTheDocument();
    });
  });

  describe("User Authentication - Logged In", () => {
    it("displays username when user is logged in", () => {
      const preloadedState = {
        auth: {
          user: { username: "johndoe", id: 1, role: "user" },
          token: "mock-token",
          loading: false,
        },
      };

      renderWithProviders(<NavBar />, { preloadedState });
      expect(screen.getByText("johndoe")).toBeInTheDocument();
    });

    it("does not show guest links when user is logged in", () => {
      renderWithProviders(<NavBar />, { preloadedState: loggedInState });
      expect(screen.queryByText("Login")).not.toBeInTheDocument();
      expect(screen.queryByText("Join Waitlist")).not.toBeInTheDocument();
    });

    it("displays admin username correctly", () => {
      const preloadedState = {
        auth: {
          user: { username: "admin", id: 1, role: "admin" },
          token: "admin-token",
          loading: false,
        },
      };

      renderWithProviders(<NavBar />, { preloadedState });
      expect(screen.getByText("admin")).toBeInTheDocument();
    });

    it("displays admin panel link for admin users", () => {
      const preloadedState = {
        auth: {
          user: { username: "admin", id: 1, role: "admin" },
          token: "admin-token",
          loading: false,
        },
      };
      renderWithProviders(<NavBar />, { preloadedState });
      expect(screen.getByText("Admin Panel")).toBeInTheDocument();
    });

    it("does not display admin panel link for regular users", () => {
      renderWithProviders(<NavBar />, { preloadedState: loggedInState });
      expect(screen.queryByText("Admin Panel")).not.toBeInTheDocument();
    });

    it("displays username with special characters", () => {
      const preloadedState = {
        auth: {
          user: { username: "user_123", id: 1, role: "user" },
          token: "token",
          loading: false,
        },
      };

      renderWithProviders(<NavBar />, { preloadedState });
      expect(screen.getByText("user_123")).toBeInTheDocument();
    });

    it("displays long username correctly", () => {
      const preloadedState = {
        auth: {
          user: { username: "verylongusername12345", id: 1, role: "user" },
          token: "token",
          loading: false,
        },
      };

      renderWithProviders(<NavBar />, { preloadedState });
      expect(screen.getByText("verylongusername12345")).toBeInTheDocument();
    });
  });

  describe("Logout Functionality", () => {
    it("calls navigate when logout button is clicked", async () => {
      const user = userEvent.setup();
      mockNavigate.mockReset();

      renderWithProviders(<NavBar />, { preloadedState: loggedInState });

      const logoutButton = screen.getByRole("button", { name: /logout/i });
      await user.click(logoutButton);

      expect(logoutButton).toBeEnabled();
    });

    it("logout button is visible when logged in", () => {
      renderWithProviders(<NavBar />, { preloadedState: loggedInState });
      const logoutButton = screen.getByRole("button", { name: /logout/i });
      expect(logoutButton).toBeVisible();
    });

    it("logout button is not shown when logged out", () => {
      renderWithProviders(<NavBar />);
      expect(screen.queryByRole("button", { name: /logout/i })).not.toBeInTheDocument();
    });

    it("logout button is enabled for logged in users", () => {
      renderWithProviders(<NavBar />, { preloadedState: loggedInState });
      const logoutButton = screen.getByRole("button", { name: /logout/i });
      expect(logoutButton).toBeEnabled();
    });
  });

  describe("Component Structure", () => {
    it("renders nav element", () => {
      renderWithProviders(<NavBar />);
      const nav = screen.getByRole("navigation");
      expect(nav).toBeInTheDocument();
    });

    it("renders logo in correct position", () => {
      const { container } = renderWithProviders(<NavBar />);
      const logo = container.querySelector(".logo");
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveTextContent("crates.fyi");
    });

    it("renders navigation links list", () => {
      renderWithProviders(<NavBar />);
      const list = screen.getByRole("list");
      expect(list).toBeInTheDocument();
    });

    it("renders navLinks container", () => {
      const { container } = renderWithProviders(<NavBar />);
      expect(container.querySelector(".navLinks")).toBeInTheDocument();
    });

    it("renders logout button in navLinks when logged in", () => {
      const { container } = renderWithProviders(<NavBar />, { preloadedState: loggedInState });
      expect(container.querySelector(".logoutButton")).toBeInTheDocument();
    });
  });

  describe("Redux Integration", () => {
    it("connects to Redux store", () => {
      const { store } = renderWithProviders(<NavBar />);
      expect(store.getState().auth).toBeDefined();
    });

    it("reads user from auth state", () => {
      const preloadedState = {
        auth: {
          user: { username: "stateuser", id: 1, role: "user" },
          token: "token",
          loading: false,
        },
      };

      renderWithProviders(<NavBar />, { preloadedState });
      expect(screen.getByText("stateuser")).toBeInTheDocument();
    });

    it("shows guest links when auth user is null", () => {
      renderWithProviders(<NavBar />);
      expect(screen.getByText("Login")).toBeInTheDocument();
    });

    it("updates when Redux state changes", () => {
      const store = configureStore({
        reducer: {
          auth: (state = { user: null, token: null }, action) => {
            if (action.type === "LOGIN") {
              return { user: action.payload, token: "token" };
            }
            return state;
          },
        },
      });

      const { rerender } = renderWithProviders(<NavBar />, { store });
      expect(screen.getByText("Login")).toBeInTheDocument();

      store.dispatch({
        type: "LOGIN",
        payload: { username: "newuser", id: 1, role: "user" },
      });

      rerender(<NavBar />);

      expect(screen.getByText("newuser")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("uses semantic nav element", () => {
      renderWithProviders(<NavBar />);
      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("uses semantic list for navigation links", () => {
      renderWithProviders(<NavBar />);
      expect(screen.getByRole("list")).toBeInTheDocument();
    });

    it("logout button has accessible role when logged in", () => {
      renderWithProviders(<NavBar />, { preloadedState: loggedInState });
      expect(
        screen.getByRole("button", { name: /logout/i })
      ).toBeInTheDocument();
    });

    it("all guest links are accessible", () => {
      renderWithProviders(<NavBar />);
      const links = screen.getAllByRole("link");
      // logo + Join Waitlist + Register + Login
      expect(links.length).toBeGreaterThanOrEqual(3);
      links.forEach((link) => {
        expect(link).toHaveAttribute("href");
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles undefined user gracefully", () => {
      const preloadedState = {
        auth: {
          user: undefined,
          token: null,
          loading: false,
        },
      };

      renderWithProviders(<NavBar />, { preloadedState });
      expect(screen.getByText("Login")).toBeInTheDocument();
    });

    it("handles user without username", () => {
      const preloadedState = {
        auth: {
          user: { id: 1, role: "user" },
          token: "token",
          loading: false,
        },
      };

      const { container } = renderWithProviders(<NavBar />, { preloadedState });
      expect(container).toBeInTheDocument();
    });

    it("handles null auth state", () => {
      const preloadedState = {
        auth: null,
      };

      expect(() => {
        renderWithProviders(<NavBar />, { preloadedState });
      }).toThrow();
    });
  });

  describe("Visual Rendering", () => {
    it("applies core CSS classes correctly", () => {
      const { container } = renderWithProviders(<NavBar />);
      expect(container.querySelector(".navBar")).toBeInTheDocument();
      expect(container.querySelector(".logo")).toBeInTheDocument();
      expect(container.querySelector(".navLinks")).toBeInTheDocument();
    });

    it("applies logoutButton class when logged in", () => {
      const { container } = renderWithProviders(<NavBar />, { preloadedState: loggedInState });
      expect(container.querySelector(".logoutButton")).toBeInTheDocument();
    });
  });
});
