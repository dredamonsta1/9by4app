import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import ImageFeed from "../../components/ImageFeed/ImageFeed";

// Mock axiosInstance
vi.mock("../../utils/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock CSS module
vi.mock("../../components/ImageFeed/ImageFeed.module.css", () => ({
  default: {
    imageFeedContainer: "imageFeedContainer",
    mainContent: "mainContent",
    headerSection: "headerSection",
    imagePostCreator: "imagePostCreator",
    creatorTitle: "creatorTitle",
    feedList: "feedList",
    imagePostItem: "imagePostItem",
    postHeader: "postHeader",
    username: "username",
    deleteButton: "deleteButton",
    imageWrapper: "imageWrapper",
    postImage: "postImage",
    caption: "caption",
    emptyState: "emptyState",
    errorContainer: "errorContainer",
    errorMessage: "errorMessage",
    skeletonWrapper: "skeletonWrapper",
    skeletonHeader: "skeletonHeader",
    skeletonImage: "skeletonImage",
    skeletonText: "skeletonText",
    previewContainer: "previewContainer",
    previewImage: "previewImage",
    clearButton: "clearButton",
    fileInputLabel: "fileInputLabel",
    fileInput: "fileInput",
    fileInputText: "fileInputText",
    captionInput: "captionInput",
    uploadButton: "uploadButton",
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

const renderImageFeed = (userId = 1) => {
  const store = createMockStore(userId);
  return render(
    <Provider store={store}>
      <ImageFeed />
    </Provider>
  );
};

describe("ImageFeed Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Loading State", () => {
    it("shows loading skeletons while fetching", () => {
      axiosInstance.get.mockImplementation(() => new Promise(() => {}));

      renderImageFeed();

      const skeletons = document.querySelectorAll(".skeletonWrapper");
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe("Error State", () => {
    it("displays error message on fetch failure", async () => {
      axiosInstance.get.mockRejectedValue(new Error("Network error"));

      renderImageFeed();

      await waitFor(() => {
        expect(screen.getByText(/failed to load feed/i)).toBeInTheDocument();
      });
    });
  });

  describe("Empty State", () => {
    it("shows empty state message when no images", async () => {
      axiosInstance.get.mockResolvedValue({ data: [] });

      renderImageFeed();

      await waitFor(() => {
        expect(screen.getByText(/no images yet/i)).toBeInTheDocument();
      });
    });
  });

  describe("Rendering", () => {
    it("renders header and title", async () => {
      axiosInstance.get.mockResolvedValue({ data: [] });

      renderImageFeed();

      await waitFor(() => {
        expect(screen.getByText("Image Feed")).toBeInTheDocument();
      });
    });

    it("renders image post creator", async () => {
      axiosInstance.get.mockResolvedValue({ data: [] });

      renderImageFeed();

      await waitFor(() => {
        expect(screen.getByText("Share an Image")).toBeInTheDocument();
      });
    });
  });

  describe("Image Posts Display", () => {
    const mockPosts = [
      {
        post_id: 1,
        image_url: "/uploads/image1.jpg",
        caption: "First image",
        user_id: 1,
        username: "testuser",
      },
      {
        post_id: 2,
        image_url: "https://example.com/image2.jpg",
        caption: "Second image",
        user_id: 2,
        username: "otheruser",
      },
    ];

    it("renders image posts with captions", async () => {
      axiosInstance.get.mockResolvedValue({ data: mockPosts });

      renderImageFeed();

      await waitFor(() => {
        expect(screen.getByText("First image")).toBeInTheDocument();
        expect(screen.getByText("Second image")).toBeInTheDocument();
      });
    });

    it("shows delete button only for own posts", async () => {
      axiosInstance.get.mockResolvedValue({ data: mockPosts });

      renderImageFeed();

      await waitFor(() => {
        const deleteButtons = screen.getAllByText("Delete");
        expect(deleteButtons.length).toBe(1);
      });
    });

    it("renders images with correct alt text", async () => {
      axiosInstance.get.mockResolvedValue({ data: mockPosts });

      renderImageFeed();

      await waitFor(() => {
        const images = screen.getAllByRole("img");
        expect(images.some((img) => img.alt === "First image")).toBe(true);
      });
    });

    it("handles different response formats", async () => {
      axiosInstance.get.mockResolvedValue({ data: { data: mockPosts } });

      renderImageFeed();

      await waitFor(() => {
        expect(screen.getByText("First image")).toBeInTheDocument();
      });
    });
  });

  describe("Image Post Creator", () => {
    it("renders file upload input", async () => {
      axiosInstance.get.mockResolvedValue({ data: [] });

      renderImageFeed();

      await waitFor(() => {
        expect(screen.getByText(/click to select image/i)).toBeInTheDocument();
      });
    });

    it("renders caption input", async () => {
      axiosInstance.get.mockResolvedValue({ data: [] });

      renderImageFeed();

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/add a caption/i)).toBeInTheDocument();
      });
    });

    it("renders disabled upload button when no file selected", async () => {
      axiosInstance.get.mockResolvedValue({ data: [] });

      renderImageFeed();

      await waitFor(() => {
        const uploadButton = screen.getByRole("button", { name: /post image/i });
        expect(uploadButton).toBeDisabled();
      });
    });
  });

  describe("API Calls", () => {
    it("fetches image posts on mount", async () => {
      axiosInstance.get.mockResolvedValue({ data: [] });

      renderImageFeed();

      await waitFor(() => {
        expect(axiosInstance.get).toHaveBeenCalledWith("/image-posts");
      });
    });
  });

  describe("Post Deletion", () => {
    it("calls delete endpoint when delete confirmed", async () => {
      const user = userEvent.setup();
      const mockPosts = [
        {
          post_id: 1,
          image_url: "/uploads/test.jpg",
          caption: "Test image",
          user_id: 1,
          username: "testuser",
        },
      ];

      axiosInstance.get.mockResolvedValue({ data: mockPosts });
      axiosInstance.delete.mockResolvedValue({ data: {} });

      vi.spyOn(window, "confirm").mockReturnValue(true);

      renderImageFeed();

      await waitFor(() => {
        expect(screen.getByText("Test image")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Delete"));

      await waitFor(() => {
        expect(axiosInstance.delete).toHaveBeenCalledWith("/image-posts/1");
      });
    });
  });
});
