// Tests for the passwordless Signup flow (details -> 6-digit code).
// Original Signup was password+invite; the rewrite to passwordless OTP
// shipped 2026-06-10 and replaced the entire surface.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { buildMockStore } from "../utils";
import Signup from "../../components/Signup/Signup";

vi.mock("../../utils/axiosInstance", () => ({
  default: { post: vi.fn() },
}));

vi.mock("../../AuthLayout.module.css", () => ({
  default: new Proxy({}, { get: (_, key) => key }),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

import axiosInstance from "../../utils/axiosInstance";

const renderSignup = (initialEntries = ["/register"]) =>
  render(
    <Provider store={buildMockStore()}>
      <MemoryRouter initialEntries={initialEntries}>
        <Signup />
      </MemoryRouter>
    </Provider>,
  );

describe("Signup (passwordless)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("Step 1 — details", () => {
    it("renders the title + email, invite code, and username inputs", () => {
      renderSignup();
      expect(screen.getByText(/creator registration/i)).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/email@example.com/i),
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/ENTER-CODE/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/^username$/i)).toBeInTheDocument();
    });

    it("pre-fills email + invite code from URL search params", () => {
      renderSignup(["/register?email=invited@x.com&code=ABC123"]);
      expect(screen.getByPlaceholderText(/email@example.com/i)).toHaveValue(
        "invited@x.com",
      );
      expect(screen.getByPlaceholderText(/ENTER-CODE/i)).toHaveValue("ABC123");
    });

    it("makes pre-filled fields readOnly", () => {
      renderSignup(["/register?email=invited@x.com&code=ABC123"]);
      expect(screen.getByPlaceholderText(/email@example.com/i)).toHaveAttribute(
        "readonly",
      );
      expect(screen.getByPlaceholderText(/ENTER-CODE/i)).toHaveAttribute("readonly");
    });

    it("posts to /auth/send-code on submit", async () => {
      axiosInstance.post.mockResolvedValueOnce({ data: {} });
      renderSignup();
      await userEvent.type(screen.getByPlaceholderText(/email@example.com/i), "x@y.com");
      await userEvent.type(screen.getByPlaceholderText(/ENTER-CODE/i), "ABC");
      await userEvent.type(screen.getByPlaceholderText(/^username$/i), "neo");
      await userEvent.click(screen.getByRole("button", { name: /send code/i }));
      await waitFor(() =>
        expect(axiosInstance.post).toHaveBeenCalledWith("/auth/send-code", {
          email: "x@y.com",
        }),
      );
    });

    it("surfaces a send-code error", async () => {
      axiosInstance.post.mockRejectedValueOnce({
        response: { data: { message: "Invalid invite." } },
      });
      renderSignup();
      await userEvent.type(screen.getByPlaceholderText(/email@example.com/i), "x@y.com");
      await userEvent.type(screen.getByPlaceholderText(/ENTER-CODE/i), "ABC");
      await userEvent.type(screen.getByPlaceholderText(/^username$/i), "neo");
      await userEvent.click(screen.getByRole("button", { name: /send code/i }));
      expect(
        await screen.findByText(/invalid invite/i),
      ).toBeInTheDocument();
    });
  });

  describe("Step 2 — verify", () => {
    const advanceToCode = async () => {
      axiosInstance.post.mockResolvedValueOnce({ data: {} });
      renderSignup();
      await userEvent.type(screen.getByPlaceholderText(/email@example.com/i), "x@y.com");
      await userEvent.type(screen.getByPlaceholderText(/ENTER-CODE/i), "abc");
      await userEvent.type(screen.getByPlaceholderText(/^username$/i), "neo");
      await userEvent.click(screen.getByRole("button", { name: /send code/i }));
      await screen.findByLabelText(/sign-up code/i);
    };

    it("shows the code input + Activate button after a successful send", async () => {
      await advanceToCode();
      expect(screen.getByLabelText(/sign-up code/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /activate account/i }),
      ).toBeInTheDocument();
    });

    it("activates account on verify — uppercases invite code, stores token, navigates", async () => {
      await advanceToCode();
      axiosInstance.post.mockResolvedValueOnce({
        data: { token: "jwt-xyz", user: { user_id: 99, email: "x@y.com" } },
      });
      await userEvent.type(screen.getByLabelText(/sign-up code/i), "654321");
      await userEvent.click(
        screen.getByRole("button", { name: /activate account/i }),
      );
      await waitFor(() => {
        expect(axiosInstance.post).toHaveBeenLastCalledWith(
          "/auth/verify-code",
          {
            email: "x@y.com",
            code: "654321",
            username: "neo",
            invite_code: "ABC",
          },
        );
        expect(localStorage.getItem("token")).toBe("jwt-xyz");
        expect(mockNavigate).toHaveBeenCalledWith("/");
      });
    });

    it("falls back to a default error message when backend has none", async () => {
      await advanceToCode();
      axiosInstance.post.mockRejectedValueOnce({});
      await userEvent.type(screen.getByLabelText(/sign-up code/i), "111111");
      await userEvent.click(
        screen.getByRole("button", { name: /activate account/i }),
      );
      expect(
        await screen.findByText(/could not activate your account/i),
      ).toBeInTheDocument();
    });
  });
});
