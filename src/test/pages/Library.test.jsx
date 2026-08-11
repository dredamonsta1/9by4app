import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../utils";
import Library from "../../pages/Library/Library";

vi.mock("../../utils/axiosInstance", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

import axiosInstance from "../../utils/axiosInstance";

const purchase = (overrides = {}) => ({
  id: 1,
  album_id: 77,
  artist_id: 130427,
  album_name: "Playing With Fire",
  artist_name: "Ballad",
  amount_cents: 999,
  created_at: "2026-06-09T12:00:00Z",
  ...overrides,
});

const loggedIn = (purchases) => ({
  auth: { user: { user_id: 1 }, token: "t", purchases },
});

// Fans should be able to see which artists hold their email address
// (ToS §10). The notice sits at the artist level because an artist
// receives one address no matter how many albums you buy from them.
describe("Library — buyer email transparency", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Library refetches purchases on mount (the Stripe-webhook-lag path).
    // Leave that request pending so the preloaded state under test is never
    // overwritten. loadPurchases is a createAsyncThunk, so it can't be
    // module-mocked without losing the .fulfilled case authSlice needs.
    axiosInstance.get.mockReturnValue(new Promise(() => {}));
  });

  it("names the artist holding the fan's email address", () => {
    renderWithProviders(<Library />, {
      preloadedState: loggedIn([purchase()]),
    });

    expect(
      screen.getByText(/has your email address from this purchase/i)
    ).toHaveTextContent("Ballad");
  });

  it("shows one notice per artist, not per album", () => {
    renderWithProviders(<Library />, {
      preloadedState: loggedIn([
        purchase(),
        purchase({ id: 2, album_id: 78, album_name: "Iceman" }),
      ]),
    });

    expect(
      screen.getAllByText(/has your email address from these purchases/i)
    ).toHaveLength(1);
  });

  it("links the notice to the terms page", () => {
    renderWithProviders(<Library />, {
      preloadedState: loggedIn([purchase()]),
    });

    expect(screen.getByRole("link", { name: /^why$/i })).toHaveAttribute(
      "href",
      "/terms"
    );
  });

  it("shows no notice when the fan has bought nothing", () => {
    renderWithProviders(<Library />, { preloadedState: loggedIn([]) });

    expect(screen.queryByText(/has your email address/i)).not.toBeInTheDocument();
  });
});
