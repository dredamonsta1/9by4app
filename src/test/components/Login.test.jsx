// Tests for the passwordless Login flow (email -> 6-digit code).
// Original Login was username + password; the rewrite to passwordless
// OTP shipped 2026-06-10 and replaced the entire surface.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { buildMockStore } from "../utils";
import Login from "../../components/login/Login";

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

const renderLogin = () => {
  return render(
    <Provider store={buildMockStore()}>
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    </Provider>,
  );
};

describe("Login (passwordless)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("Step 1 — email", () => {
    it("renders the email form by default", () => {
      renderLogin();
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /send code/i }),
      ).toBeInTheDocument();
    });

    it("disables the submit button when email is empty", () => {
      renderLogin();
      expect(
        screen.getByRole("button", { name: /send code/i }),
      ).toBeDisabled();
    });

    it("posts to /auth/send-code with lowercased email", async () => {
      axiosInstance.post.mockResolvedValueOnce({ data: {} });
      renderLogin();
      await userEvent.type(screen.getByLabelText(/email/i), "Foo@Bar.com");
      await userEvent.click(screen.getByRole("button", { name: /send code/i }));
      await waitFor(() =>
        expect(axiosInstance.post).toHaveBeenCalledWith("/auth/send-code", {
          email: "foo@bar.com",
        }),
      );
    });

    it("shows an error when send-code fails", async () => {
      axiosInstance.post.mockRejectedValueOnce({
        response: { data: { message: "Email not on waitlist." } },
      });
      renderLogin();
      await userEvent.type(screen.getByLabelText(/email/i), "x@y.com");
      await userEvent.click(screen.getByRole("button", { name: /send code/i }));
      expect(
        await screen.findByText(/email not on waitlist/i),
      ).toBeInTheDocument();
    });
  });

  describe("Step 2 — code verification", () => {
    const advanceToCodeStep = async () => {
      axiosInstance.post.mockResolvedValueOnce({ data: {} });
      renderLogin();
      await userEvent.type(screen.getByLabelText(/email/i), "x@y.com");
      await userEvent.click(screen.getByRole("button", { name: /send code/i }));
      await screen.findByLabelText(/sign-in code/i);
    };

    it("shows the code input after a successful send", async () => {
      await advanceToCodeStep();
      expect(screen.getByLabelText(/sign-in code/i)).toBeInTheDocument();
    });

    it("rejects partial codes (button disabled until 6 digits)", async () => {
      await advanceToCodeStep();
      const input = screen.getByLabelText(/sign-in code/i);
      const btn = screen.getByRole("button", { name: /sign in/i });
      await userEvent.type(input, "123");
      expect(btn).toBeDisabled();
    });

    it("posts to /auth/verify-code, stores token, navigates home on success", async () => {
      await advanceToCodeStep();
      axiosInstance.post.mockResolvedValueOnce({
        data: { token: "jwt-abc", user: { user_id: 1, email: "x@y.com" } },
      });
      await userEvent.type(screen.getByLabelText(/sign-in code/i), "123456");
      await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
      await waitFor(() => {
        expect(axiosInstance.post).toHaveBeenLastCalledWith(
          "/auth/verify-code",
          { email: "x@y.com", code: "123456" },
        );
        expect(localStorage.getItem("token")).toBe("jwt-abc");
        expect(mockNavigate).toHaveBeenCalledWith("/");
      });
    });

    it("shows the signup_required hint when backend says so", async () => {
      await advanceToCodeStep();
      axiosInstance.post.mockRejectedValueOnce({
        response: { data: { reason: "signup_required" } },
      });
      await userEvent.type(screen.getByLabelText(/sign-in code/i), "123456");
      await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
      expect(
        await screen.findByText(/no account for that email/i),
      ).toBeInTheDocument();
    });
  });
});
