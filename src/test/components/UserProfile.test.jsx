import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import UserProfile from "../../components/UserProfilee/UserProfile";

// Mock CSS module
vi.mock("../../components/UserProfilee/UserProfile.module.css", () => ({
  default: {
    profileContainer: "profileContainer",
    profileTitle: "profileTitle",
    profileDetails: "profileDetails",
    loadingText: "loadingText",
    errorContainer: "errorContainer",
    errorText: "errorText",
    loginButton: "loginButton",
    notLoggedInContainer: "notLoggedInContainer",
  },
}));

// Mock FollowButton component
vi.mock("../../components/FollowButton", () => ({
  default: ({ targetUserId }) => (
    <button data-testid="follow-button">Follow {targetUserId}</button>
  ),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const createMockStore = (authState = {}) => {
  return configureStore({
    reducer: {
      auth: () => ({
        user: null,
        loading: false,
        error: null,
        ...authState,
      }),
    },
  });
};

const renderUserProfile = (authState = {}) => {
  const store = createMockStore(authState);
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <UserProfile />
      </BrowserRouter>
    </Provider>
  );
};

describe("UserProfile Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Loading State", () => {
    it("shows loading message when loading", () => {
      renderUserProfile({ loading: true });

      expect(screen.getByText(/loading user profile/i)).toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    it("shows error message when error exists", () => {
      renderUserProfile({
        error: "Token expired",
        loading: false,
      });

      expect(screen.getByText(/error: token expired/i)).toBeInTheDocument();
    });

    it("shows login button when error", () => {
      renderUserProfile({
        error: "Token expired",
        loading: false,
      });

      expect(screen.getByRole("button", { name: /go to login/i })).toBeInTheDocument();
    });

    it("navigates to login when button clicked", async () => {
      const user = userEvent.setup();
      renderUserProfile({
        error: "Token expired",
        loading: false,
      });

      await user.click(screen.getByRole("button", { name: /go to login/i }));

      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  describe("Not Logged In State", () => {
    it("shows not logged in message when no user", () => {
      renderUserProfile({
        user: null,
        loading: false,
        error: null,
      });

      expect(screen.getByText(/you are not logged in/i)).toBeInTheDocument();
    });

    it("shows login button when not logged in", () => {
      renderUserProfile({
        user: null,
        loading: false,
        error: null,
      });

      expect(screen.getByRole("button", { name: /go to login/i })).toBeInTheDocument();
    });
  });

  describe("Logged In State", () => {
    const mockUser = {
      id: 1,
      username: "testuser",
      role: "user",
    };

    it("renders profile when user is logged in", () => {
      renderUserProfile({
        user: mockUser,
        loading: false,
        error: null,
      });

      expect(screen.getByText(/testuser profile/i)).toBeInTheDocument();
    });

    it("displays username", () => {
      renderUserProfile({
        user: mockUser,
        loading: false,
        error: null,
      });

      expect(screen.getByText(/username:/i)).toBeInTheDocument();
      expect(screen.getByText("testuser")).toBeInTheDocument();
    });

    it("displays role", () => {
      renderUserProfile({
        user: mockUser,
        loading: false,
        error: null,
      });

      expect(screen.getByText(/role:/i)).toBeInTheDocument();
      expect(screen.getByText("user")).toBeInTheDocument();
    });

    it("renders follow button with user id", () => {
      renderUserProfile({
        user: mockUser,
        loading: false,
        error: null,
      });

      expect(screen.getByTestId("follow-button")).toBeInTheDocument();
    });
  });

  describe("Admin User", () => {
    it("displays admin role correctly", () => {
      renderUserProfile({
        user: { id: 1, username: "adminuser", role: "admin" },
        loading: false,
        error: null,
      });

      expect(screen.getByText("adminuser")).toBeInTheDocument();
      expect(screen.getByText("admin")).toBeInTheDocument(); // role
    });
  });
});
