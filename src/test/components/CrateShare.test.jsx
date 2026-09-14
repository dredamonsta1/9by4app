import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CrateShare, { CRATE_MIN, CRATE_MAX } from "../../components/CrateShare/CrateShare";

vi.mock("../../utils/axiosInstance", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));

vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

const artists = (n) =>
  Array.from({ length: n }, (_, i) => ({
    artist_id: i + 1,
    artist_name: `Artist ${i + 1}`,
  }));

const open = async (user) => {
  await user.click(screen.getByRole("button", { name: /your crates/i }));
};

const openCreate = async (user) => {
  await open(user);
  await user.click(
    await screen.findByRole("button", { name: /new crate|make your first crate/i })
  );
};

beforeEach(() => {
  vi.clearAllMocks();
  axiosInstance.get.mockResolvedValue({ data: { crates: [] } });
  axiosInstance.post.mockResolvedValue({ data: { crate: { slug: "abc123" } } });
  axiosInstance.patch.mockResolvedValue({ data: { crate: { name: "Renamed" } } });
});

describe("CrateShare", () => {
  it("stays hidden until there are enough artists to share", () => {
    // Nothing to recommend from a list of two.
    const { container } = render(<CrateShare artists={artists(CRATE_MIN - 1)} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("offers a subset of the Top 20, not the whole list", async () => {
    // The #1 slot is the most personal thing on the platform — sharing the
    // list wholesale reads as "be me", not "here's a start".
    const user = userEvent.setup({ delay: null });
    render(<CrateShare artists={artists(8)} />);
    await openCreate(user);

    expect(screen.getByRole("button", { name: "Artist 1" })).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${CRATE_MIN}–${CRATE_MAX} artists`))).toBeInTheDocument();
  });

  it("will not create below the minimum", async () => {
    const user = userEvent.setup({ delay: null });
    render(<CrateShare artists={artists(8)} />);
    await openCreate(user);

    await user.type(screen.getByPlaceholderText(/name it/i), "Starters");
    await user.click(screen.getByRole("button", { name: "Artist 1" }));

    expect(screen.getByRole("button", { name: /pick 2 more/i })).toBeDisabled();
  });

  it("requires a name", async () => {
    const user = userEvent.setup({ delay: null });
    render(<CrateShare artists={artists(8)} />);
    await openCreate(user);

    for (const n of [1, 2, 3]) {
      await user.click(screen.getByRole("button", { name: `Artist ${n}` }));
    }

    expect(screen.getByRole("button", { name: /create crate/i })).toBeDisabled();
  });

  it("caps the crate at ten", async () => {
    // More than half of someone's 20 slots leaves them no room to be
    // themselves.
    const user = userEvent.setup({ delay: null });
    render(<CrateShare artists={artists(14)} />);
    await openCreate(user);

    for (let n = 1; n <= 11; n++) {
      await user.click(screen.getByRole("button", { name: `Artist ${n}` }));
    }

    expect(toast.info).toHaveBeenCalledWith(
      expect.stringContaining(`${CRATE_MAX} artists`)
    );
    expect(screen.getByRole("button", { name: /create crate \(10\)/i })).toBeInTheDocument();
  });

  it("creates the crate with the chosen artists in order", async () => {
    const user = userEvent.setup({ delay: null });
    render(<CrateShare artists={artists(8)} />);
    await openCreate(user);

    await user.type(screen.getByPlaceholderText(/name it/i), "Southern starters");
    await user.click(screen.getByRole("button", { name: "Artist 3" }));
    await user.click(screen.getByRole("button", { name: "Artist 1" }));
    await user.click(screen.getByRole("button", { name: "Artist 2" }));
    await user.click(screen.getByRole("button", { name: /create crate/i }));

    await waitFor(() => expect(axiosInstance.post).toHaveBeenCalled());
    expect(axiosInstance.post).toHaveBeenCalledWith("/crates", {
      name: "Southern starters",
      artist_ids: [3, 1, 2],
    });
  });

  it("returns to the list so the new link is findable", async () => {
    // Creation used to show the link once and lose it. The link living in
    // the list is the whole point of this view.
    const user = userEvent.setup({ delay: null });
    render(<CrateShare artists={artists(8)} />);
    await openCreate(user);

    await user.type(screen.getByPlaceholderText(/name it/i), "Starters");
    for (const n of [1, 2, 3]) {
      await user.click(screen.getByRole("button", { name: `Artist ${n}` }));
    }
    axiosInstance.get.mockResolvedValue({
      data: {
        crates: [{ slug: "abc123", name: "Starters", artist_count: 3, adoptions: 0 }],
      },
    });
    await user.click(screen.getByRole("button", { name: /create crate/i }));

    expect(await screen.findByText(/\/crate\/abc123/)).toBeInTheDocument();
  });

  it("surfaces a failure rather than pretending it worked", async () => {
    const user = userEvent.setup({ delay: null });
    axiosInstance.post.mockRejectedValue({
      response: { data: { message: "Some of those artists don't exist." } },
    });
    render(<CrateShare artists={artists(8)} />);
    await openCreate(user);

    await user.type(screen.getByPlaceholderText(/name it/i), "Starters");
    for (const n of [1, 2, 3]) {
      await user.click(screen.getByRole("button", { name: `Artist ${n}` }));
    }
    await user.click(screen.getByRole("button", { name: /create crate/i }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Some of those artists don't exist.")
    );
  });

  describe("the list", () => {
    const existing = [
      { slug: "abc123", name: "Classic makers", artist_count: 3, adoptions: 0 },
      { slug: "xyz789", name: "Rising talent", artist_count: 4, adoptions: 2 },
    ];

    it("shows every crate with its link", async () => {
      // Creating used to reveal the link once, so a crate URL was
      // unrecoverable the moment the panel closed — the owner had to query
      // the database to find their own share links.
      const user = userEvent.setup({ delay: null });
      axiosInstance.get.mockResolvedValue({ data: { crates: existing } });
      render(<CrateShare artists={artists(8)} />);
      await open(user);

      expect(await screen.findByText("Classic makers")).toBeInTheDocument();
      expect(screen.getByText(/\/crate\/xyz789/)).toBeInTheDocument();
    });

    it("reports adoptions, which is how the feature is judged", async () => {
      const user = userEvent.setup({ delay: null });
      axiosInstance.get.mockResolvedValue({ data: { crates: existing } });
      render(<CrateShare artists={artists(8)} />);
      await open(user);

      expect(await screen.findByText(/3 artists · 0 adoptions/)).toBeInTheDocument();
      expect(screen.getByText(/4 artists · 2 adoptions/)).toBeInTheDocument();
    });

    it("renames a crate", async () => {
      const user = userEvent.setup({ delay: null });
      axiosInstance.get.mockResolvedValue({ data: { crates: [existing[1]] } });
      render(<CrateShare artists={artists(8)} />);
      await open(user);

      await user.click(await screen.findByRole("button", { name: /rename/i }));
      const field = screen.getByLabelText(/rename rising talent/i);
      await user.clear(field);
      await user.type(field, "Rising talent 2026");
      await user.click(screen.getByRole("button", { name: /^save$/i }));

      await waitFor(() =>
        expect(axiosInstance.patch).toHaveBeenCalledWith("/crates/xyz789", {
          name: "Rising talent 2026",
        })
      );
    });

    it("shows the new name without a refetch", async () => {
      const user = userEvent.setup({ delay: null });
      axiosInstance.get.mockResolvedValue({ data: { crates: [existing[1]] } });
      render(<CrateShare artists={artists(8)} />);
      await open(user);

      await user.click(await screen.findByRole("button", { name: /rename/i }));
      const field = screen.getByLabelText(/rename rising talent/i);
      await user.clear(field);
      await user.type(field, "Renamed");
      await user.click(screen.getByRole("button", { name: /^save$/i }));

      expect(await screen.findByText("Renamed")).toBeInTheDocument();
    });

    it("surfaces a failed rename rather than showing a name that did not save", async () => {
      const user = userEvent.setup({ delay: null });
      axiosInstance.get.mockResolvedValue({ data: { crates: [existing[1]] } });
      axiosInstance.patch.mockRejectedValue({
        response: { data: { message: "Crate not found." } },
      });
      render(<CrateShare artists={artists(8)} />);
      await open(user);

      await user.click(await screen.findByRole("button", { name: /rename/i }));
      await user.click(screen.getByRole("button", { name: /^save$/i }));

      await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Crate not found."));
      // Still editable, so the attempt can be retried rather than discarded.
      expect(screen.getByLabelText(/rename rising talent/i)).toBeInTheDocument();
    });

    it("still lets you create when the list fails to load", async () => {
      // A broken list must not block the thing the panel is for.
      const user = userEvent.setup({ delay: null });
      axiosInstance.get.mockRejectedValue(new Error("down"));
      render(<CrateShare artists={artists(8)} />);
      await open(user);

      expect(
        await screen.findByRole("button", { name: /make your first crate/i })
      ).toBeInTheDocument();
    });
  });
});
