import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import Login from "../../components/login/Login";

// Mock axiosInstance
vi.mock("../../utils/axiosInstance", () => ({
  default: {
    post: vi.fn(),
  },
}));

// Mock CSS module
vi.mock("../../AuthLayout.module.css", () => ({
  default: {
    authPage: "authPage",
    authCard: "authCard",
    title: "title",
    subtitle: "subtitle",
    errorBox: "errorBox",
    formGroup: "formGroup",
    input: "input",
    submitBtn: "submitBtn",
    authFooter: "authFooter",
  },
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

import axiosInstance from "../../utils/axiosInstance";

const createMockStore = () => {
  return configureStore({
    reducer: {
      auth: (state = { user: null, token: null }) => state,
    },
  });
};

const renderLogin = () => {
  const store = createMockStore();
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    </Provider>
  );
};

describe("Login Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders the login form", () => {
      renderLogin();

      expect(screen.getByText("Welcome Back")).toBeInTheDocument();
      expect(screen.getByLabelText("Username")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    });

    it("renders subtitle text", () => {
      renderLogin();

      expect(screen.getByText(/enter your credentials/i)).toBeInTheDocument();
    });

    it("renders links to waitlist and register", () => {
      renderLogin();

      expect(screen.getByText(/join the waitlist/i)).toBeInTheDocument();
      expect(screen.getByText(/register here/i)).toBeInTheDocument();
    });
  });

  describe("Form Interaction", () => {
    it("allows typing in username field", async () => {
      const user = userEvent.setup();
      renderLogin();

      const usernameInput = screen.getByLabelText("Username");
      await user.type(usernameInput, "testuser");

      expect(usernameInput).toHaveValue("testuser");
    });

    it("allows typing in password field", async () => {
      const user = userEvent.setup();
      renderLogin();

      const passwordInput = screen.getByLabelText("Password");
      await user.type(passwordInput, "password123");

      expect(passwordInput).toHaveValue("password123");
    });
  });

  describe("Form Submission", () => {
    it("submits form with correct credentials", async () => {
      const user = userEvent.setup();
      axiosInstance.post.mockResolvedValue({
        data: {
          token: "mock-token",
          user: { id: 1, username: "testuser", role: "user" },
        },
      });

      renderLogin();

      await user.type(screen.getByLabelText("Username"), "testuser");
      await user.type(screen.getByLabelText("Password"), "password123");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(axiosInstance.post).toHaveBeenCalledWith("/users/login", {
          username: "testuser",
          password: "password123",
        });
      });
    });

    it("shows loading state during submission", async () => {
      const user = userEvent.setup();
      axiosInstance.post.mockImplementation(() => new Promise(() => {}));

      renderLogin();

      await user.type(screen.getByLabelText("Username"), "testuser");
      await user.type(screen.getByLabelText("Password"), "password123");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      expect(screen.getByRole("button", { name: /authenticating/i })).toBeInTheDocument();
    });

    it("disables inputs during loading", async () => {
      const user = userEvent.setup();
      axiosInstance.post.mockImplementation(() => new Promise(() => {}));

      renderLogin();

      await user.type(screen.getByLabelText("Username"), "testuser");
      await user.type(screen.getByLabelText("Password"), "password123");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      expect(screen.getByLabelText("Username")).toBeDisabled();
      expect(screen.getByLabelText("Password")).toBeDisabled();
    });

    it("navigates to dashboard on successful login", async () => {
      const user = userEvent.setup();
      axiosInstance.post.mockResolvedValue({
        data: {
          token: "mock-token",
          user: { id: 1, username: "testuser", role: "user" },
        },
      });

      renderLogin();

      await user.type(screen.getByLabelText("Username"), "testuser");
      await user.type(screen.getByLabelText("Password"), "password123");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
      });
    });
  });

  describe("Error Handling", () => {
    it("displays error message on login failure", async () => {
      const user = userEvent.setup();
      axiosInstance.post.mockRejectedValue({
        response: { data: { message: "Invalid credentials" } },
      });

      renderLogin();

      await user.type(screen.getByLabelText("Username"), "wronguser");
      await user.type(screen.getByLabelText("Password"), "wrongpassword");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
      });
    });

    it("displays default error message when no message provided", async () => {
      const user = userEvent.setup();
      axiosInstance.post.mockRejectedValue({});

      renderLogin();

      await user.type(screen.getByLabelText("Username"), "wronguser");
      await user.type(screen.getByLabelText("Password"), "wrongpassword");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText("Invalid username or password")).toBeInTheDocument();
      });
    });
  });
});
