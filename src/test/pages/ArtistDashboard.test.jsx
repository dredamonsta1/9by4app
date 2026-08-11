import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../utils";
import ArtistDashboard from "../../pages/ArtistDashboard/ArtistDashboard";

vi.mock("../../utils/axiosInstance", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

vi.mock("../../components/ClaimSearch/ClaimSearch", () => ({
  default: () => <div data-testid="claim-search" />,
}));

import axiosInstance from "../../utils/axiosInstance";

const ARTIST_ID = 130427;

const person = (o = {}) => ({
  user_id: 10,
  username: "marcus_b",
  profile_image: null,
  position: 3,
  added_at: "2026-06-01T00:00:00Z",
  is_stan: true,
  purchase_count: 0,
  total_spent_cents: 0,
  artist_earned_cents: 0,
  last_purchase_at: null,
  purchased_albums: [],
  email: null,
  ...o,
});

const buyer = (o = {}) =>
  person({
    purchase_count: 1,
    total_spent_cents: 999,
    artist_earned_cents: 899,
    last_purchase_at: "2026-06-09T00:00:00Z",
    purchased_albums: [{ album_id: 77, album_name: "Playing With Fire" }],
    email: "marcus@example.com",
    ...o,
  });

const summaryFor = (rows) => {
  const stans = rows.filter((r) => r.is_stan);
  const buyers = rows.filter((r) => r.purchase_count > 0);
  return {
    total_stans: stans.length,
    buyers: buyers.length,
    non_buyers: stans.filter((r) => r.purchase_count === 0).length,
    churned_buyers: buyers.filter((r) => !r.is_stan).length,
    gross_cents: buyers.reduce((n, r) => n + r.total_spent_cents, 0),
    artist_earned_cents: buyers.reduce((n, r) => n + r.artist_earned_cents, 0),
    top5: stans.filter((r) => r.position != null && r.position <= 5).length,
  };
};

// Wire both requests the dashboard fires in parallel.
const mockApi = (rows, stripe = {
  charges_enabled: true,
  payouts_enabled: true,
  commerce_enabled: true,
}) => {
  axiosInstance.get.mockImplementation((url) => {
    if (url.includes("/stripe/status")) return Promise.resolve({ data: stripe });
    return Promise.resolve({
      data: { stans: rows, count: rows.filter((r) => r.is_stan).length, summary: summaryFor(rows) },
    });
  });
};

const renderDashboard = () =>
  renderWithProviders(<ArtistDashboard />, {
    preloadedState: {
      auth: { user: { user_id: 1, artist_id: ARTIST_ID }, token: "t" },
    },
  });

describe("ArtistDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("gates", () => {
    it("asks a logged-out visitor to log in", () => {
      renderWithProviders(<ArtistDashboard />, {
        preloadedState: { auth: { user: null, token: null } },
      });
      expect(screen.getByRole("link", { name: /log in/i })).toBeInTheDocument();
      expect(axiosInstance.get).not.toHaveBeenCalled();
    });

    it("shows the claim flow to a user with no linked artist", () => {
      renderWithProviders(<ArtistDashboard />, {
        preloadedState: { auth: { user: { user_id: 1 }, token: "t" } },
      });
      expect(screen.getByTestId("claim-search")).toBeInTheDocument();
      expect(axiosInstance.get).not.toHaveBeenCalled();
    });
  });

  describe("email visibility", () => {
    it("shows a buyer's email address", async () => {
      mockApi([buyer()]);
      renderDashboard();

      expect(
        await screen.findByRole("button", { name: "marcus@example.com" })
      ).toBeInTheDocument();
    });

    it("shows no email for a stan who hasn't bought", async () => {
      mockApi([person({ username: "dee", position: 7 })]);
      renderDashboard();

      expect(await screen.findByText("@dee")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /@example\.com/ })).not.toBeInTheDocument();
      expect(screen.queryByRole("link", { name: /email dee/i })).not.toBeInTheDocument();
    });

    it("offers a mailto affordance next to a buyer's address", async () => {
      mockApi([buyer()]);
      renderDashboard();

      expect(
        await screen.findByRole("link", { name: /email marcus_b/i })
      ).toHaveAttribute("href", "mailto:marcus@example.com");
    });

    it("copies the address to the clipboard on click", async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });
      mockApi([buyer()]);
      renderDashboard();

      const btn = await screen.findByRole("button", { name: "marcus@example.com" });
      await userEvent.click(btn);

      expect(writeText).toHaveBeenCalledWith("marcus@example.com");
      expect(await screen.findByRole("button", { name: /copied/i })).toBeInTheDocument();
    });
  });

  describe("headline stats", () => {
    it("counts buyers and non-buyers separately", async () => {
      mockApi([
        buyer({ user_id: 10, position: 1 }),
        person({ user_id: 11, username: "dee", position: 4 }),
        person({ user_id: 12, username: "sol", position: 9 }),
      ]);
      renderDashboard();

      // "Buyers" not "Bought" — the latter collides with the filter pill.
      const buyersLabel = await screen.findByText("Buyers");
      const haventLabel = screen.getByText("Haven't bought");
      expect(buyersLabel.previousSibling).toHaveTextContent("1");
      expect(haventLabel.previousSibling).toHaveTextContent("2");
    });

    it("reports what the artist has earned", async () => {
      mockApi([buyer()]);
      renderDashboard();

      expect(await screen.findByText("$8.99")).toBeInTheDocument();
      expect(screen.getByText("You've earned")).toBeInTheDocument();
    });
  });

  describe("commerce not enabled", () => {
    it("links to settings instead of reporting $0.00 earned", async () => {
      mockApi([person()], {
        charges_enabled: false,
        payouts_enabled: false,
        commerce_enabled: false,
      });
      renderDashboard();

      expect(await screen.findByText("Payments")).toBeInTheDocument();
      expect(screen.getByText("Off")).toBeInTheDocument();
      expect(screen.queryByText("You've earned")).not.toBeInTheDocument();
      expect(screen.getByRole("link", { name: /set up/i })).toHaveAttribute(
        "href",
        "/artist-settings"
      );
    });

    it("still shows earnings when the status call fails", async () => {
      axiosInstance.get.mockImplementation((url) => {
        if (url.includes("/stripe/status")) return Promise.reject(new Error("boom"));
        const rows = [buyer()];
        return Promise.resolve({
          data: { stans: rows, count: 1, summary: summaryFor(rows) },
        });
      });
      renderDashboard();

      // A transient status failure must never hide real revenue.
      expect(await screen.findByText("$8.99")).toBeInTheDocument();
    });
  });

  describe("filters", () => {
    const roster = [
      buyer({ user_id: 10, username: "nina_k", position: 1 }),
      person({ user_id: 11, username: "dee", position: 7 }),
      person({ user_id: 12, username: "sol", position: 14 }),
    ];

    it("narrows to the top 5", async () => {
      mockApi(roster);
      renderDashboard();
      await screen.findByText("@nina_k");

      await userEvent.click(screen.getByRole("button", { name: "Top 5" }));

      expect(screen.getByText("@nina_k")).toBeInTheDocument();
      expect(screen.queryByText("@dee")).not.toBeInTheDocument();
      expect(screen.queryByText("@sol")).not.toBeInTheDocument();
    });

    it("narrows to people who haven't bought", async () => {
      mockApi(roster);
      renderDashboard();
      await screen.findByText("@nina_k");

      await userEvent.click(screen.getByRole("button", { name: "Haven't" }));

      expect(screen.queryByText("@nina_k")).not.toBeInTheDocument();
      expect(screen.getByText("@dee")).toBeInTheDocument();
      expect(screen.getByText("@sol")).toBeInTheDocument();
    });

    it("explains an empty filter result", async () => {
      mockApi([person({ position: 18 })]);
      renderDashboard();
      await screen.findByText("@marcus_b");

      await userEvent.click(screen.getByRole("button", { name: "Top 5" }));

      expect(screen.getByText(/no one matches this filter/i)).toBeInTheDocument();
    });
  });

  describe("churned buyers", () => {
    it("keeps a buyer who dropped the artist, flagged and unranked", async () => {
      mockApi([
        person({ user_id: 11, username: "dee", position: 2 }),
        buyer({ user_id: 20, username: "churned", is_stan: false, position: null }),
      ]);
      renderDashboard();

      expect(await screen.findByText("@churned")).toBeInTheDocument();
      expect(screen.getByText(/no longer ranked/i)).toBeInTheDocument();
      expect(
        screen.getByText(/since dropped you from their top 20/i)
      ).toBeInTheDocument();
    });
  });

  describe("async states", () => {
    it("shows a loading state while fetching", () => {
      axiosInstance.get.mockReturnValue(new Promise(() => {}));
      renderDashboard();
      expect(screen.getByText(/loading your audience/i)).toBeInTheDocument();
    });

    it("surfaces a failed audience fetch", async () => {
      axiosInstance.get.mockImplementation((url) =>
        url.includes("/stripe/status")
          ? Promise.resolve({ data: {} })
          : Promise.reject({ response: { data: { message: "Forbidden" } } })
      );
      renderDashboard();

      expect(await screen.findByText("Forbidden")).toBeInTheDocument();
    });

    it("tells an artist with no audience what changes that", async () => {
      mockApi([]);
      renderDashboard();

      expect(
        await screen.findByText(/no one has you in their top 20 yet/i)
      ).toBeInTheDocument();
    });

    it("turns zero sales into the warm-lead count", async () => {
      mockApi([
        person({ user_id: 11, username: "dee", position: 7 }),
        person({ user_id: 12, username: "sol", position: 9 }),
      ]);
      renderDashboard();

      await waitFor(() =>
        expect(screen.getByText(/no sales yet/i)).toBeInTheDocument()
      );
      expect(screen.getByText(/they're who to release for/i)).toBeInTheDocument();
    });
  });
});
