import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { renderWithProviders, buildMockStore } from "../utils";
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

// ProfilePage dispatches fetchProfileList() on mount, which overwrites the
// preloaded slice with whatever /profile/list returns. renderOwnProfile keeps
// the two in agreement — otherwise every assertion races a reset to [].
let listFixture = [];

const renderOwnProfile = (profileList = []) => {
  listFixture = profileList;
  return renderWithProviders(<ProfilePage />, {
    preloadedState: {
      auth: { user: { id: 1, user_id: 1, username: "testuser" }, token: "t" },
      profileList: { list: profileList, loading: false, error: null },
    },
  });
};

// The Fan/Artist toggle was retired: the profile is a fan-side identity
// artifact, and artists reach their business surface via /artist-dashboard.
describe("ProfilePage — fan-side only", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    listFixture = [];
    // Shape matters: fetchProfileList feeds its payload straight into the
    // reducer, so a bare {} leaves state.profileList.list undefined and the
    // page crashes on profileList.filter(Boolean).
    axiosInstance.get.mockImplementation((url) => {
      if (url.startsWith("/profile/list")) {
        return Promise.resolve({ data: { list: listFixture } });
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

const artist = (id) => ({
  artist_id: id,
  artist_name: `Artist ${id}`,
  genre: "Hip Hop",
});

describe("ProfilePage — first-run onboarding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    listFixture = [];
    axiosInstance.get.mockImplementation((url) => {
      if (url.startsWith("/profile/list"))
        return Promise.resolve({ data: { list: listFixture } });
      if (url.startsWith("/profile/suggestions")) return Promise.resolve({ data: [] });
      if (url.includes("/followers") || url.includes("/following"))
        return Promise.resolve({ data: [] });
      if (url.startsWith("/feed/user/")) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: {} });
    });
    axiosInstance.post.mockResolvedValue({
      data: { title: "Dusty Fingers", description: "You dig for the loop." },
    });
  });

  it("shows progress to a user short of three artists", async () => {
    renderOwnProfile([artist(1)]);

    expect(await screen.findByText("1 of 3 artists picked")).toBeInTheDocument();
  });

  it("does not show on someone else's profile", async () => {
    // renderWithProviders wraps in a bare BrowserRouter, so useParams() has
    // nothing to read and every profile looks like your own. Needs a real
    // matched route to exercise the isOwnProfile branch.
    render(
      <Provider
        store={buildMockStore({
          auth: { user: { id: 1, user_id: 1, username: "me" }, token: "t" },
          profileList: { list: [artist(1)], loading: false, error: null },
        })}
      >
        <MemoryRouter initialEntries={["/profile/2"]}>
          <Routes>
            <Route path="/profile/:userId" element={<ProfilePage />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => expect(axiosInstance.get).toHaveBeenCalled());
    expect(screen.queryByText(/artists picked/i)).not.toBeInTheDocument();
  });

  it("stays hidden once skipped", async () => {
    localStorage.setItem("stanbox_onboarding_dismissed", "1");

    renderOwnProfile([artist(1)]);

    await waitFor(() => expect(axiosInstance.get).toHaveBeenCalled());
    expect(screen.queryByText(/artists picked/i)).not.toBeInTheDocument();
  });

  it("remembers a skip for next time", async () => {
    renderOwnProfile([artist(1)]);
    await screen.findByText("1 of 3 artists picked");

    await userEvent.click(screen.getByRole("button", { name: /skip/i }));

    expect(localStorage.getItem("stanbox_onboarding_dismissed")).toBe("1");
    expect(screen.queryByText(/artists picked/i)).not.toBeInTheDocument();
  });

  it("is absent for a user already past the target", async () => {
    renderOwnProfile([artist(1), artist(2), artist(3)]);

    await waitFor(() => expect(axiosInstance.get).toHaveBeenCalled());
    expect(screen.queryByText(/artists picked/i)).not.toBeInTheDocument();
  });

  describe("taste comps", () => {
    it("stays locked until the user hits the target", async () => {
      renderOwnProfile([artist(1), artist(2)]);

      await screen.findByText("2 of 3 artists picked");
      const urls = axiosInstance.get.mock.calls.map(([u]) => u);
      expect(urls.some((u) => u.includes("related-artists"))).toBe(false);
    });

    it("unlocks at the same threshold as the personality", async () => {
      renderOwnProfile([artist(1), artist(2), artist(3)]);

      await waitFor(() => {
        const urls = axiosInstance.get.mock.calls.map(([u]) => u);
        expect(urls.some((u) => u.includes("related-artists"))).toBe(true);
      });
    });

    it("is not fetched on someone else's profile", async () => {
      render(
        <Provider
          store={buildMockStore({
            auth: { user: { id: 1, user_id: 1, username: "me" }, token: "t" },
            profileList: {
              list: [artist(1), artist(2), artist(3)],
              loading: false,
              error: null,
            },
          })}
        >
          <MemoryRouter initialEntries={["/profile/2"]}>
            <Routes>
              <Route path="/profile/:userId" element={<ProfilePage />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      await waitFor(() => expect(axiosInstance.get).toHaveBeenCalled());
      const urls = axiosInstance.get.mock.calls.map(([u]) => u);
      expect(urls.some((u) => u.includes("related-artists"))).toBe(false);
    });
  });

  describe("auto-reveal", () => {
    it("fires the analysis when the third artist lands", async () => {
      const { store } = renderOwnProfile([artist(1), artist(2)]);
      await screen.findByText("2 of 3 artists picked");

      store.dispatch({
        type: "profileList/setProfileListSuccess",
        payload: [artist(1), artist(2), artist(3)],
      });

      await waitFor(() =>
        expect(axiosInstance.post).toHaveBeenCalledWith(
          "/users/me/music-personality",
          expect.anything()
        )
      );

      // Exactly one personality on the page. It used to render twice — a
      // celebratory reveal at the top and a permanent card lower down —
      // which read as a rendering bug. One card now owns both jobs.
      const card = await screen.findByText(/your music personality/i);
      expect(
        within(card.closest("section")).getByText("Dusty Fingers")
      ).toBeInTheDocument();
      expect(screen.getAllByText("Dusty Fingers")).toHaveLength(1);
      expect(
        within(card.closest("section")).getByRole("button", { name: /regenerate/i })
      ).toBeInTheDocument();
    });

    it("does not fire on mount for someone already at three", async () => {
      renderOwnProfile([artist(1), artist(2), artist(3)]);

      await waitFor(() => expect(axiosInstance.get).toHaveBeenCalled());
      expect(axiosInstance.post).not.toHaveBeenCalled();
    });

    it("does not overwrite a personality the user already has", async () => {
      // /users/me reports an existing personality, so crossing the target
      // again (e.g. after dropping to 2) must not silently regenerate it.
      axiosInstance.get.mockImplementation((url) => {
        if (url === "/users/me") {
          return Promise.resolve({
            data: {
              music_personality_title: "Crate Digger",
              music_personality_desc: "Existing.",
            },
          });
        }
        if (url.startsWith("/profile/list"))
          return Promise.resolve({ data: { list: listFixture } });
        return Promise.resolve({ data: [] });
      });

      const { store } = renderOwnProfile([artist(1), artist(2)]);
      await screen.findByText("2 of 3 artists picked");

      store.dispatch({
        type: "profileList/setProfileListSuccess",
        payload: [artist(1), artist(2), artist(3)],
      });

      await waitFor(() =>
        expect(screen.queryByText(/artists picked/i)).not.toBeInTheDocument()
      );
      expect(axiosInstance.post).not.toHaveBeenCalled();
    });

    it("leaves the artist added even when the analysis fails", async () => {
      axiosInstance.post.mockRejectedValue(new Error("AI down"));
      const { store } = renderOwnProfile([artist(1), artist(2)]);
      await screen.findByText("2 of 3 artists picked");

      store.dispatch({
        type: "profileList/setProfileListSuccess",
        payload: [artist(1), artist(2), artist(3)],
      });

      await waitFor(() => expect(axiosInstance.post).toHaveBeenCalled());
      // No reveal, no crash — the manual button in Section 5 remains.
      expect(screen.queryByText("Dusty Fingers")).not.toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: /top 20/i })
      ).toBeInTheDocument();
    });
  });
});
