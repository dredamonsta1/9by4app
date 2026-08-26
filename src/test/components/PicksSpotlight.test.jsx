import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PicksSpotlight from "../../components/PicksSpotlight/PicksSpotlight";

vi.mock("../../utils/axiosInstance", () => ({ default: { get: vi.fn() } }));

import axiosInstance from "../../utils/axiosInstance";

const published = (over = {}) => ({
  status: "published",
  year: 2026,
  quarter: 3,
  locked: true,
  provisional: false,
  is_active_quarter: false,
  ballot_count: 12,
  minimum_ballots: 5,
  winner: {
    album_id: 10,
    album_name: "Roll the Dice",
    artist_id: 4,
    artist_name: "ChuckXL",
    album_image_url: null,
    points: 42,
  },
  ...over,
});

const pending = (over = {}) => ({
  status: "pending",
  year: 2026,
  quarter: 3,
  locked: false,
  ballot_count: 1,
  minimum_ballots: 5,
  winner: null,
  ...over,
});

const renderIt = () =>
  render(
    <MemoryRouter>
      <PicksSpotlight />
    </MemoryRouter>
  );

beforeEach(() => vi.clearAllMocks());

describe("PicksSpotlight", () => {
  it("shows the winner once a quarter is published", async () => {
    axiosInstance.get.mockResolvedValue({ data: published() });
    renderIt();

    expect(await screen.findByText("Roll the Dice")).toBeInTheDocument();
    expect(screen.getByText("ChuckXL")).toBeInTheDocument();
    expect(screen.getByText(/album of the quarter/i)).toBeInTheDocument();
  });

  it("links a published winner to that quarter's chart", async () => {
    axiosInstance.get.mockResolvedValue({ data: published() });
    renderIt();

    const link = await screen.findByRole("link");
    expect(link).toHaveAttribute("href", "/picks/2026/3");
  });

  it("says 'leading' rather than claiming a winner while the quarter is open", async () => {
    // An open quarter's #1 can still change; calling it the winner would be
    // a claim the data doesn't support yet.
    axiosInstance.get.mockResolvedValue({
      data: published({ locked: false, provisional: true, is_active_quarter: true }),
    });
    renderIt();

    expect(await screen.findByText(/leading/i)).toBeInTheDocument();
  });

  it("keeps showing a sealed past quarter after rollover", async () => {
    // The server picks the quarter; the box just renders it. This is the
    // case that would otherwise blank the box every 15 October.
    axiosInstance.get.mockResolvedValue({
      data: published({ year: 2026, quarter: 3, is_active_quarter: false }),
    });
    renderIt();

    expect(await screen.findByText("Q3 2026")).toBeInTheDocument();
    expect(screen.getByText("Roll the Dice")).toBeInTheDocument();
  });

  describe("before the ballot floor is met", () => {
    it("shows coming soon with progress toward the floor", async () => {
      axiosInstance.get.mockResolvedValue({ data: pending() });
      renderIt();

      expect(await screen.findByText(/coming soon/i)).toBeInTheDocument();
      expect(screen.getByText(/1\/5 ballots/i)).toBeInTheDocument();
    });

    it("points at the profile, where picks are actually made", async () => {
      axiosInstance.get.mockResolvedValue({ data: pending() });
      renderIt();

      const link = await screen.findByRole("link");
      expect(link).toHaveAttribute("href", "/profile");
    });

    it("names no winner", async () => {
      axiosInstance.get.mockResolvedValue({ data: pending() });
      renderIt();

      await screen.findByText(/coming soon/i);
      expect(screen.queryByText(/album of the quarter/i)).not.toBeInTheDocument();
    });
  });

  it("renders nothing at all if the request fails", async () => {
    // It's a landing-page ornament — it must never take the page with it,
    // and an error box in a slot this small is worse than absence.
    axiosInstance.get.mockRejectedValue(new Error("down"));
    const { container } = renderIt();

    await waitFor(() => expect(axiosInstance.get).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing before the response arrives", () => {
    axiosInstance.get.mockReturnValue(new Promise(() => {}));
    const { container } = renderIt();

    // No skeleton: in a box this small it's more noise than the content.
    expect(container).toBeEmptyDOMElement();
  });
});
