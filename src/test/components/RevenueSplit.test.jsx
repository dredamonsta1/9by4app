import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../utils";
import RevenueSplit from "../../components/Admin/RevenueSplit";
import axiosInstance from "../../utils/axiosInstance";

// Story 36: the admin control for the platform fee. The screen works in
// percent; these tests check the basis points that actually reach the API.

vi.mock("../../utils/axiosInstance", () => ({
  default: { get: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const split = (overrides = {}) => ({
  global_bps: 1000,
  max_bps: 5000,
  deals: [
    { artist_id: 3, artist_name: "Ballad", bps: 0, ends_at: "2999-05-01T00:00:00.000Z", note: "Launch deal", active: true },
    { artist_id: 4, artist_name: "Tejy", bps: 500, ends_at: "2020-01-01T00:00:00.000Z", note: null, active: false },
  ],
  history: [
    { id: 2, artist_id: 3, artist_name: "Ballad", old_bps: null, new_bps: 0, ends_at: "2999-05-01T00:00:00.000Z", note: "Launch deal", changed_by: "andre", changed_at: "2026-10-29T00:00:00.000Z" },
    { id: 1, artist_id: null, artist_name: null, old_bps: 1000, new_bps: 800, ends_at: null, note: null, changed_by: "andre", changed_at: "2026-10-28T00:00:00.000Z" },
  ],
  ...overrides,
});

const mockGet = (data = split(), searchResults = []) => {
  axiosInstance.get.mockImplementation((url) =>
    url.startsWith("/artists/")
      ? Promise.resolve({ data: { artists: searchResults } })
      : Promise.resolve({ data })
  );
};

const renderLoaded = async () => {
  renderWithProviders(<RevenueSplit />);
  await screen.findByLabelText("Global rate");
};

beforeEach(() => {
  vi.clearAllMocks();
  axiosInstance.put.mockResolvedValue({ data: {} });
  axiosInstance.delete.mockResolvedValue({ data: {} });
});

describe("RevenueSplit", () => {
  it("shows the global rate, deals and recent changes", async () => {
    mockGet();
    await renderLoaded();

    expect(screen.getByLabelText("Global rate")).toHaveValue(10);
    expect(screen.getByText("Artists keep 90%")).toBeInTheDocument();
    expect(screen.getByText("0% · artist keeps 100%")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Ended")).toBeInTheDocument();
    expect(screen.getByText(/Ballad: global rate → 0%/)).toBeInTheDocument();
    expect(screen.getByText("Global: 10% → 8%")).toBeInTheDocument();
  });

  it("shows an empty state when there are no deals", async () => {
    mockGet(split({ deals: [], history: [] }));
    await renderLoaded();
    expect(screen.getByText(/no deals yet/i)).toBeInTheDocument();
    expect(screen.getByText(/no changes yet/i)).toBeInTheDocument();
  });

  it("shows an error with a retry when loading fails", async () => {
    axiosInstance.get.mockRejectedValueOnce(new Error("502"));
    renderWithProviders(<RevenueSplit />);
    expect(await screen.findByText(/couldn't load the revenue split/i)).toBeInTheDocument();

    mockGet();
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(await screen.findByLabelText("Global rate")).toBeInTheDocument();
  });

  it("saves the global rate as basis points", async () => {
    mockGet();
    await renderLoaded();

    fireEvent.change(screen.getByLabelText("Global rate"), { target: { value: "7.5" } });
    fireEvent.click(screen.getByRole("button", { name: /save rate/i }));

    await waitFor(() =>
      expect(axiosInstance.put).toHaveBeenCalledWith("/admin/revenue-split/global", { bps: 750 })
    );
    expect(await screen.findByText("Global rate is now 7.5%.")).toBeInTheDocument();
  });

  it("won't save a global rate over the cap", async () => {
    mockGet();
    await renderLoaded();

    fireEvent.change(screen.getByLabelText("Global rate"), { target: { value: "60" } });
    fireEvent.click(screen.getByRole("button", { name: /save rate/i }));

    expect(await screen.findByText("Enter a rate from 0 to 50%.")).toBeInTheDocument();
    expect(axiosInstance.put).not.toHaveBeenCalled();
  });

  it("creates a deal for a searched artist with an end date and note", async () => {
    mockGet(split(), [{ artist_id: 9, artist_name: "Aver Ray" }]);
    await renderLoaded();

    fireEvent.change(screen.getByLabelText("Search artists"), { target: { value: "aver" } });
    fireEvent.click(await screen.findByRole("button", { name: "Aver Ray" }));
    fireEvent.change(screen.getByLabelText("Deal rate"), { target: { value: "5" } });
    fireEvent.change(screen.getByLabelText("Deal end date"), { target: { value: "2027-06-01" } });
    fireEvent.change(screen.getByLabelText("Deal note"), { target: { value: "Six-month launch deal" } });
    fireEvent.click(screen.getByRole("button", { name: /save deal/i }));

    await waitFor(() =>
      expect(axiosInstance.put).toHaveBeenCalledWith("/admin/revenue-split/artists/9", {
        bps: 500,
        ends_at: "2027-06-01",
        note: "Six-month launch deal",
      })
    );
    expect(await screen.findByText("Saved Aver Ray's deal.")).toBeInTheDocument();
  });

  it("sends no end date for an open-ended deal", async () => {
    mockGet(split(), [{ artist_id: 9, artist_name: "Aver Ray" }]);
    await renderLoaded();

    fireEvent.change(screen.getByLabelText("Search artists"), { target: { value: "aver" } });
    fireEvent.click(await screen.findByRole("button", { name: "Aver Ray" }));
    fireEvent.change(screen.getByLabelText("Deal rate"), { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: /save deal/i }));

    await waitFor(() =>
      expect(axiosInstance.put).toHaveBeenCalledWith("/admin/revenue-split/artists/9", {
        bps: 0,
        ends_at: null,
        note: "",
      })
    );
  });

  it("opens an artist's existing deal for editing instead of starting a new one", async () => {
    mockGet(split(), [{ artist_id: 3, artist_name: "Ballad" }]);
    await renderLoaded();

    fireEvent.change(screen.getByLabelText("Search artists"), { target: { value: "ball" } });
    fireEvent.click(await screen.findByRole("button", { name: "Ballad" }));

    expect(screen.getByText("Edit Ballad's deal")).toBeInTheDocument();
    expect(screen.getByLabelText("Deal rate")).toHaveValue(0);
    expect(screen.getByLabelText("Deal end date")).toHaveValue("2999-05-01");
    expect(screen.getByLabelText("Deal note")).toHaveValue("Launch deal");
  });

  it("needs a confirm before ending a deal", async () => {
    mockGet();
    await renderLoaded();

    fireEvent.click(screen.getAllByRole("button", { name: "End deal" })[0]);
    expect(axiosInstance.delete).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /confirm: end deal/i }));
    await waitFor(() => expect(axiosInstance.delete).toHaveBeenCalledWith("/admin/revenue-split/artists/3"));
    expect(await screen.findByText("Ballad is back on the global rate.")).toBeInTheDocument();
  });

  it("shows the server's message when a deal can't be saved", async () => {
    mockGet(split(), [{ artist_id: 9, artist_name: "Aver Ray" }]);
    axiosInstance.put.mockRejectedValueOnce({ response: { data: { message: "The end date must be in the future." } } });
    await renderLoaded();

    fireEvent.change(screen.getByLabelText("Search artists"), { target: { value: "aver" } });
    fireEvent.click(await screen.findByRole("button", { name: "Aver Ray" }));
    fireEvent.change(screen.getByLabelText("Deal rate"), { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: /save deal/i }));

    expect(await screen.findByText("The end date must be in the future.")).toBeInTheDocument();
  });
});
