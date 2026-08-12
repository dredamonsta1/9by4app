import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import GuestAddPrompt from "../../components/GuestAddPrompt/GuestAddPrompt";
import { PENDING_STAN_KEY } from "../../utils/pendingStan";

const artist = { artist_id: 130427, artist_name: "Ballad", image_url: null };

const renderPrompt = (props = {}) =>
  render(
    <BrowserRouter>
      <GuestAddPrompt artist={artist} onClose={() => {}} {...props} />
    </BrowserRouter>
  );

describe("GuestAddPrompt", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("names the artist the guest was reaching for", () => {
    renderPrompt();

    expect(
      screen.getByRole("heading", { name: /sign up to stan ballad/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/ballad is your first pick/i)).toBeInTheDocument();
  });

  it("parks the artist when the guest takes the signup path", async () => {
    renderPrompt();

    await userEvent.click(screen.getByRole("link", { name: /join the waitlist/i }));

    expect(JSON.parse(localStorage.getItem(PENDING_STAN_KEY))).toMatchObject({
      artist_id: 130427,
      artist_name: "Ballad",
    });
  });

  it("parks nothing when the guest backs out", async () => {
    const onClose = vi.fn();
    renderPrompt({ onClose });

    await userEvent.click(screen.getByRole("button", { name: /not now/i }));

    expect(localStorage.getItem(PENDING_STAN_KEY)).toBeNull();
    expect(onClose).toHaveBeenCalled();
  });

  it("still closes the modal on the signup path", async () => {
    const onClose = vi.fn();
    renderPrompt({ onClose });

    await userEvent.click(screen.getByRole("link", { name: /join the waitlist/i }));

    expect(onClose).toHaveBeenCalled();
  });

  it("falls back to generic copy with no artist", () => {
    renderPrompt({ artist: undefined });

    expect(
      screen.getByRole("heading", { name: /sign up to stan this artist/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/add artists to your top 20/i)).toBeInTheDocument();
  });

  it("still accepts the legacy artistName prop", () => {
    renderPrompt({ artist: undefined, artistName: "Imani Imani" });

    expect(
      screen.getByRole("heading", { name: /sign up to stan imani imani/i })
    ).toBeInTheDocument();
  });
});
