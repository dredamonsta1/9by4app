import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Waitlist from "../../components/Waitlist/Waitlist";

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
    successContainer: "successContainer",
    formGroup: "formGroup",
    input: "input",
    submitBtn: "submitBtn",
    authFooter: "authFooter",
  },
}));

import axiosInstance from "../../utils/axiosInstance";

const renderWaitlist = () => {
  return render(
    <BrowserRouter>
      <Waitlist />
    </BrowserRouter>
  );
};

describe("Waitlist Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders the waitlist form", () => {
      renderWaitlist();

      expect(screen.getByText("Join the Waitlist")).toBeInTheDocument();
    });

    it("renders form fields", () => {
      renderWaitlist();

      expect(screen.getByPlaceholderText("e.g. John Doe")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("name@provider.com")).toBeInTheDocument();
    });

    it("renders submit button", () => {
      renderWaitlist();

      expect(screen.getByRole("button", { name: /request invite code/i })).toBeInTheDocument();
    });

    it("renders links to register and login", () => {
      renderWaitlist();

      expect(screen.getByText(/register here/i)).toBeInTheDocument();
      expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    });

    it("displays invite-only message", () => {
      renderWaitlist();

      expect(screen.getByText(/invite-only/i)).toBeInTheDocument();
    });
  });

  describe("Form Interaction", () => {
    it("allows typing in name field", async () => {
      const user = userEvent.setup();
      renderWaitlist();

      const nameInput = screen.getByPlaceholderText("e.g. John Doe");
      await user.type(nameInput, "John Doe");

      expect(nameInput).toHaveValue("John Doe");
    });

    it("allows typing in email field", async () => {
      const user = userEvent.setup();
      renderWaitlist();

      const emailInput = screen.getByPlaceholderText("name@provider.com");
      await user.type(emailInput, "john@example.com");

      expect(emailInput).toHaveValue("john@example.com");
    });
  });

  describe("Form Submission", () => {
    it("submits form with correct data", async () => {
      const user = userEvent.setup();
      axiosInstance.post.mockResolvedValue({ data: {} });

      renderWaitlist();

      await user.type(screen.getByPlaceholderText("e.g. John Doe"), "John Doe");
      await user.type(screen.getByPlaceholderText("name@provider.com"), "john@example.com");
      await user.click(screen.getByRole("button", { name: /request invite code/i }));

      await waitFor(() => {
        expect(axiosInstance.post).toHaveBeenCalledWith("/waitlist/join", {
          email: "john@example.com",
          full_name: "John Doe",
        });
      });
    });

    it("shows loading state during submission", async () => {
      const user = userEvent.setup();
      axiosInstance.post.mockImplementation(() => new Promise(() => {}));

      renderWaitlist();

      await user.type(screen.getByPlaceholderText("e.g. John Doe"), "John Doe");
      await user.type(screen.getByPlaceholderText("name@provider.com"), "john@example.com");
      await user.click(screen.getByRole("button", { name: /request invite code/i }));

      expect(screen.getByRole("button", { name: /requesting/i })).toBeInTheDocument();
    });

    it("disables inputs during loading", async () => {
      const user = userEvent.setup();
      axiosInstance.post.mockImplementation(() => new Promise(() => {}));

      renderWaitlist();

      await user.type(screen.getByPlaceholderText("e.g. John Doe"), "John Doe");
      await user.type(screen.getByPlaceholderText("name@provider.com"), "john@example.com");
      await user.click(screen.getByRole("button", { name: /request invite code/i }));

      expect(screen.getByPlaceholderText("e.g. John Doe")).toBeDisabled();
      expect(screen.getByPlaceholderText("name@provider.com")).toBeDisabled();
    });
  });

  describe("Success State", () => {
    it("shows success message on successful submission", async () => {
      const user = userEvent.setup();
      axiosInstance.post.mockResolvedValue({ data: {} });

      renderWaitlist();

      await user.type(screen.getByPlaceholderText("e.g. John Doe"), "John Doe");
      await user.type(screen.getByPlaceholderText("name@provider.com"), "john@example.com");
      await user.click(screen.getByRole("button", { name: /request invite code/i }));

      await waitFor(() => {
        expect(screen.getByText(/you're on the list/i)).toBeInTheDocument();
      });
    });

    it("displays submitted email in success message", async () => {
      const user = userEvent.setup();
      axiosInstance.post.mockResolvedValue({ data: {} });

      renderWaitlist();

      await user.type(screen.getByPlaceholderText("e.g. John Doe"), "John Doe");
      await user.type(screen.getByPlaceholderText("name@provider.com"), "john@example.com");
      await user.click(screen.getByRole("button", { name: /request invite code/i }));

      await waitFor(() => {
        expect(screen.getByText("john@example.com")).toBeInTheDocument();
      });
    });

    it("shows back to login link on success", async () => {
      const user = userEvent.setup();
      axiosInstance.post.mockResolvedValue({ data: {} });

      renderWaitlist();

      await user.type(screen.getByPlaceholderText("e.g. John Doe"), "John Doe");
      await user.type(screen.getByPlaceholderText("name@provider.com"), "john@example.com");
      await user.click(screen.getByRole("button", { name: /request invite code/i }));

      await waitFor(() => {
        expect(screen.getByText(/back to login/i)).toBeInTheDocument();
      });
    });
  });

  describe("Error State", () => {
    it("shows error message on failed submission", async () => {
      const user = userEvent.setup();
      axiosInstance.post.mockRejectedValue(new Error("Network error"));

      renderWaitlist();

      await user.type(screen.getByPlaceholderText("e.g. John Doe"), "John Doe");
      await user.type(screen.getByPlaceholderText("name@provider.com"), "john@example.com");
      await user.click(screen.getByRole("button", { name: /request invite code/i }));

      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });
    });
  });
});
