import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WaitlistManager from "../../components/Admin/WaitlistManager";

// Mock axiosInstance
vi.mock("../../utils/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

// Mock CSS module
vi.mock("../../components/Admin/WaitlistManager.module.css", () => ({
  default: {
    managerContainer: "managerContainer",
    header: "header",
    refreshBtn: "refreshBtn",
    table: "table",
    statusBadge: "statusBadge",
    pending: "pending",
    approved: "approved",
    codeWrapper: "codeWrapper",
    copyBtn: "copyBtn",
    approveBtn: "approveBtn",
  },
}));

// Mock clipboard API
const mockWriteText = vi.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

import axiosInstance from "../../utils/axiosInstance";

describe("WaitlistManager Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWriteText.mockResolvedValue(undefined);
  });

  describe("Loading State", () => {
    it("shows loading message while fetching", () => {
      axiosInstance.get.mockImplementation(() => new Promise(() => {}));

      render(<WaitlistManager />);

      expect(screen.getByText(/loading prospective creators/i)).toBeInTheDocument();
    });
  });

  describe("Header", () => {
    it("renders title", async () => {
      axiosInstance.get.mockResolvedValue({ data: [] });

      render(<WaitlistManager />);

      await waitFor(() => {
        expect(screen.getByText("Waitlist Management")).toBeInTheDocument();
      });
    });

    it("renders refresh button", async () => {
      axiosInstance.get.mockResolvedValue({ data: [] });

      render(<WaitlistManager />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /refresh/i })).toBeInTheDocument();
      });
    });

    it("refreshes data when refresh button clicked", async () => {
      const user = userEvent.setup();
      axiosInstance.get.mockResolvedValue({ data: [] });

      render(<WaitlistManager />);

      await waitFor(() => {
        expect(axiosInstance.get).toHaveBeenCalledTimes(1);
      });

      await user.click(screen.getByRole("button", { name: /refresh/i }));

      await waitFor(() => {
        expect(axiosInstance.get).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("Table Structure", () => {
    it("renders table headers", async () => {
      axiosInstance.get.mockResolvedValue({ data: [] });

      render(<WaitlistManager />);

      await waitFor(() => {
        expect(screen.getByText("Name")).toBeInTheDocument();
        expect(screen.getByText("Email")).toBeInTheDocument();
        expect(screen.getByText("Status")).toBeInTheDocument();
        expect(screen.getByText("Invite Code")).toBeInTheDocument();
        expect(screen.getByText("Action")).toBeInTheDocument();
      });
    });
  });

  describe("Entry Display", () => {
    const mockEntries = [
      {
        email: "pending@example.com",
        full_name: "Pending User",
        status: "pending",
        invite_code: null,
      },
      {
        email: "approved@example.com",
        full_name: "Approved User",
        status: "approved",
        invite_code: "XYZ789",
      },
    ];

    it("renders entry data", async () => {
      axiosInstance.get.mockResolvedValue({ data: mockEntries });

      render(<WaitlistManager />);

      await waitFor(() => {
        expect(screen.getByText("Pending User")).toBeInTheDocument();
        expect(screen.getByText("pending@example.com")).toBeInTheDocument();
        expect(screen.getByText("Approved User")).toBeInTheDocument();
        expect(screen.getByText("approved@example.com")).toBeInTheDocument();
      });
    });

    it("displays status badges", async () => {
      axiosInstance.get.mockResolvedValue({ data: mockEntries });

      render(<WaitlistManager />);

      await waitFor(() => {
        expect(screen.getByText("pending")).toBeInTheDocument();
        expect(screen.getByText("approved")).toBeInTheDocument();
      });
    });

    it("shows invite code for approved entries", async () => {
      axiosInstance.get.mockResolvedValue({ data: mockEntries });

      render(<WaitlistManager />);

      await waitFor(() => {
        expect(screen.getByText("XYZ789")).toBeInTheDocument();
      });
    });

    it("shows dash for pending entries without code", async () => {
      axiosInstance.get.mockResolvedValue({ data: mockEntries });

      render(<WaitlistManager />);

      await waitFor(() => {
        expect(screen.getByText("—")).toBeInTheDocument();
      });
    });

    it("shows approve button only for pending entries", async () => {
      axiosInstance.get.mockResolvedValue({ data: mockEntries });

      render(<WaitlistManager />);

      await waitFor(() => {
        const approveButtons = screen.getAllByRole("button", { name: /approve & generate/i });
        expect(approveButtons).toHaveLength(1);
      });
    });
  });

  describe("Copy Functionality", () => {
    it("renders copy button for invite codes", async () => {
      const mockEntries = [
        {
          email: "test@example.com",
          full_name: "Test User",
          status: "approved",
          invite_code: "ABC123",
        },
      ];

      axiosInstance.get.mockResolvedValue({ data: mockEntries });

      render(<WaitlistManager />);

      await waitFor(() => {
        expect(screen.getByText("ABC123")).toBeInTheDocument();
      });

      expect(screen.getByTitle("Copy Code")).toBeInTheDocument();
    });
  });

  describe("Approve Action", () => {
    it("calls approve endpoint", async () => {
      const user = userEvent.setup();
      const mockEntries = [
        {
          email: "pending@example.com",
          full_name: "Pending User",
          status: "pending",
          invite_code: null,
        },
      ];

      axiosInstance.get.mockResolvedValue({ data: mockEntries });
      axiosInstance.patch.mockResolvedValue({ data: { message: "Approved!" } });

      // We need to mock toast since WaitlistManager uses it
      vi.mock("react-toastify", () => ({
        toast: {
          success: vi.fn(),
        },
      }));

      render(<WaitlistManager />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /approve & generate/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /approve & generate/i }));

      await waitFor(() => {
        expect(axiosInstance.patch).toHaveBeenCalledWith("/admin/approve-creator", {
          email: "pending@example.com",
        });
      });
    });
  });

  describe("API Calls", () => {
    it("fetches entries on mount", async () => {
      axiosInstance.get.mockResolvedValue({ data: [] });

      render(<WaitlistManager />);

      await waitFor(() => {
        expect(axiosInstance.get).toHaveBeenCalledWith("/admin/waitlist-entries");
      });
    });
  });
});
