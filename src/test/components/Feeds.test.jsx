import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Feeds from "../../components/Feeds/Feeds";

// Mock axiosInstance
vi.mock("../../utils/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Mock CSS module
vi.mock("../../components/Feeds/Feeds.module.css", () => ({
  default: {},
}));

import axiosInstance from "../../utils/axiosInstance";

describe("Feeds Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Loading State", () => {
    it("shows loading message while fetching posts", () => {
      axiosInstance.get.mockImplementation(() => new Promise(() => {}));

      render(<Feeds />);

      expect(screen.getByText(/loading posts/i)).toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    it("displays error message on fetch failure", async () => {
      axiosInstance.get.mockRejectedValue(new Error("Network error"));

      render(<Feeds />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load posts/i)).toBeInTheDocument();
      });
    });
  });

  describe("Empty State", () => {
    it("shows empty state message when no posts", async () => {
      axiosInstance.get.mockResolvedValue({ data: [] });

      render(<Feeds />);

      await waitFor(() => {
        expect(screen.getByText(/no posts yet/i)).toBeInTheDocument();
      });
    });
  });

  describe("Header", () => {
    it("renders title", async () => {
      axiosInstance.get.mockResolvedValue({ data: [] });

      render(<Feeds />);

      await waitFor(() => {
        expect(screen.getByText("Feeds")).toBeInTheDocument();
      });
    });

    it("displays client ID", async () => {
      axiosInstance.get.mockResolvedValue({ data: [] });

      render(<Feeds />);

      await waitFor(() => {
        expect(screen.getByText(/your client id/i)).toBeInTheDocument();
        expect(screen.getByText("anonymous-client-id")).toBeInTheDocument();
      });
    });
  });

  describe("Posts Display", () => {
    const mockPosts = [
      {
        id: 1,
        user_id: "user1",
        content: "First post content",
        timestamp: new Date().toISOString(),
      },
      {
        id: 2,
        user_id: "user2",
        content: "Second post content",
        timestamp: new Date().toISOString(),
      },
    ];

    it("renders posts", async () => {
      axiosInstance.get.mockResolvedValue({ data: mockPosts });

      render(<Feeds />);

      await waitFor(() => {
        expect(screen.getByText("First post content")).toBeInTheDocument();
        expect(screen.getByText("Second post content")).toBeInTheDocument();
      });
    });

    it("displays user IDs", async () => {
      axiosInstance.get.mockResolvedValue({ data: mockPosts });

      render(<Feeds />);

      await waitFor(() => {
        expect(screen.getByText("user1")).toBeInTheDocument();
        expect(screen.getByText("user2")).toBeInTheDocument();
      });
    });

    it("handles different response formats", async () => {
      axiosInstance.get.mockResolvedValue({ data: { data: mockPosts } });

      render(<Feeds />);

      await waitFor(() => {
        expect(screen.getByText("First post content")).toBeInTheDocument();
      });
    });

    it("handles posts array format", async () => {
      axiosInstance.get.mockResolvedValue({ data: { posts: mockPosts } });

      render(<Feeds />);

      await waitFor(() => {
        expect(screen.getByText("First post content")).toBeInTheDocument();
      });
    });
  });

  describe("Post Creator", () => {
    it("renders post creator form", async () => {
      axiosInstance.get.mockResolvedValue({ data: [] });

      render(<Feeds />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/what's on your mind/i)).toBeInTheDocument();
      });
    });

    it("renders post button", async () => {
      axiosInstance.get.mockResolvedValue({ data: [] });

      render(<Feeds />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /^post$/i })).toBeInTheDocument();
      });
    });

    it("allows typing in textarea", async () => {
      const user = userEvent.setup();
      axiosInstance.get.mockResolvedValue({ data: [] });

      render(<Feeds />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/what's on your mind/i)).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/what's on your mind/i);
      await user.type(textarea, "New post content");

      expect(textarea).toHaveValue("New post content");
    });

    it("shows alert when submitting empty post", async () => {
      const user = userEvent.setup();
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
      axiosInstance.get.mockResolvedValue({ data: [] });

      render(<Feeds />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /^post$/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /^post$/i }));

      expect(alertSpy).toHaveBeenCalledWith("Please enter some text to post.");
    });

    it("submits new post", async () => {
      const user = userEvent.setup();
      axiosInstance.get.mockResolvedValue({ data: [] });
      axiosInstance.post.mockResolvedValue({ data: {} });

      render(<Feeds />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/what's on your mind/i)).toBeInTheDocument();
      });

      await user.type(screen.getByPlaceholderText(/what's on your mind/i), "New post");
      await user.click(screen.getByRole("button", { name: /^post$/i }));

      await waitFor(() => {
        expect(axiosInstance.post).toHaveBeenCalledWith("/posts", { content: "New post" });
      });
    });

    it("clears textarea after successful post", async () => {
      const user = userEvent.setup();
      axiosInstance.get.mockResolvedValue({ data: [] });
      axiosInstance.post.mockResolvedValue({ data: {} });

      render(<Feeds />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/what's on your mind/i)).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/what's on your mind/i);
      await user.type(textarea, "New post");
      await user.click(screen.getByRole("button", { name: /^post$/i }));

      await waitFor(() => {
        expect(textarea).toHaveValue("");
      });
    });
  });

  describe("Comments", () => {
    const mockPost = {
      id: 1,
      user_id: "user1",
      content: "Test post",
      timestamp: new Date().toISOString(),
    };

    it("shows view comments button", async () => {
      axiosInstance.get.mockResolvedValue({ data: [mockPost] });

      render(<Feeds />);

      await waitFor(() => {
        expect(screen.getByText(/view comments/i)).toBeInTheDocument();
      });
    });

    it("toggles comments visibility", async () => {
      const user = userEvent.setup();
      axiosInstance.get
        .mockResolvedValueOnce({ data: [mockPost] })
        .mockResolvedValueOnce({ data: [] });

      render(<Feeds />);

      await waitFor(() => {
        expect(screen.getByText(/view comments/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/view comments/i));

      await waitFor(() => {
        expect(screen.getByText(/hide comments/i)).toBeInTheDocument();
      });
    });
  });

  describe("API Calls", () => {
    it("fetches posts on mount", async () => {
      axiosInstance.get.mockResolvedValue({ data: [] });

      render(<Feeds />);

      await waitFor(() => {
        expect(axiosInstance.get).toHaveBeenCalledWith("/posts");
      });
    });

    it("refetches after creating post", async () => {
      const user = userEvent.setup();
      axiosInstance.get.mockResolvedValue({ data: [] });
      axiosInstance.post.mockResolvedValue({ data: {} });

      render(<Feeds />);

      await waitFor(() => {
        expect(axiosInstance.get).toHaveBeenCalledTimes(1);
      });

      await user.type(screen.getByPlaceholderText(/what's on your mind/i), "New post");
      await user.click(screen.getByRole("button", { name: /^post$/i }));

      await waitFor(() => {
        expect(axiosInstance.get).toHaveBeenCalledTimes(2);
      });
    });
  });
});
