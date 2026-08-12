import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../utils";
import ProfilePage from "../../pages/profile/ProfilePage";

vi.mock("../../utils/axiosInstance", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));

// Heavy children — this file is about the profile shell, not their internals.
vi.mock("../../components/CreateArtistForm/CreateArtistForm", () => ({
  default: () => <div data-testid="create-artist-form" />,
}));
vi.mock("../../components/Messages/MessagesPanel", () => ({
  default: () => <div data-testid="messages-panel" />,
}));
vi.mock("../../components/StanCard/StanCard", () => ({
  default: () => <div data-testid="stan-card" />,
}));
vi.mock("../../components/ArtistCommunity/ArtistCommunity", () => ({
  default: () => <div data-testid="artist-community" />,
}));
vi.mock("../../components/BeefAllianceMap/BeefAllianceMap", () => ({
  default: () => <div data-testid="beef-alliance-map" />,
}));
vi.mock("../../components/FollowButton", () => ({
  default: () => <button type="button">Follow</button>,
}));
vi.mock("../../components/MessageButton", () => ({
  default: () => <button type="button">Message</button>,
}));

import axiosInstance from "../../utils/axiosInstance";

const LEGACY_KEY = "cratesfyi_profile_mode";

const renderOwnProfile = (profileList = []) =>
  renderWithProviders(<ProfilePage />, {
    preloadedState: {
      auth: { user: { id: 1, user_id: 1, username: "testuser" }, token: "t" },
      profileList: { list: profileList, loading: false, error: null },
    },
  });

// The Fan/Artist toggle was retired: the profile is a fan-side identity
// artifact, and artists reach their business surface via /artist-dashboard.
describe("ProfilePage — fan-side only", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Shape matters: fetchProfileList feeds its payload straight into the
    // reducer, so a bare {} leaves state.profileList.list undefined and the
    // page crashes on profileList.filter(Boolean).
    axiosInstance.get.mockImplementation((url) => {
      if (url.startsWith("/profile/list")) {
        return Promise.resolve({ data: { list: [] } });
      }
      if (url.startsWith("/profile/suggestions")) {
        return Promise.resolve({ data: [] });
      }
      if (url.includes("/followers") || url.includes("/following")) {
        return Promise.resolve({ data: [] });
      }
      if (url.startsWith("/feed/user/")) {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: {} });
    });
  });

  it("renders no Fan/Artist mode toggle", async () => {
    renderOwnProfile();

    await waitFor(() => expect(axiosInstance.get).toHaveBeenCalled());
    expect(screen.queryByRole("button", { name: /^fan$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^artist$/i })).not.toBeInTheDocument();
  });

  it("clears the retired profile-mode key out of localStorage on mount", async () => {
    localStorage.setItem(LEGACY_KEY, "artist");

    renderOwnProfile();

    await waitFor(() => expect(localStorage.getItem(LEGACY_KEY)).toBeNull());
  });

  it("leaves the still-functional CTA dismissal key alone", async () => {
    // cratesfyi_cta_dismissed is live per the auth-wall rules — renaming or
    // clearing it would re-show the sticky CTA to everyone who dismissed it.
    localStorage.setItem("cratesfyi_cta_dismissed", "1");
    localStorage.setItem(LEGACY_KEY, "artist");

    renderOwnProfile();

    await waitFor(() => expect(localStorage.getItem(LEGACY_KEY)).toBeNull());
    expect(localStorage.getItem("cratesfyi_cta_dismissed")).toBe("1");
  });

  it("shows no artist-only sections regardless of stored mode", async () => {
    localStorage.setItem(LEGACY_KEY, "artist");

    renderOwnProfile();

    await waitFor(() => expect(axiosInstance.get).toHaveBeenCalled());
    expect(
      screen.queryByRole("heading", { name: /^events$/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /list rank stats/i })
    ).not.toBeInTheDocument();
  });

  it("never requests the artist-only events feed", async () => {
    localStorage.setItem(LEGACY_KEY, "artist");

    renderOwnProfile();

    await waitFor(() => expect(axiosInstance.get).toHaveBeenCalled());
    const urls = axiosInstance.get.mock.calls.map(([u]) => u);
    expect(urls.some((u) => u.startsWith("/events"))).toBe(false);
  });

  it("still renders the fan-side Top 20 section", async () => {
    renderOwnProfile();

    // "Top 20" also appears as a stat label, so target the section heading.
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /top 20/i })
      ).toBeInTheDocument()
    );
  });
});
