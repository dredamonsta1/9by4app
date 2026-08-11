import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../utils";
import AlbumBuyButton from "../../components/AlbumBuyButton/AlbumBuyButton";

vi.mock("../../utils/axiosInstance", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

const album = {
  album_id: 77,
  album_name: "Playing With Fire",
  price_cents: 999,
  download_enabled: true,
};

const artist = { artist_id: 130427, artist_name: "Ballad" };

const user = { user_id: 1, username: "andrew3" };

// The email disclosure (ToS §10) must appear on the last screen before
// payment and nowhere else — showing it earlier would warn users about a
// share that hasn't been triggered yet.
describe("AlbumBuyButton — buyer email disclosure", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the disclosure, naming the artist, in the buy state", () => {
    renderWithProviders(<AlbumBuyButton album={album} artist={artist} />, {
      preloadedState: {
        auth: { user, purchases: [] },
        profileList: { list: [artist] },
      },
    });

    expect(screen.getByRole("button", { name: /buy \$9\.99/i })).toBeInTheDocument();
    expect(
      screen.getByText(/your email address is shared with/i)
    ).toHaveTextContent("Ballad");
  });

  it("links the disclosure to the terms page", () => {
    renderWithProviders(<AlbumBuyButton album={album} artist={artist} />, {
      preloadedState: {
        auth: { user, purchases: [] },
        profileList: { list: [artist] },
      },
    });

    expect(screen.getByRole("link", { name: /learn more/i })).toHaveAttribute(
      "href",
      "/terms"
    );
  });

  it("does not show the disclosure when logged out", () => {
    renderWithProviders(<AlbumBuyButton album={album} artist={artist} />, {
      preloadedState: { auth: { user: null }, profileList: { list: [] } },
    });

    expect(screen.getByRole("link", { name: /sign in to buy/i })).toBeInTheDocument();
    expect(screen.queryByText(/your email address is shared/i)).not.toBeInTheDocument();
  });

  it("does not show the disclosure before the artist is in the Top 20", () => {
    renderWithProviders(<AlbumBuyButton album={album} artist={artist} />, {
      preloadedState: {
        auth: { user, purchases: [] },
        profileList: { list: [] },
      },
    });

    expect(screen.getByRole("button", { name: /add to your top 20/i })).toBeInTheDocument();
    expect(screen.queryByText(/your email address is shared/i)).not.toBeInTheDocument();
  });

  it("does not show the disclosure once the album is owned", () => {
    renderWithProviders(<AlbumBuyButton album={album} artist={artist} />, {
      preloadedState: {
        auth: { user, purchases: [{ album_id: 77 }] },
        profileList: { list: [artist] },
      },
    });

    expect(screen.getByRole("link", { name: /download/i })).toBeInTheDocument();
    expect(screen.queryByText(/your email address is shared/i)).not.toBeInTheDocument();
  });

  it("falls back to 'the artist' when the artist name is missing", () => {
    renderWithProviders(
      <AlbumBuyButton album={album} artist={{ artist_id: 130427 }} />,
      {
        preloadedState: {
          auth: { user, purchases: [] },
          profileList: { list: [{ artist_id: 130427 }] },
        },
      }
    );

    expect(
      screen.getByText(/your email address is shared with/i)
    ).toHaveTextContent("the artist");
  });
});
