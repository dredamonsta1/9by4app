import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import QuarterlyChart from "../../pages/QuarterlyChart/QuarterlyChart";

vi.mock("../../utils/axiosInstance", () => ({
  default: { get: vi.fn() },
}));

import axiosInstance from "../../utils/axiosInstance";

const entry = (rank, name, over = {}) => ({
  album_id: rank,
  album_name: name,
  artist_id: rank,
  artist_name: `Artist ${rank}`,
  album_image_url: null,
  points: 20 - rank,
  votes: 5 - rank,
  first_place_votes: rank === 1 ? 2 : 0,
  rank,
  ...over,
});

const respond = (over = {}) =>
  axiosInstance.get.mockResolvedValue({
    data: {
      year: 2026,
      quarter: 3,
      locked: true,
      provisional: false,
      ballot_count: 12,
      pick_count: 55,
      minimum_ballots: 5,
      published: true,
      entries: [entry(1, "Alpha"), entry(2, "Beta")],
      ...over,
    },
  });

const renderAt = (path = "/picks/2026/3") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/picks/:year/:quarter" element={<QuarterlyChart />} />
        <Route path="/picks" element={<QuarterlyChart />} />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => vi.clearAllMocks());

describe("QuarterlyChart", () => {
  it("renders the chart in rank order", async () => {
    respond();
    renderAt();

    expect(await screen.findByText("Alpha")).toBeInTheDocument();
    const rows = screen.getAllByRole("listitem");
    expect(rows[0]).toHaveTextContent("Alpha");
    expect(rows[1]).toHaveTextContent("Beta");
  });

  it("shows what the chart is built from", async () => {
    respond();
    renderAt();

    expect(await screen.findByText(/12 ballots · 55 picks/i)).toBeInTheDocument();
  });

  it("requests the quarter in the URL", async () => {
    respond();
    renderAt("/picks/2026/2");

    await screen.findByText("Alpha");
    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/quarterly-picks/aggregate?year=2026&quarter=2"
    );
  });

  it("lets the server choose the quarter when the URL doesn't", async () => {
    respond();
    renderAt("/picks");

    await screen.findByText("Alpha");
    expect(axiosInstance.get).toHaveBeenCalledWith("/quarterly-picks/aggregate");
  });

  describe("below the ballot floor", () => {
    it("publishes nothing and explains why", async () => {
      // The whole point of the threshold — a thin chart is a worse claim
      // than no chart, so the page must not render one.
      respond({ published: false, ballot_count: 1, entries: [] });
      renderAt();

      expect(await screen.findByText(/not enough picks yet/i)).toBeInTheDocument();
      expect(screen.getByText(/1 person has picked/i)).toBeInTheDocument();
      expect(screen.getByText(/needs 5/i)).toBeInTheDocument();
      expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
    });

    it("handles a quarter nobody picked in", async () => {
      respond({ published: false, ballot_count: 0, entries: [] });
      renderAt();

      expect(await screen.findByText(/nobody has picked/i)).toBeInTheDocument();
    });

    it("pluralises the ballot count", async () => {
      respond({ published: false, ballot_count: 3, entries: [] });
      renderAt();

      expect(await screen.findByText(/3 people have picked/i)).toBeInTheDocument();
    });

    it("points at the place you'd go to fix it", async () => {
      respond({ published: false, ballot_count: 1, entries: [] });
      renderAt();

      const cta = await screen.findByRole("link", { name: /make your picks/i });
      expect(cta).toHaveAttribute("href", "/profile");
    });
  });

  it("marks an open quarter provisional", async () => {
    // An open quarter is a moving target and shouldn't read as final.
    respond({ locked: false, provisional: true });
    renderAt();

    expect(await screen.findByText(/still open and picks can still change/i)).toBeInTheDocument();
  });

  it("says nothing about provisionality once locked", async () => {
    respond({ locked: true, provisional: false });
    renderAt();

    await screen.findByText("Alpha");
    expect(screen.queryByText(/still open/i)).not.toBeInTheDocument();
  });

  it("surfaces a load failure", async () => {
    axiosInstance.get.mockRejectedValue({ response: { data: { message: "Boom." } } });
    renderAt();

    expect(await screen.findByText("Boom.")).toBeInTheDocument();
  });

  it("links each entry to its artist", async () => {
    respond();
    renderAt();

    const link = await screen.findByRole("link", { name: "Artist 1" });
    expect(link).toHaveAttribute("href", "/artist/1");
  });
});
