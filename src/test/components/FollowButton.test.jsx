import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FollowButton from "../../components/FollowButton";

// Mock fetch
global.fetch = vi.fn();

describe("FollowButton Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Use the localStorage mock from setup.js
    localStorage.setItem("token", "mock-token");
  });

  describe("Rendering", () => {
    it("renders Follow button when not following", () => {
      render(<FollowButton targetUserId={123} initialIsFollowing={false} />);

      expect(screen.getByRole("button", { name: /follow/i })).toBeInTheDocument();
    });

    it("renders Unfollow button when following", () => {
      render(<FollowButton targetUserId={123} initialIsFollowing={true} />);

      expect(screen.getByRole("button", { name: /unfollow/i })).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("has correct styles when not following", () => {
      render(<FollowButton targetUserId={123} initialIsFollowing={false} />);

      const button = screen.getByRole("button");
      expect(button).toHaveStyle({ backgroundColor: "#007bff" });
    });

    it("has correct styles when following", () => {
      render(<FollowButton targetUserId={123} initialIsFollowing={true} />);

      const button = screen.getByRole("button");
      expect(button).toHaveStyle({ backgroundColor: "#ccc" });
    });
  });

  describe("Authentication Check", () => {
    it("shows alert when not logged in", async () => {
      localStorage.removeItem("token");
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
      const user = userEvent.setup();

      render(<FollowButton targetUserId={123} initialIsFollowing={false} />);

      await user.click(screen.getByRole("button"));

      expect(alertSpy).toHaveBeenCalledWith("You must be logged in to follow users.");
    });

    it("does not make API call when not logged in", async () => {
      localStorage.removeItem("token");
      vi.spyOn(window, "alert").mockImplementation(() => {});
      const user = userEvent.setup();

      render(<FollowButton targetUserId={123} initialIsFollowing={false} />);

      await user.click(screen.getByRole("button"));

      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe("Follow Action", () => {
    it("calls follow endpoint when clicking Follow", async () => {
      global.fetch.mockResolvedValue({ ok: true });
      const user = userEvent.setup();

      render(<FollowButton targetUserId={123} initialIsFollowing={false} />);

      await user.click(screen.getByRole("button", { name: /follow/i }));

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          "http://localhost:3010/api/users/123/follow",
          expect.objectContaining({
            method: "POST",
            headers: expect.objectContaining({
              Authorization: "Bearer mock-token",
            }),
          })
        );
      });
    });

    it("updates button to Unfollow after successful follow", async () => {
      global.fetch.mockResolvedValue({ ok: true });
      const user = userEvent.setup();

      render(<FollowButton targetUserId={123} initialIsFollowing={false} />);

      await user.click(screen.getByRole("button", { name: /follow/i }));

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /unfollow/i })).toBeInTheDocument();
      });
    });
  });

  describe("Unfollow Action", () => {
    it("calls unfollow endpoint when clicking Unfollow", async () => {
      global.fetch.mockResolvedValue({ ok: true });
      const user = userEvent.setup();

      render(<FollowButton targetUserId={123} initialIsFollowing={true} />);

      await user.click(screen.getByRole("button", { name: /unfollow/i }));

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          "http://localhost:3010/api/users/123/unfollow",
          expect.objectContaining({
            method: "DELETE",
          })
        );
      });
    });

    it("updates button to Follow after successful unfollow", async () => {
      global.fetch.mockResolvedValue({ ok: true });
      const user = userEvent.setup();

      render(<FollowButton targetUserId={123} initialIsFollowing={true} />);

      await user.click(screen.getByRole("button", { name: /unfollow/i }));

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /follow/i })).toBeInTheDocument();
      });
    });
  });

  describe("Loading State", () => {
    it("shows loading indicator while processing", async () => {
      global.fetch.mockImplementation(() => new Promise(() => {}));
      const user = userEvent.setup();

      render(<FollowButton targetUserId={123} initialIsFollowing={false} />);

      await user.click(screen.getByRole("button"));

      expect(screen.getByText("...")).toBeInTheDocument();
    });

    it("disables button while loading", async () => {
      global.fetch.mockImplementation(() => new Promise(() => {}));
      const user = userEvent.setup();

      render(<FollowButton targetUserId={123} initialIsFollowing={false} />);

      await user.click(screen.getByRole("button"));

      expect(screen.getByRole("button")).toBeDisabled();
    });
  });

  describe("Error Handling", () => {
    it("shows alert on API error", async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: "Already following" }),
      });
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
      const user = userEvent.setup();

      render(<FollowButton targetUserId={123} initialIsFollowing={false} />);

      await user.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith("Error: Already following");
      });
    });

    it("shows alert on network error", async () => {
      global.fetch.mockRejectedValue(new Error("Network error"));
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const user = userEvent.setup();

      render(<FollowButton targetUserId={123} initialIsFollowing={false} />);

      await user.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith("Something went wrong.");
      });

      consoleSpy.mockRestore();
    });

    it("does not toggle state on error", async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: "Error" }),
      });
      vi.spyOn(window, "alert").mockImplementation(() => {});
      const user = userEvent.setup();

      render(<FollowButton targetUserId={123} initialIsFollowing={false} />);

      await user.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /follow/i })).toBeInTheDocument();
      });
    });
  });
});
