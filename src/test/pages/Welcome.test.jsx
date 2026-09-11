import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import Welcome from "../../pages/Welcome/Welcome";

const navigateSpy = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => navigateSpy };
});

vi.mock("../../utils/axiosInstance", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

const addSpy = vi.fn();
vi.mock("../../redux/actions/profileListActions", () => ({
  fetchProfileList: () => ({ type: "noop" }),
  addArtistToProfileList: (artist) => {
    addSpy(artist);
    return { type: "noop" };
  },
  MAX_FAVORITE_ARTISTS: 20,
}));

import axiosInstance from "../../utils/axiosInstance";

const artist = (id, name) => ({
  artist_id: id,
  artist_name: name,
  image_url: null,
  genre: "Hip Hop",
});

const renderWelcome = (list = []) =>
  render(
    <Provider
      store={configureStore({
        reducer: { profileList: () => ({ list, loaded: true, loading: false }) },
      })}
    >
      <MemoryRouter>
        <Welcome />
      </MemoryRouter>
    </Provider>
  );

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  axiosInstance.get.mockResolvedValue({ data: { artists: [] } });
});

describe("Welcome — the first screen", () => {
  it("shows no grid until a genre is tapped", async () => {
    // The default artist sort is clout, and only ~57 artists have any, so an
    // ungated grid opens on ":wumpscut:" and "!!!".
    renderWelcome();

    expect(screen.getByText(/tap a genre to see artists/i)).toBeInTheDocument();
    expect(axiosInstance.get).not.toHaveBeenCalled();
  });

  it("says three unlocks it but twenty slots exist", () => {
    // Three is the unlock, twenty is the shrine — a user who thinks the job
    // is "pick 3" has a different mental model from one starting a Top 20.
    renderWelcome();

    expect(screen.getByText(/20 slots/i)).toBeInTheDocument();
    expect(screen.getByText(/0 of 20/)).toBeInTheDocument();
  });

  it("loads artists for a tapped genre", async () => {
    const user = userEvent.setup({ delay: null });
    axiosInstance.get.mockResolvedValue({
      data: { artists: [artist(1, "Kendrick Lamar")] },
    });
    renderWelcome();

    await user.click(screen.getByRole("button", { name: "Hip Hop" }));

    expect(await screen.findByText("Kendrick Lamar")).toBeInTheDocument();
    expect(axiosInstance.get.mock.calls[0][0]).toContain("genre=Hip+Hop");
  });

  it("searches by name instead of genre", async () => {
    const user = userEvent.setup({ delay: null });
    renderWelcome();

    await user.type(screen.getByLabelText(/search for an artist/i), "calu");
    await user.click(screen.getByRole("button", { name: /^search$/i }));

    await waitFor(() => expect(axiosInstance.get).toHaveBeenCalled());
    expect(axiosInstance.get.mock.calls[0][0]).toContain("search=calu");
  });

  it("adds an artist on tap", async () => {
    const user = userEvent.setup({ delay: null });
    axiosInstance.get.mockResolvedValue({
      data: { artists: [artist(1, "Kendrick Lamar")] },
    });
    renderWelcome();
    await user.click(screen.getByRole("button", { name: "Hip Hop" }));

    await user.click(await screen.findByRole("button", { name: /Kendrick Lamar/ }));

    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ artist_id: 1 }));
  });
});

describe("Welcome — the gate to the payoff", () => {
  it("will not reveal below three artists", () => {
    renderWelcome([artist(1, "A"), artist(2, "B")]);

    expect(screen.getByRole("button", { name: /pick 1 more/i })).toBeDisabled();
  });

  it("offers the reveal at three", () => {
    renderWelcome([artist(1, "A"), artist(2, "B"), artist(3, "C")]);

    expect(
      screen.getByRole("button", { name: /reveal my music personality/i })
    ).toBeEnabled();
  });

  it("shows the personality rather than dropping straight to the profile", async () => {
    const user = userEvent.setup({ delay: null });
    axiosInstance.post.mockResolvedValue({
      data: { title: "The Crate Digger", description: "You go deep." },
    });
    renderWelcome([artist(1, "A"), artist(2, "B"), artist(3, "C")]);

    await user.click(screen.getByRole("button", { name: /reveal my music personality/i }));

    expect(await screen.findByText("The Crate Digger")).toBeInTheDocument();
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it("moves to the profile after the reveal", async () => {
    const user = userEvent.setup({ delay: null });
    axiosInstance.post.mockResolvedValue({
      data: { title: "The Crate Digger", description: "You go deep." },
    });
    renderWelcome([artist(1, "A"), artist(2, "B"), artist(3, "C")]);

    await user.click(screen.getByRole("button", { name: /reveal my music personality/i }));
    await user.click(await screen.findByRole("button", { name: /see your profile/i }));

    expect(navigateSpy).toHaveBeenCalledWith("/profile");
  });

  it("still reaches the profile when generation fails", async () => {
    // The artists are already saved and the profile generates the card
    // itself. Stranding someone on an error at the moment the product is
    // trying to delight them is worse than skipping the flourish.
    const user = userEvent.setup({ delay: null });
    axiosInstance.post.mockRejectedValue(new Error("AI down"));
    renderWelcome([artist(1, "A"), artist(2, "B"), artist(3, "C")]);

    await user.click(screen.getByRole("button", { name: /reveal my music personality/i }));

    await waitFor(() => expect(navigateSpy).toHaveBeenCalledWith("/profile"));
  });
});

describe("Welcome — skipping", () => {
  it("lets you leave", async () => {
    const user = userEvent.setup({ delay: null });
    renderWelcome();

    await user.click(screen.getByRole("button", { name: /i'll do this later/i }));

    expect(navigateSpy).toHaveBeenCalledWith("/");
  });

  it("does not silence the navbar nudge", async () => {
    // Skip is "not now"; dismiss is "stop asking". Setting the dismissal key
    // here would kill the only thing left to bring them back, since the
    // auto-redirect fires once.
    const user = userEvent.setup({ delay: null });
    renderWelcome();

    await user.click(screen.getByRole("button", { name: /i'll do this later/i }));

    expect(localStorage.getItem("stanbox_onboarding_dismissed")).toBeNull();
  });
});
