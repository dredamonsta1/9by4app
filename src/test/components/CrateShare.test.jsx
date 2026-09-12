import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CrateShare, { CRATE_MIN, CRATE_MAX } from "../../components/CrateShare/CrateShare";

vi.mock("../../utils/axiosInstance", () => ({
  default: { post: vi.fn() },
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
  await user.click(screen.getByRole("button", { name: /share a crate/i }));
};

beforeEach(() => {
  vi.clearAllMocks();
  axiosInstance.post.mockResolvedValue({ data: { crate: { slug: "abc123" } } });
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
    await open(user);

    expect(screen.getByRole("button", { name: "Artist 1" })).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${CRATE_MIN}–${CRATE_MAX} artists`))).toBeInTheDocument();
  });

  it("will not create below the minimum", async () => {
    const user = userEvent.setup({ delay: null });
    render(<CrateShare artists={artists(8)} />);
    await open(user);

    await user.type(screen.getByPlaceholderText(/name it/i), "Starters");
    await user.click(screen.getByRole("button", { name: "Artist 1" }));

    expect(screen.getByRole("button", { name: /pick 2 more/i })).toBeDisabled();
  });

  it("requires a name", async () => {
    const user = userEvent.setup({ delay: null });
    render(<CrateShare artists={artists(8)} />);
    await open(user);

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
    await open(user);

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
    await open(user);

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

  it("shows the link, since that is the deliverable", async () => {
    const user = userEvent.setup({ delay: null });
    render(<CrateShare artists={artists(8)} />);
    await open(user);

    await user.type(screen.getByPlaceholderText(/name it/i), "Starters");
    for (const n of [1, 2, 3]) {
      await user.click(screen.getByRole("button", { name: `Artist ${n}` }));
    }
    await user.click(screen.getByRole("button", { name: /create crate/i }));

    expect(await screen.findByText(/\/crate\/abc123/)).toBeInTheDocument();
  });

  it("surfaces a failure rather than pretending it worked", async () => {
    const user = userEvent.setup({ delay: null });
    axiosInstance.post.mockRejectedValue({
      response: { data: { message: "Some of those artists don't exist." } },
    });
    render(<CrateShare artists={artists(8)} />);
    await open(user);

    await user.type(screen.getByPlaceholderText(/name it/i), "Starters");
    for (const n of [1, 2, 3]) {
      await user.click(screen.getByRole("button", { name: `Artist ${n}` }));
    }
    await user.click(screen.getByRole("button", { name: /create crate/i }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Some of those artists don't exist.")
    );
  });
});
