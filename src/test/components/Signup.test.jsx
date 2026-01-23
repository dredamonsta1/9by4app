import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Signup from "../../components/Signup/Signup";

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
    successBox: "successBox",
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

const renderSignup = (initialEntries = ["/register"]) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Signup />
    </MemoryRouter>
  );
};

describe("Signup Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders the registration form", () => {
      renderSignup();

      expect(screen.getByText("Creator Registration")).toBeInTheDocument();
      expect(screen.getByText(/activate your account/i)).toBeInTheDocument();
    });

    it("renders all form fields", () => {
      renderSignup();

      expect(screen.getByPlaceholderText("email@example.com")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("ENTER-CODE")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("username")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    });

    it("renders submit button", () => {
      renderSignup();

      expect(screen.getByRole("button", { name: /activate account/i })).toBeInTheDocument();
    });

    it("renders link to login", () => {
      renderSignup();

      expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    });
  });

  describe("URL Parameters", () => {
    it("pre-fills email from URL params", () => {
      render(
        <MemoryRouter initialEntries={["/register?email=test@example.com"]}>
          <Signup />
        </MemoryRouter>
      );

      const emailInput = screen.getByPlaceholderText("email@example.com");
      expect(emailInput).toHaveValue("test@example.com");
    });

    it("pre-fills invite code from URL params", () => {
      render(
        <MemoryRouter initialEntries={["/register?code=ABC123"]}>
          <Signup />
        </MemoryRouter>
      );

      const codeInput = screen.getByPlaceholderText("ENTER-CODE");
      expect(codeInput).toHaveValue("ABC123");
    });

    it("makes pre-filled fields read-only", () => {
      render(
        <MemoryRouter initialEntries={["/register?email=test@example.com&code=ABC123"]}>
          <Signup />
        </MemoryRouter>
      );

      expect(screen.getByPlaceholderText("email@example.com")).toHaveAttribute("readOnly");
      expect(screen.getByPlaceholderText("ENTER-CODE")).toHaveAttribute("readOnly");
    });
  });

  describe("Form Interaction", () => {
    it("allows typing in form fields", async () => {
      const user = userEvent.setup({});
      renderSignup();

      const usernameInput = screen.getByPlaceholderText("username");
      await user.type(usernameInput, "newuser");

      expect(usernameInput).toHaveValue("newuser");
    });
  });

  describe("Form Submission", () => {
    it("submits form with correct data", async () => {
      const user = userEvent.setup({});
      axiosInstance.post.mockResolvedValue({ data: {} });

      renderSignup();

      await user.type(screen.getByPlaceholderText("email@example.com"), "test@example.com");
      await user.type(screen.getByPlaceholderText("ENTER-CODE"), "abc123");
      await user.type(screen.getByPlaceholderText("username"), "newuser");
      await user.type(screen.getByPlaceholderText("••••••••"), "password123");
      await user.click(screen.getByRole("button", { name: /activate account/i }));

      await waitFor(() => {
        expect(axiosInstance.post).toHaveBeenCalledWith("/users/register", {
          username: "newuser",
          email: "test@example.com",
          password: "password123",
          invite_code: "ABC123",
        });
      });
    });

    it("shows loading state during submission", async () => {
      const user = userEvent.setup({});
      axiosInstance.post.mockImplementation(() => new Promise(() => {}));

      renderSignup();

      await user.type(screen.getByPlaceholderText("email@example.com"), "test@example.com");
      await user.type(screen.getByPlaceholderText("ENTER-CODE"), "abc123");
      await user.type(screen.getByPlaceholderText("username"), "newuser");
      await user.type(screen.getByPlaceholderText("••••••••"), "password123");
      await user.click(screen.getByRole("button", { name: /activate account/i }));

      expect(screen.getByRole("button", { name: /verifying/i })).toBeInTheDocument();
    });

    it("shows success message on successful registration", async () => {
      const user = userEvent.setup({});
      axiosInstance.post.mockResolvedValue({ data: {} });

      renderSignup();

      await user.type(screen.getByPlaceholderText("email@example.com"), "test@example.com");
      await user.type(screen.getByPlaceholderText("ENTER-CODE"), "abc123");
      await user.type(screen.getByPlaceholderText("username"), "newuser");
      await user.type(screen.getByPlaceholderText("••••••••"), "password123");
      await user.click(screen.getByRole("button", { name: /activate account/i }));

      await waitFor(() => {
        expect(screen.getByText(/account verified/i)).toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    it("displays error message on registration failure", async () => {
      const user = userEvent.setup({});
      axiosInstance.post.mockRejectedValue({
        response: { data: { message: "Invalid invite code" } },
      });

      renderSignup();

      await user.type(screen.getByPlaceholderText("email@example.com"), "test@example.com");
      await user.type(screen.getByPlaceholderText("ENTER-CODE"), "invalid");
      await user.type(screen.getByPlaceholderText("username"), "newuser");
      await user.type(screen.getByPlaceholderText("••••••••"), "password123");
      await user.click(screen.getByRole("button", { name: /activate account/i }));

      await waitFor(() => {
        expect(screen.getByText("Invalid invite code")).toBeInTheDocument();
      });
    });

    it("displays default error message when no message provided", async () => {
      const user = userEvent.setup({});
      axiosInstance.post.mockRejectedValue({});

      renderSignup();

      await user.type(screen.getByPlaceholderText("email@example.com"), "test@example.com");
      await user.type(screen.getByPlaceholderText("ENTER-CODE"), "abc123");
      await user.type(screen.getByPlaceholderText("username"), "newuser");
      await user.type(screen.getByPlaceholderText("••••••••"), "password123");
      await user.click(screen.getByRole("button", { name: /activate account/i }));

      await waitFor(() => {
        expect(screen.getByText(/registration failed/i)).toBeInTheDocument();
      });
    });
  });
});
