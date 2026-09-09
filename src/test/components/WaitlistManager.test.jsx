import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WaitlistManager from "../../components/Admin/WaitlistManager";
import { toast } from "react-toastify";

vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

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
        expect(screen.getAllByText("—").length).toBeGreaterThan(0);
      });
      // Invite Code is the 4th column; a pending row has no code.
      const pendingRow = screen.getByText("pending").closest("tr");
      expect(pendingRow.querySelectorAll("td")[3]).toHaveTextContent("—");
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

describe("WaitlistManager — reissue and expiry", () => {
  const approved = (over = {}) => ({
    waitlist_id: 90,
    email: "old@example.com",
    full_name: "Old Approval",
    status: "approved",
    invite_code: "RNYYSJUG",
    created_at: "2026-07-01T00:00:00Z",
    approved_at: null,
    ...over,
  });

  const daysAgo = (d) => new Date(Date.now() - d * 86400000).toISOString();

  beforeEach(() => vi.clearAllMocks());

  it("offers Reissue on an approved entry", async () => {
    // Previously the only action was Approve, and it rendered for pending
    // rows only — so an approved invite had no action at all.
    axiosInstance.get.mockResolvedValue({ data: [approved()] });
    render(<WaitlistManager />);

    expect(await screen.findByRole("button", { name: /reissue/i })).toBeInTheDocument();
  });

  it("confirms before invalidating a live code", async () => {
    const user = userEvent.setup({ delay: null });
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    axiosInstance.get.mockResolvedValue({ data: [approved()] });
    render(<WaitlistManager />);

    await user.click(await screen.findByRole("button", { name: /reissue/i }));

    expect(confirmSpy).toHaveBeenCalled();
    expect(axiosInstance.patch).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it("reissues through the same endpoint as approve", async () => {
    const user = userEvent.setup({ delay: null });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    axiosInstance.get.mockResolvedValue({ data: [approved()] });
    axiosInstance.patch.mockResolvedValue({ data: { message: "sent" } });
    render(<WaitlistManager />);

    await user.click(await screen.findByRole("button", { name: /reissue/i }));

    await waitFor(() =>
      expect(axiosInstance.patch).toHaveBeenCalledWith("/admin/approve-creator", {
        email: "old@example.com",
      })
    );
  });

  it("says 'no expiry' for approvals made before expiry existed", async () => {
    // approved_at is NULL on every row approved before 2026-09-09, and the
    // API treats NULL as never-expiring. Saying so beats a blank cell.
    axiosInstance.get.mockResolvedValue({ data: [approved({ approved_at: null })] });
    render(<WaitlistManager />);

    expect(await screen.findByText(/no expiry/i)).toBeInTheDocument();
  });

  it("counts down a live invite", async () => {
    axiosInstance.get.mockResolvedValue({ data: [approved({ approved_at: daysAgo(2) })] });
    render(<WaitlistManager />);

    expect(await screen.findByText(/28 days left/i)).toBeInTheDocument();
  });

  it("marks a lapsed invite expired", async () => {
    axiosInstance.get.mockResolvedValue({ data: [approved({ approved_at: daysAgo(31) })] });
    render(<WaitlistManager />);

    expect(await screen.findByText(/expired/i)).toBeInTheDocument();
  });

  it("surfaces a failed approval instead of only logging it", async () => {
    // The old handler swallowed errors into console.error, so a failed
    // invite looked identical to a sent one.
    const user = userEvent.setup({ delay: null });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    axiosInstance.get.mockResolvedValue({ data: [approved()] });
    axiosInstance.patch.mockRejectedValue({ response: { data: { message: "Resend down." } } });
    render(<WaitlistManager />);

    await user.click(await screen.findByRole("button", { name: /reissue/i }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Resend down."));
  });
});
