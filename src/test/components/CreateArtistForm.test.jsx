import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateArtistForm from "../../components/CreateArtistForm/CreateArtistForm";

// Mock axiosInstance
vi.mock("../../utils/axiosInstance", () => ({
  default: {
    post: vi.fn(),
  },
}));

// Mock CSS module
vi.mock("../../components/CreateArtistForm/CreateArtistForm.module.css", () => ({
  default: {
    createArtistForm: "createArtistForm",
    title: "title",
    success: "success",
    error: "error",
    artistNameLabel: "artistNameLabel",
    artistNameInput: "artistNameInput",
    genreInputContainer: "genreInputContainer",
    genreLabel: "genreLabel",
    genreInput: "genreInput",
    imageInputContainer: "imageInputContainer",
    artistImageLabel: "artistImageLabel",
    artistImageInput: "artistImageInput",
    createArtistSubmitButton: "createArtistSubmitButton",
  },
}));

import axiosInstance from "../../utils/axiosInstance";

describe("CreateArtistForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders the form title", () => {
      render(<CreateArtistForm />);

      expect(screen.getByText("Create New Artist")).toBeInTheDocument();
    });

    it("renders artist name label and input", () => {
      const { container } = render(<CreateArtistForm />);

      expect(screen.getByText(/artist name/i)).toBeInTheDocument();
      expect(container.querySelector(".artistNameInput")).toBeInTheDocument();
    });

    it("renders genre label and input", () => {
      render(<CreateArtistForm />);

      expect(screen.getByText(/genre/i)).toBeInTheDocument();
    });

    it("renders image input", () => {
      render(<CreateArtistForm />);

      expect(screen.getByText(/artist image/i)).toBeInTheDocument();
    });

    it("renders submit button", () => {
      render(<CreateArtistForm />);

      expect(screen.getByRole("button", { name: /create artist/i })).toBeInTheDocument();
    });
  });

  describe("Form Interaction", () => {
    it("allows typing in artist name field", async () => {
      const user = userEvent.setup();
      const { container } = render(<CreateArtistForm />);

      const nameInput = container.querySelector(".artistNameInput");
      await user.type(nameInput, "New Artist");

      expect(nameInput).toHaveValue("New Artist");
    });

    it("allows typing in genre field", async () => {
      const user = userEvent.setup();
      const { container } = render(<CreateArtistForm />);

      const genreInput = container.querySelector(".genreInput");
      await user.type(genreInput, "Hip Hop");

      expect(genreInput).toHaveValue("Hip Hop");
    });

    it("accepts image file upload", async () => {
      const user = userEvent.setup();
      render(<CreateArtistForm />);

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
      const fileInput = document.getElementById("artistImageInput");

      await user.upload(fileInput, file);

      expect(fileInput.files[0]).toBe(file);
      expect(fileInput.files).toHaveLength(1);
    });
  });

  describe("Form Submission", () => {
    it("submits form without image", async () => {
      const user = userEvent.setup();
      axiosInstance.post.mockResolvedValue({
        data: { message: "Artist created successfully!" },
      });

      const { container } = render(<CreateArtistForm />);

      const nameInput = container.querySelector(".artistNameInput");
      const genreInput = container.querySelector(".genreInput");

      await user.type(nameInput, "New Artist");
      await user.type(genreInput, "Rock");
      await user.click(screen.getByRole("button", { name: /create artist/i }));

      await waitFor(() => {
        expect(axiosInstance.post).toHaveBeenCalledWith(
          "/",
          expect.objectContaining({
            artist_name: "New Artist",
            genre: "Rock",
            count: 0,
            image_url: null,
          })
        );
      });
    });

    it("shows loading state during submission", async () => {
      const user = userEvent.setup();
      axiosInstance.post.mockImplementation(() => new Promise(() => {}));

      const { container } = render(<CreateArtistForm />);

      const nameInput = container.querySelector(".artistNameInput");
      const genreInput = container.querySelector(".genreInput");

      await user.type(nameInput, "New Artist");
      await user.type(genreInput, "Rock");
      await user.click(screen.getByRole("button", { name: /create artist/i }));

      expect(screen.getByRole("button", { name: /submitting/i })).toBeInTheDocument();
    });

    it("disables button during submission", async () => {
      const user = userEvent.setup();
      axiosInstance.post.mockImplementation(() => new Promise(() => {}));

      const { container } = render(<CreateArtistForm />);

      const nameInput = container.querySelector(".artistNameInput");
      const genreInput = container.querySelector(".genreInput");

      await user.type(nameInput, "New Artist");
      await user.type(genreInput, "Rock");
      await user.click(screen.getByRole("button", { name: /create artist/i }));

      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("shows success message on successful creation", async () => {
      const user = userEvent.setup();
      axiosInstance.post.mockResolvedValue({
        data: { message: "Artist created successfully!" },
      });

      const { container } = render(<CreateArtistForm />);

      const nameInput = container.querySelector(".artistNameInput");
      const genreInput = container.querySelector(".genreInput");

      await user.type(nameInput, "New Artist");
      await user.type(genreInput, "Rock");
      await user.click(screen.getByRole("button", { name: /create artist/i }));

      await waitFor(() => {
        expect(screen.getByText(/artist created successfully/i)).toBeInTheDocument();
      });
    });

    it("clears form on successful submission", async () => {
      const user = userEvent.setup();
      axiosInstance.post.mockResolvedValue({
        data: { message: "Artist created successfully!" },
      });

      const { container } = render(<CreateArtistForm />);

      const nameInput = container.querySelector(".artistNameInput");
      const genreInput = container.querySelector(".genreInput");

      await user.type(nameInput, "New Artist");
      await user.type(genreInput, "Rock");
      await user.click(screen.getByRole("button", { name: /create artist/i }));

      await waitFor(() => {
        expect(nameInput).toHaveValue("");
        expect(genreInput).toHaveValue("");
      });
    });
  });

  describe("Form Submission with Image", () => {
    it("uploads image first then creates artist", async () => {
      const user = userEvent.setup();
      axiosInstance.post
        .mockResolvedValueOnce({ data: { imageUrl: "/uploads/new-image.jpg" } })
        .mockResolvedValueOnce({ data: { message: "Artist created!" } });

      const { container } = render(<CreateArtistForm />);

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
      const nameInput = container.querySelector(".artistNameInput");
      const genreInput = container.querySelector(".genreInput");
      const fileInput = document.getElementById("artistImageInput");

      await user.type(nameInput, "New Artist");
      await user.type(genreInput, "Rock");
      await user.upload(fileInput, file);
      await user.click(screen.getByRole("button", { name: /create artist/i }));

      await waitFor(() => {
        expect(axiosInstance.post).toHaveBeenCalledTimes(2);
      });

      expect(axiosInstance.post).toHaveBeenNthCalledWith(
        1,
        "/upload-artist-image",
        expect.any(FormData),
        expect.objectContaining({
          headers: { "Content-Type": "multipart/form-data" },
        })
      );
    });
  });

  describe("Error Handling", () => {
    it("shows error message on failed submission", async () => {
      const user = userEvent.setup();
      axiosInstance.post.mockRejectedValue({
        response: { data: { message: "Creation failed" } },
      });

      const { container } = render(<CreateArtistForm />);

      const nameInput = container.querySelector(".artistNameInput");
      const genreInput = container.querySelector(".genreInput");

      await user.type(nameInput, "New Artist");
      await user.type(genreInput, "Rock");
      await user.click(screen.getByRole("button", { name: /create artist/i }));

      await waitFor(() => {
        expect(screen.getByText(/creation failed/i)).toBeInTheDocument();
      });
    });

    it("shows default error message when no message provided", async () => {
      const user = userEvent.setup();
      axiosInstance.post.mockRejectedValue({});

      const { container } = render(<CreateArtistForm />);

      const nameInput = container.querySelector(".artistNameInput");
      const genreInput = container.querySelector(".genreInput");

      await user.type(nameInput, "New Artist");
      await user.type(genreInput, "Rock");
      await user.click(screen.getByRole("button", { name: /create artist/i }));

      await waitFor(() => {
        expect(screen.getByText(/failed to create artist/i)).toBeInTheDocument();
      });
    });
  });

  describe("Form Validation", () => {
    it("has required fields", () => {
      const { container } = render(<CreateArtistForm />);

      const nameInput = container.querySelector(".artistNameInput");
      const genreInput = container.querySelector(".genreInput");

      expect(nameInput).toBeRequired();
      expect(genreInput).toBeRequired();
    });

    it("image field accepts only image files", () => {
      render(<CreateArtistForm />);

      const fileInput = document.getElementById("artistImageInput");
      expect(fileInput).toHaveAttribute("accept", "image/*");
    });
  });
});
