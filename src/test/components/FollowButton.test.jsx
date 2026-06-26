// FollowButton uses axiosInstance + console.error now (previously
// used fetch + alert). Tests updated to match the current behavior.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FollowButton from "../../components/FollowButton";

vi.mock("../../utils/axiosInstance", () => ({
  default: {
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

import axiosInstance from "../../utils/axiosInstance";

describe("FollowButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("token", "mock-token");
  });

  describe("Rendering", () => {
    it("renders Follow button when not following", () => {
      render(
        <FollowButton targetUserId={123} initialIsFollowing={false} />,
      );
      expect(
        screen.getByRole("button", { name: /follow/i }),
      ).toBeInTheDocument();
    });

    it("renders Unfollow button when following", () => {
      render(<FollowButton targetUserId={123} initialIsFollowing={true} />);
      expect(
        screen.getByRole("button", { name: /unfollow/i }),
      ).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("blue background when not following", () => {
      render(
        <FollowButton targetUserId={123} initialIsFollowing={false} />,
      );
      expect(screen.getByRole("button")).toHaveStyle({
        backgroundColor: "#007bff",
      });
    });

    it("gray background when following", () => {
      render(<FollowButton targetUserId={123} initialIsFollowing={true} />);
      expect(screen.getByRole("button")).toHaveStyle({
        backgroundColor: "#ccc",
      });
    });
  });

  describe("Authentication", () => {
    it("does not POST when no token is in localStorage", async () => {
      localStorage.removeItem("token");
      const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      render(
        <FollowButton targetUserId={123} initialIsFollowing={false} />,
      );
      await userEvent.click(screen.getByRole("button"));

      expect(axiosInstance.post).not.toHaveBeenCalled();
      expect(errSpy).toHaveBeenCalledWith(
        expect.stringContaining("No auth token"),
      );
    });
  });

  describe("Follow", () => {
    it("posts /users/:id/follow and flips to Unfollow", async () => {
      axiosInstance.post.mockResolvedValueOnce({});
      render(
        <FollowButton targetUserId={123} initialIsFollowing={false} />,
      );
      await userEvent.click(screen.getByRole("button", { name: /follow/i }));
      await waitFor(() => {
        expect(axiosInstance.post).toHaveBeenCalledWith("/users/123/follow");
      });
      expect(
        await screen.findByRole("button", { name: /unfollow/i }),
      ).toBeInTheDocument();
    });
  });

  describe("Unfollow", () => {
    it("deletes /users/:id/unfollow and flips to Follow", async () => {
      axiosInstance.delete.mockResolvedValueOnce({});
      render(<FollowButton targetUserId={123} initialIsFollowing={true} />);
      await userEvent.click(
        screen.getByRole("button", { name: /unfollow/i }),
      );
      await waitFor(() => {
        expect(axiosInstance.delete).toHaveBeenCalledWith(
          "/users/123/unfollow",
        );
      });
      expect(
        await screen.findByRole("button", { name: /^follow$/i }),
      ).toBeInTheDocument();
    });
  });

  describe("Error handling", () => {
    it("logs an error and keeps the button state when API fails", async () => {
      const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      axiosInstance.post.mockRejectedValueOnce({
        response: { data: { message: "Already following" } },
      });

      render(
        <FollowButton targetUserId={123} initialIsFollowing={false} />,
      );
      await userEvent.click(screen.getByRole("button", { name: /follow/i }));

      await waitFor(() => {
        expect(errSpy).toHaveBeenCalledWith(
          "Follow error:",
          "Already following",
        );
      });
      // State unchanged on failure.
      expect(
        screen.getByRole("button", { name: /follow/i }),
      ).toBeInTheDocument();
    });
  });
});
