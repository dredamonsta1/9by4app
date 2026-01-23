import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import Feed from "../../components/Feed/Feed";

// Mock axiosInstance
vi.mock("../../utils/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock CSS module
vi.mock("../../components/Feed/Feed.module.css", () => ({
  default: {
    feedContainer: "feedContainer",
    feedContent: "feedContent",
    feedTitle: "feedTitle",
    postCreator: "postCreator",
    typeToggle: "typeToggle",
    toggleBtn: "toggleBtn",
    active: "active",
    textInput: "textInput",
    submitBtn: "submitBtn",
    postsList: "postsList",
    postItem: "postItem",
    postHeader: "postHeader",
    userInfo: "userInfo",
    username: "username",
    timestamp: "timestamp",
    postActions: "postActions",
    postTypeBadge: "postTypeBadge",
    deleteBtn: "deleteBtn",
    textContent: "textContent",
    imageWrapper: "imageWrapper",
    postImage: "postImage",
    caption: "caption",
    emptyState: "emptyState",
    errorContainer: "errorContainer",
    errorMessage: "errorMessage",
    skeletonWrapper: "skeletonWrapper",
    skeletonHeader: "skeletonHeader",
    skeletonContent: "skeletonContent",
    previewContainer: "previewContainer",
    previewImage: "previewImage",
    clearButton: "clearButton",
    fileInputLabel: "fileInputLabel",
    fileInput: "fileInput",
    fileInputText: "fileInputText",
  },
}));

import axiosInstance from "../../utils/axiosInstance";

const createMockStore = (userId = 1) => {
  return configureStore({
    reducer: {
      auth: () => ({
        user: { id: userId, username: "testuser", role: "user" },
        token: "mock-token",
      }),
    },
  });
};

const renderFeed = (userId = 1) => {
  const store = createMockStore(userId);
  return render(
    <Provider store={store}>
      <Feed />
    </Provider>
  );
};

describe("Feed Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Loading State", () => {
    it("shows loading skeletons while fetching", () => {
      axiosInstance.get.mockImplementation(() => new Promise(() => {}));

      renderFeed();

      const skeletons = document.querySelectorAll(".skeletonWrapper");
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe("Error State", () => {
    it("displays error message on fetch failure", async () => {
      axiosInstance.get.mockRejectedValue(new Error("Network error"));

      renderFeed();

      await waitFor(() => {
        expect(screen.getByText(/failed to load feed/i)).toBeInTheDocument();
      });
    });
  });

  describe("Empty State", () => {
    it("shows empty state message when no posts", async () => {
      axiosInstance.get.mockResolvedValue({ data: [] });

      renderFeed();

      await waitFor(() => {
        expect(screen.getByText(/no posts yet/i)).toBeInTheDocument();
      });
    });
  });

  describe("Posts Display", () => {
    const mockPosts = [
      {
        id: 1,
        post_type: "text",
        content: "Hello world",
        user_id: 1,
        username: "testuser",
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        post_type: "image",
        image_url: "/uploads/test.jpg",
        caption: "Test caption",
        user_id: 2,
        username: "otheruser",
        created_at: new Date().toISOString(),
      },
    ];

    it("renders text posts correctly", async () => {
      axiosInstance.get.mockResolvedValue({ data: mockPosts });

      renderFeed();

      await waitFor(() => {
        expect(screen.getByText("Hello world")).toBeInTheDocument();
      });
    });

    it("renders image posts with caption", async () => {
      axiosInstance.get.mockResolvedValue({ data: mockPosts });

      renderFeed();

      await waitFor(() => {
        expect(screen.getByText("Test caption")).toBeInTheDocument();
      });
    });

    it("shows delete button only for own posts", async () => {
      axiosInstance.get.mockResolvedValue({ data: mockPosts });

      renderFeed();

      await waitFor(() => {
        const deleteButtons = screen.getAllByText("Delete");
        expect(deleteButtons.length).toBe(1);
      });
    });

    it("handles posts array in different response formats", async () => {
      axiosInstance.get.mockResolvedValue({ data: { posts: mockPosts } });

      renderFeed();

      await waitFor(() => {
        expect(screen.getByText("Hello world")).toBeInTheDocument();
      });
    });
  });

  describe("Post Creator", () => {
    it("renders post creator with toggle buttons", async () => {
      axiosInstance.get.mockResolvedValue({ data: [] });

      renderFeed();

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /text/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /image/i })).toBeInTheDocument();
      });
    });

    it("shows text input by default", async () => {
      axiosInstance.get.mockResolvedValue({ data: [] });

      renderFeed();

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/what's on your mind/i)).toBeInTheDocument();
      });
    });

    it("switches to image mode when image button clicked", async () => {
      const user = userEvent.setup();
      axiosInstance.get.mockResolvedValue({ data: [] });

      renderFeed();

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/what's on your mind/i)).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /image/i }));

      expect(screen.getByText(/click to select image/i)).toBeInTheDocument();
    });

    it("submits text post", async () => {
      const user = userEvent.setup();
      axiosInstance.get.mockResolvedValue({ data: [] });
      axiosInstance.post.mockResolvedValue({ data: {} });

      renderFeed();

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/what's on your mind/i)).toBeInTheDocument();
      });

      await user.type(screen.getByPlaceholderText(/what's on your mind/i), "New post content");
      await user.click(screen.getByRole("button", { name: /^post$/i }));

      await waitFor(() => {
        expect(axiosInstance.post).toHaveBeenCalledWith("/feed/text", {
          content: "New post content",
        });
      });
    });

    it("shows error when submitting empty text post", async () => {
      const user = userEvent.setup();
      axiosInstance.get.mockResolvedValue({ data: [] });

      renderFeed();

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/what's on your mind/i)).toBeInTheDocument();
      });

      const postButton = screen.getByRole("button", { name: /^post$/i });
      expect(postButton).toBeDisabled();
    });
  });

  describe("Post Deletion", () => {
    it("calls delete endpoint when delete confirmed", async () => {
      const user = userEvent.setup();
      const mockPosts = [
        {
          id: 1,
          post_type: "text",
          content: "Test post",
          user_id: 1,
          username: "testuser",
          created_at: new Date().toISOString(),
        },
      ];

      axiosInstance.get.mockResolvedValue({ data: mockPosts });
      axiosInstance.delete.mockResolvedValue({ data: {} });

      // Mock window.confirm
      vi.spyOn(window, "confirm").mockReturnValue(true);

      renderFeed();

      await waitFor(() => {
        expect(screen.getByText("Test post")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Delete"));

      await waitFor(() => {
        expect(axiosInstance.delete).toHaveBeenCalledWith("/feed/text/1");
      });
    });
  });

  describe("API Calls", () => {
    it("fetches posts on mount", async () => {
      axiosInstance.get.mockResolvedValue({ data: [] });

      renderFeed();

      await waitFor(() => {
        expect(axiosInstance.get).toHaveBeenCalledWith("/feed");
      });
    });

    it("refetches posts after creating a new post", async () => {
      const user = userEvent.setup();
      axiosInstance.get.mockResolvedValue({ data: [] });
      axiosInstance.post.mockResolvedValue({ data: {} });

      renderFeed();

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
