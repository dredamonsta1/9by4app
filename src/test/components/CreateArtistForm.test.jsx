// Tests for the admin-only Create Artist form. Re-written to match
// the current shape (form + live preview pane + album section after
// artist is created). Earlier test fixtures targeted a much simpler
// form and broke once the preview + album rows were added.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../utils";
import CreateArtistForm from "../../components/CreateArtistForm/CreateArtistForm";

vi.mock("../../utils/axiosInstance", () => ({
  default: { post: vi.fn() },
}));

vi.mock("../../components/CreateArtistForm/CreateArtistForm.module.css", () => ({
  default: new Proxy({}, { get: (_, key) => key }),
}));

import axiosInstance from "../../utils/axiosInstance";

const render = (ui) =>
  renderWithProviders(ui, {
    preloadedState: {
      auth: {
        user: { user_id: 1, username: "admin", role: "admin" },
        isLoggedIn: true,
      },
    },
  });

// The form labels aren't htmlFor-linked, so we query inputs by their
// order in the form: 0=Artist Name, 1=Genre, 2=Mixtape, 3=Image.
const formInputs = (container) =>
  Array.from(container.querySelectorAll("form input"));

describe("CreateArtistForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders the form title + submit button", () => {
      render(<CreateArtistForm />);
      expect(
        screen.getByRole("heading", { name: /create new artist/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /create artist/i }),
      ).toBeInTheDocument();
    });

    it("renders the live preview panel with placeholders", () => {
      render(<CreateArtistForm />);
      expect(screen.getByText(/^preview$/i)).toBeInTheDocument();
      // Placeholder name + genre rendered until the user types.
      expect(screen.getAllByText(/artist name/i).length).toBeGreaterThan(0);
    });

    it("returns nothing when no user is logged in", () => {
      const { container } = renderWithProviders(<CreateArtistForm />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe("Form interaction", () => {
    it("updates the live preview as the user types the name", async () => {
      const { container } = render(<CreateArtistForm />);
      const [nameInput] = formInputs(container);
      await userEvent.type(nameInput, "Drake");
      expect(screen.getByText("Drake")).toBeInTheDocument();
    });

    it("updates the live preview as the user types the genre", async () => {
      const { container } = render(<CreateArtistForm />);
      const [, genreInput] = formInputs(container);
      await userEvent.type(genreInput, "Hip Hop");
      expect(screen.getByText("Hip Hop")).toBeInTheDocument();
    });
  });

  describe("Submission", () => {
    it("posts to /artists with the form payload + shows the success state", async () => {
      axiosInstance.post.mockResolvedValueOnce({
        data: { artist: { artist_id: 42, artist_name: "Drake" } },
      });

      const { container } = render(<CreateArtistForm />);
      const [name, genre] = formInputs(container);
      await userEvent.type(name, "Drake");
      await userEvent.type(genre, "Hip Hop");
      await userEvent.click(
        screen.getByRole("button", { name: /create artist/i }),
      );

      await waitFor(() =>
        expect(axiosInstance.post).toHaveBeenCalledWith(
          "/artists",
          expect.objectContaining({
            artist_name: "Drake",
            genre: "Hip Hop",
          }),
        ),
      );

      // Submit button flips to the "created" affirmative state.
      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: /artist created/i }),
        ).toBeDisabled(),
      );
    });

    it("surfaces an error from the backend", async () => {
      axiosInstance.post.mockRejectedValueOnce({
        response: { data: { message: "Artist name already exists." } },
      });

      const { container } = render(<CreateArtistForm />);
      const [name, genre] = formInputs(container);
      await userEvent.type(name, "Drake");
      await userEvent.type(genre, "Hip Hop");
      await userEvent.click(
        screen.getByRole("button", { name: /create artist/i }),
      );

      expect(
        await screen.findByText(/artist name already exists/i),
      ).toBeInTheDocument();
    });
  });
});
