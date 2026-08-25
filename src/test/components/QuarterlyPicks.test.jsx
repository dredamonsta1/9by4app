import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import QuarterlyPicks from "../../components/QuarterlyPicks/QuarterlyPicks";
import { quarterLabel, quarterMonths, lockLabel } from "../../hooks/useQuarterlyPicks";

vi.mock("../../utils/axiosInstance", () => ({
  default: { get: vi.fn(), put: vi.fn() },
}));

vi.mock("react-toastify", () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() },
}));

import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

// The editing tests drive six clicks each through a full fetch cycle, which
// is the heaviest interaction work in this suite. They pass comfortably on
// their own but brush the 5s default when 29 files run in parallel, so the
// ceiling is raised here rather than cutting the coverage back.
vi.setConfig({ testTimeout: 20000 });

const album = (id, name, artist = "ChuckXL") => ({
  album_id: id,
  album_name: name,
  artist_name: artist,
  album_image_url: null,
  release_date: "2026-08-14",
});

const pick = (position, id, name) => ({ ...album(id, name), position });

/** Routes GET by path so a component making several calls stays readable. */
const mockApi = ({ picks = [], albums = [], quarters = [], locked = false } = {}) => {
  axiosInstance.get.mockImplementation((url) => {
    if (url.startsWith("/quarterly-picks/ballot")) {
      return Promise.resolve({
        data: { year: 2026, quarter: 3, locked, albums, picks_allowed: 5 },
      });
    }
    if (url.includes("/quarters")) {
      return Promise.resolve({ data: { quarters } });
    }
    return Promise.resolve({
      data: {
        year: 2026,
        quarter: 3,
        locked,
        locks_at: "2026-10-15T00:00:00.000Z",
        picks,
      },
    });
  });
};

beforeEach(() => {
  vi.clearAllMocks();
  axiosInstance.put.mockResolvedValue({ data: {} });
});

describe("label helpers", () => {
  it("formats a quarter and its months", () => {
    expect(quarterLabel(2026, 3)).toBe("Q3 2026");
    expect(quarterMonths(2026, 3)).toBe("Jul–Sep 2026");
  });

  it("shows the lock date while open and 'Locked' after", () => {
    // Read in UTC so the label doesn't shift a day for users west of GMT —
    // the quarter boundary is a UTC fact.
    // Day/month order follows the viewer's locale, so assert the parts
    // rather than an ordering this test's locale happens to produce.
    const open = lockLabel("2026-10-15T00:00:00.000Z", false);
    expect(open).toMatch(/^Locks /);
    expect(open).toContain("Oct");
    expect(open).toContain("15");
    expect(lockLabel("2026-10-15T00:00:00.000Z", true)).toBe("Locked");
  });

  it("returns null rather than 'Invalid Date' for junk", () => {
    expect(lockLabel("not-a-date", false)).toBeNull();
    expect(lockLabel(null, false)).toBeNull();
  });
});

describe("QuarterlyPicks — viewing", () => {
  it("renders saved picks in rank order", async () => {
    mockApi({ picks: [pick(1, 10, "Roll the Dice"), pick(2, 11, "The Fall-Off")] });
    render(<QuarterlyPicks editable />);

    expect(await screen.findByText("Roll the Dice")).toBeInTheDocument();
    const rows = screen.getAllByRole("listitem");
    expect(within(rows[0]).getByText("1")).toBeInTheDocument();
    expect(within(rows[1]).getByText("2")).toBeInTheDocument();
  });

  it("prompts an empty own-profile quarter", async () => {
    mockApi({ picks: [] });
    render(<QuarterlyPicks editable />);

    expect(await screen.findByText(/five releases, ranked/i)).toBeInTheDocument();
  });

  it("names the other person on a visited profile", async () => {
    mockApi({ picks: [] });
    render(<QuarterlyPicks userId={9} displayName="andrew3" />);

    expect(await screen.findByText(/andrew3 hasn't picked/i)).toBeInTheDocument();
  });

  it("offers no edit button on someone else's profile", async () => {
    mockApi({ picks: [pick(1, 10, "Roll the Dice")] });
    render(<QuarterlyPicks userId={9} displayName="andrew3" />);

    await screen.findByText("Roll the Dice");
    expect(screen.queryByRole("button", { name: /edit picks/i })).not.toBeInTheDocument();
  });

  it("offers no edit button once the quarter is locked", async () => {
    // The server enforces this too; hiding it here is so the user isn't
    // invited into an action that will 409.
    mockApi({ picks: [pick(1, 10, "Roll the Dice")], locked: true });
    render(<QuarterlyPicks editable />);

    await screen.findByText("Roll the Dice");
    expect(screen.queryByRole("button", { name: /edit picks/i })).not.toBeInTheDocument();
    expect(screen.getByText("Locked")).toBeInTheDocument();
  });

  it("says a sealed empty quarter can't be filled in", async () => {
    mockApi({ picks: [], locked: true });
    render(<QuarterlyPicks editable />);

    expect(await screen.findByText(/sealed now/i)).toBeInTheDocument();
  });

  it("surfaces a load failure instead of rendering an empty list", async () => {
    axiosInstance.get.mockRejectedValue({ response: { data: { message: "Boom." } } });
    render(<QuarterlyPicks editable />);

    expect(await screen.findByText("Boom.")).toBeInTheDocument();
  });
});

describe("QuarterlyPicks — editing", () => {
  const openPicker = async (user) => {
    await user.click(await screen.findByRole("button", { name: /make your picks|edit picks/i }));
  };

  it("only fetches the ballot once the picker opens", async () => {
    // It's the biggest payload here and most profile views never edit.
    const user = userEvent.setup({ delay: null });
    mockApi({ picks: [], albums: [album(10, "Roll the Dice")] });
    render(<QuarterlyPicks editable />);

    await screen.findByText(/five releases, ranked/i);
    expect(
      axiosInstance.get.mock.calls.some(([u]) => u.startsWith("/quarterly-picks/ballot"))
    ).toBe(false);

    await openPicker(user);
    await waitFor(() =>
      expect(
        axiosInstance.get.mock.calls.some(([u]) => u.startsWith("/quarterly-picks/ballot"))
      ).toBe(true)
    );
  });

  it("saves picks in the order they were chosen", async () => {
    const user = userEvent.setup({ delay: null });
    mockApi({ picks: [], albums: [album(10, "Alpha"), album(11, "Beta")] });
    render(<QuarterlyPicks editable />);
    await openPicker(user);

    await user.click(await screen.findByRole("button", { name: /Beta/ }));
    await user.click(screen.getByRole("button", { name: /Alpha/ }));
    await user.click(screen.getByRole("button", { name: /save picks/i }));

    await waitFor(() => expect(axiosInstance.put).toHaveBeenCalled());
    expect(axiosInstance.put.mock.calls[0][1]).toEqual({
      year: 2026,
      quarter: 3,
      album_ids: [11, 10],
    });
  });

  it("reorders a pick with the arrow controls", async () => {
    const user = userEvent.setup({ delay: null });
    mockApi({ picks: [], albums: [album(10, "Alpha"), album(11, "Beta")] });
    render(<QuarterlyPicks editable />);
    await openPicker(user);

    await user.click(await screen.findByRole("button", { name: /Alpha/ }));
    await user.click(screen.getByRole("button", { name: /Beta/ }));
    await user.click(screen.getByRole("button", { name: /move beta up/i }));
    await user.click(screen.getByRole("button", { name: /save picks/i }));

    await waitFor(() => expect(axiosInstance.put).toHaveBeenCalled());
    expect(axiosInstance.put.mock.calls[0][1].album_ids).toEqual([11, 10]);
  });

  it("removes a pick when chosen twice", async () => {
    const user = userEvent.setup({ delay: null });
    mockApi({ picks: [], albums: [album(10, "Alpha")] });
    render(<QuarterlyPicks editable />);
    await openPicker(user);

    const row = await screen.findByRole("button", { name: /Alpha/ });
    await user.click(row);
    await user.click(row);
    await user.click(screen.getByRole("button", { name: /save picks/i }));

    await waitFor(() => expect(axiosInstance.put).toHaveBeenCalled());
    expect(axiosInstance.put.mock.calls[0][1].album_ids).toEqual([]);
  });

  it("refuses a sixth pick", async () => {
    const user = userEvent.setup({ delay: null });
    const albums = [1, 2, 3, 4, 5, 6].map((n) => album(n, `Album ${n}`));
    mockApi({ picks: [], albums });
    render(<QuarterlyPicks editable />);
    await openPicker(user);

    for (const n of [1, 2, 3, 4, 5, 6]) {
      await user.click(await screen.findByRole("button", { name: new RegExp(`Album ${n}`) }));
    }
    await user.click(screen.getByRole("button", { name: /save picks/i }));

    expect(toast.info).toHaveBeenCalledWith(expect.stringMatching(/5 picks/i));
    await waitFor(() => expect(axiosInstance.put).toHaveBeenCalled());
    expect(axiosInstance.put.mock.calls[0][1].album_ids).toHaveLength(5);
  });

  it("reports a save rejection rather than closing the picker", async () => {
    // Covers the 409 a quarter locking mid-edit produces: the user has to
    // know the edit didn't land.
    const user = userEvent.setup({ delay: null });
    mockApi({ picks: [], albums: [album(10, "Alpha")] });
    axiosInstance.put.mockRejectedValue({
      response: { data: { message: "Q3 2026 is closed." } },
    });
    render(<QuarterlyPicks editable />);
    await openPicker(user);

    await user.click(await screen.findByRole("button", { name: /Alpha/ }));
    await user.click(screen.getByRole("button", { name: /save picks/i }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Q3 2026 is closed."));
    expect(screen.getByRole("button", { name: /save picks/i })).toBeInTheDocument();
  });

  it("explains an empty ballot rather than showing a blank panel", async () => {
    const user = userEvent.setup({ delay: null });
    mockApi({ picks: [], albums: [] });
    render(<QuarterlyPicks editable />);
    await openPicker(user);

    expect(await screen.findByText(/nothing is listed for this quarter yet/i)).toBeInTheDocument();
  });
});

describe("QuarterlyPicks — quarter history", () => {
  it("lets you switch to a past quarter", async () => {
    const user = userEvent.setup({ delay: null });
    mockApi({
      picks: [pick(1, 10, "Roll the Dice")],
      quarters: [
        { year: 2026, quarter: 3, pick_count: 5, locked: false },
        { year: 2026, quarter: 2, pick_count: 5, locked: true },
      ],
    });
    render(<QuarterlyPicks editable />);

    await user.click(await screen.findByRole("button", { name: /Q2 2026/ }));

    await waitFor(() =>
      expect(
        axiosInstance.get.mock.calls.some(([u]) => u.includes("year=2026&quarter=2"))
      ).toBe(true)
    );
  });

  it("shows no history nav when there are no past quarters", async () => {
    mockApi({ picks: [], quarters: [] });
    render(<QuarterlyPicks editable />);

    await screen.findByText(/five releases, ranked/i);
    expect(screen.queryByRole("navigation", { name: /choose a quarter/i })).not.toBeInTheDocument();
  });
});
