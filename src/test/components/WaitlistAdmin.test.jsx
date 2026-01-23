import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WaitlistAdmin from "../../components/WaitlistAdmin/WaitlistAdmin";

// Mock axiosInstance
vi.mock("../../utils/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock react-toastify
vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

describe("WaitlistAdmin Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Loading State", () => {
    it("shows loading message while fetching", () => {
      axiosInstance.get.mockImplementation(() => new Promise(() => {}));

      render(<WaitlistAdmin />);

      expect(screen.getByText(/loading control room/i)).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("shows empty message when no waitlist entries", async () => {
      axiosInstance.get.mockResolvedValue({ data: [] });

      render(<WaitlistAdmin />);

      await waitFor(() => {
        expect(screen.getByText(/no one is on the waitlist yet/i)).toBeInTheDocument();
      });
    });
  });

  describe("Waitlist Display", () => {
    const mockWaitlist = [
      {
        email: "user1@example.com",
        full_name: "User One",
        status: "pending",
        invite_code: null,
      },
      {
        email: "user2@example.com",
        full_name: "User Two",
        status: "approved",
        invite_code: "ABC123",
      },
    ];

    it("renders waitlist table with entries", async () => {
      axiosInstance.get.mockResolvedValue({ data: mockWaitlist });

      render(<WaitlistAdmin />);

      await waitFor(() => {
        expect(screen.getByText("User One")).toBeInTheDocument();
        expect(screen.getByText("user1@example.com")).toBeInTheDocument();
        expect(screen.getByText("User Two")).toBeInTheDocument();
        expect(screen.getByText("user2@example.com")).toBeInTheDocument();
      });
    });

    it("displays status correctly", async () => {
      axiosInstance.get.mockResolvedValue({ data: mockWaitlist });

      render(<WaitlistAdmin />);

      await waitFor(() => {
        expect(screen.getByText("PENDING")).toBeInTheDocument();
        expect(screen.getByText("APPROVED")).toBeInTheDocument();
      });
    });

    it("shows approve button for pending entries", async () => {
      axiosInstance.get.mockResolvedValue({ data: mockWaitlist });

      render(<WaitlistAdmin />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /approve & email/i })).toBeInTheDocument();
      });
    });

    it("shows invite code for approved entries", async () => {
      axiosInstance.get.mockResolvedValue({ data: mockWaitlist });

      render(<WaitlistAdmin />);

      await waitFor(() => {
        expect(screen.getByText("ABC123")).toBeInTheDocument();
      });
    });

    it("shows wipe user button for all entries", async () => {
      axiosInstance.get.mockResolvedValue({ data: mockWaitlist });

      render(<WaitlistAdmin />);

      await waitFor(() => {
        const wipeButtons = screen.getAllByRole("button", { name: /wipe user/i });
        expect(wipeButtons).toHaveLength(2);
      });
    });
  });

  describe("Approve Action", () => {
    it("calls approve endpoint when approve button clicked", async () => {
      const user = userEvent.setup();
      const mockWaitlist = [
        {
          email: "user@example.com",
          full_name: "User",
          status: "pending",
          invite_code: null,
        },
      ];

      axiosInstance.get.mockResolvedValue({ data: mockWaitlist });
      axiosInstance.patch.mockResolvedValue({ data: { message: "Approved!" } });

      render(<WaitlistAdmin />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /approve & email/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /approve & email/i }));

      await waitFor(() => {
        expect(axiosInstance.patch).toHaveBeenCalledWith("/admin/approve-creator", {
          email: "user@example.com",
        });
      });
    });

    it("shows success toast on approval", async () => {
      const user = userEvent.setup();
      const mockWaitlist = [
        {
          email: "user@example.com",
          full_name: "User",
          status: "pending",
          invite_code: null,
        },
      ];

      axiosInstance.get.mockResolvedValue({ data: mockWaitlist });
      axiosInstance.patch.mockResolvedValue({ data: { message: "User approved!" } });

      render(<WaitlistAdmin />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /approve & email/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /approve & email/i }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("User approved!");
      });
    });

    it("shows error toast on approval failure", async () => {
      const user = userEvent.setup();
      const mockWaitlist = [
        {
          email: "user@example.com",
          full_name: "User",
          status: "pending",
          invite_code: null,
        },
      ];

      axiosInstance.get.mockResolvedValue({ data: mockWaitlist });
      axiosInstance.patch.mockRejectedValue(new Error("Failed"));

      render(<WaitlistAdmin />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /approve & email/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /approve & email/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Approval failed.");
      });
    });
  });

  describe("Reset/Wipe Action", () => {
    it("shows confirmation before deleting", async () => {
      const user = userEvent.setup();
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
      const mockWaitlist = [
        {
          email: "user@example.com",
          full_name: "User",
          status: "pending",
          invite_code: null,
        },
      ];

      axiosInstance.get.mockResolvedValue({ data: mockWaitlist });

      render(<WaitlistAdmin />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /wipe user/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /wipe user/i }));

      expect(confirmSpy).toHaveBeenCalled();
      expect(axiosInstance.delete).not.toHaveBeenCalled();
    });

    it("calls delete endpoint when confirmed", async () => {
      const user = userEvent.setup();
      vi.spyOn(window, "confirm").mockReturnValue(true);
      const mockWaitlist = [
        {
          email: "user@example.com",
          full_name: "User",
          status: "pending",
          invite_code: null,
        },
      ];

      axiosInstance.get.mockResolvedValue({ data: mockWaitlist });
      axiosInstance.delete.mockResolvedValue({ data: { message: "User deleted" } });

      render(<WaitlistAdmin />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /wipe user/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /wipe user/i }));

      await waitFor(() => {
        expect(axiosInstance.delete).toHaveBeenCalledWith("/admin/reset-user", {
          data: { email: "user@example.com" },
        });
      });
    });

    it("shows info toast on successful delete", async () => {
      const user = userEvent.setup();
      vi.spyOn(window, "confirm").mockReturnValue(true);
      const mockWaitlist = [
        {
          email: "user@example.com",
          full_name: "User",
          status: "pending",
          invite_code: null,
        },
      ];

      axiosInstance.get.mockResolvedValue({ data: mockWaitlist });
      axiosInstance.delete.mockResolvedValue({ data: { message: "User removed" } });

      render(<WaitlistAdmin />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /wipe user/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /wipe user/i }));

      await waitFor(() => {
        expect(toast.info).toHaveBeenCalledWith("User removed");
      });
    });
  });

  describe("API Calls", () => {
    it("fetches waitlist on mount", async () => {
      axiosInstance.get.mockResolvedValue({ data: [] });

      render(<WaitlistAdmin />);

      await waitFor(() => {
        expect(axiosInstance.get).toHaveBeenCalledWith("/admin/waitlist-entries");
      });
    });

    it("refetches after approve action", async () => {
      const user = userEvent.setup();
      const mockWaitlist = [
        {
          email: "user@example.com",
          full_name: "User",
          status: "pending",
          invite_code: null,
        },
      ];

      axiosInstance.get.mockResolvedValue({ data: mockWaitlist });
      axiosInstance.patch.mockResolvedValue({ data: { message: "Approved" } });

      render(<WaitlistAdmin />);

      await waitFor(() => {
        expect(axiosInstance.get).toHaveBeenCalledTimes(1);
      });

      await user.click(screen.getByRole("button", { name: /approve & email/i }));

      await waitFor(() => {
        expect(axiosInstance.get).toHaveBeenCalledTimes(2);
      });
    });
  });
});
