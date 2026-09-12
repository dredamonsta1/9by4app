import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import Crate from "../../pages/Crate/Crate";

const navigateSpy = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => navigateSpy };
});

vi.mock("../../utils/axiosInstance", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

vi.mock("../../redux/actions/profileListActions", () => ({
  fetchProfileList: () => ({ type: "noop" }),
}));

import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

const crate = (over = {}) => ({
  crate_id: 1,
  slug: "abc123",
  name: "Southern starters",
  owner_username: "andrew3",
  artists: [
    { artist_id: 10, artist_name: "Bun B", genre: "Hip Hop", image_url: null },
    { artist_id: 11, artist_name: "Future", genre: "Trap", image_url: null },
    { artist_id: 12, artist_name: "Ka", genre: "Hip Hop", image_url: null },
  ],
  ...over,
});

const renderCrate = (user = { user_id: 1 }) =>
  render(
    <Provider store={configureStore({ reducer: { auth: () => ({ user }) } })}>
      <MemoryRouter initialEntries={["/crate/abc123"]}>
        <Routes>
          <Route path="/crate/:slug" element={<Crate />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );

beforeEach(() => {
  vi.clearAllMocks();
  axiosInstance.get.mockResolvedValue({ data: { crate: crate() } });
});

describe("Crate — viewing", () => {
  it("names the crate and who made it", async () => {
    renderCrate();

    expect(await screen.findByText("Southern starters")).toBeInTheDocument();
    expect(screen.getByText(/a crate from andrew3/i)).toBeInTheDocument();
  });

  it("lists the artists", async () => {
    renderCrate();

    expect(await screen.findByText("Bun B")).toBeInTheDocument();
    expect(screen.getByText("Future")).toBeInTheDocument();
  });

  it("is viewable logged out — a crate that 404s cannot travel", async () => {
    renderCrate(null);

    expect(await screen.findByText("Southern starters")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in to adopt/i })).toBeInTheDocument();
  });

  it("offers no adopt button to a logged-out visitor", async () => {
    // Browsing is free, committing needs an account.
    renderCrate(null);

    await screen.findByText("Southern starters");
    expect(screen.queryByRole("button", { name: /adopt all/i })).not.toBeInTheDocument();
  });

  it("explains a bad link rather than showing an empty page", async () => {
    axiosInstance.get.mockRejectedValue({ response: { status: 404 } });
    renderCrate();

    expect(await screen.findByText(/doesn't exist, or the link is wrong/i)).toBeInTheDocument();
  });
});

describe("Crate — adopting", () => {
  const adoptReturns = (data) => axiosInstance.post.mockResolvedValue({ data });

  it("adds every artist and says so", async () => {
    const user = userEvent.setup({ delay: null });
    adoptReturns({
      added_count: 3,
      crate_size: 3,
      already_had: 0,
      list_full: false,
      list_total: 3,
    });
    renderCrate();

    await user.click(await screen.findByRole("button", { name: /adopt all 3/i }));

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Added all 3 to your Top 20."));
  });

  it("reports a partial add rather than claiming success", async () => {
    // An 18-artist list taking a 5-crate gets 2. Saying "done" would leave
    // someone wondering where the other three went.
    const user = userEvent.setup({ delay: null });
    adoptReturns({
      added_count: 2,
      crate_size: 3,
      already_had: 0,
      list_full: true,
      list_total: 20,
    });
    renderCrate();

    await user.click(await screen.findByRole("button", { name: /adopt all 3/i }));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        "Added 2 of 3 — your Top 20 is full."
      )
    );
  });

  it("distinguishes a full list from artists already held", async () => {
    const user = userEvent.setup({ delay: null });
    adoptReturns({
      added_count: 1,
      crate_size: 3,
      already_had: 2,
      list_full: false,
      list_total: 9,
    });
    renderCrate();

    await user.click(await screen.findByRole("button", { name: /adopt all 3/i }));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        "Added 1 of 3 — you already had the rest."
      )
    );
  });

  it("says something useful when nothing was added", async () => {
    const user = userEvent.setup({ delay: null });
    adoptReturns({
      added_count: 0,
      crate_size: 3,
      already_had: 3,
      list_full: false,
      list_total: 12,
    });
    renderCrate();

    await user.click(await screen.findByRole("button", { name: /adopt all 3/i }));

    await waitFor(() =>
      expect(toast.info).toHaveBeenCalledWith("You already had every artist in this crate.")
    );
  });

  it("ends in the payoff when the adopter crosses three", async () => {
    // Crossing three via a crate should feel identical to picking three by
    // hand, because it is.
    const user = userEvent.setup({ delay: null });
    adoptReturns({
      added_count: 3,
      crate_size: 3,
      already_had: 0,
      list_full: false,
      list_total: 3,
    });
    renderCrate();

    await user.click(await screen.findByRole("button", { name: /adopt all 3/i }));

    await waitFor(() => expect(navigateSpy).toHaveBeenCalledWith("/welcome"));
  });

  it("goes to the profile when still short of three", async () => {
    const user = userEvent.setup({ delay: null });
    adoptReturns({
      added_count: 1,
      crate_size: 3,
      already_had: 0,
      list_full: true,
      list_total: 2,
    });
    renderCrate();

    await user.click(await screen.findByRole("button", { name: /adopt all 3/i }));

    await waitFor(() => expect(navigateSpy).toHaveBeenCalledWith("/profile"));
  });

  it("surfaces a failure instead of navigating away", async () => {
    const user = userEvent.setup({ delay: null });
    axiosInstance.post.mockRejectedValue({
      response: { data: { message: "Crate not found." } },
    });
    renderCrate();

    await user.click(await screen.findByRole("button", { name: /adopt all 3/i }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Crate not found."));
    expect(navigateSpy).not.toHaveBeenCalled();
  });
});
