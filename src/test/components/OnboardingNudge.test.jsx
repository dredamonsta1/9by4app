import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import OnboardingNudge from "../../components/NavBar/OnboardingNudge";
import { ONBOARDING_DISMISSED_KEY } from "../../components/OnboardingChecklist/OnboardingChecklist";

const fetchSpy = vi.fn();
vi.mock("../../redux/actions/profileListActions", () => ({
  fetchProfileList: () => {
    fetchSpy();
    return { type: "profileList/noop" };
  },
}));

const artist = (id) => ({ artist_id: id, artist_name: `Artist ${id}` });

const renderNudge = ({ user = { user_id: 1 }, list = [], loaded = true, loading = false } = {}) => {
  const store = configureStore({
    reducer: {
      auth: () => ({ user }),
      profileList: () => ({ list, loaded, loading }),
    },
  });
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <OnboardingNudge />
      </MemoryRouter>
    </Provider>
  );
};

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("OnboardingNudge", () => {
  it("shows progress toward three artists", () => {
    renderNudge({ list: [artist(1)] });

    expect(screen.getByRole("link")).toHaveAccessibleName(/1 of 3 artists added/i);
    expect(screen.getByText("Add 2 artists")).toBeInTheDocument();
  });

  it("says '1 more artist' on the last step", () => {
    // The final step should read as nearly done, not as another item.
    renderNudge({ list: [artist(1), artist(2)] });

    expect(screen.getByText("1 more artist")).toBeInTheDocument();
  });

  it("points at the profile, where the real checklist lives", () => {
    renderNudge({ list: [] });

    expect(screen.getByRole("link")).toHaveAttribute("href", "/profile");
  });

  it("disappears once the target is met", () => {
    const { container } = renderNudge({
      list: [artist(1), artist(2), artist(3)],
    });

    expect(container).toBeEmptyDOMElement();
  });

  it("stays gone past the target", () => {
    const { container } = renderNudge({
      list: [1, 2, 3, 4, 5].map(artist),
    });

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing for a logged-out visitor", () => {
    const { container } = renderNudge({ user: null, list: [] });

    expect(container).toBeEmptyDOMElement();
  });

  it("respects a dismissal made on the profile checklist", () => {
    // Same key as OnboardingChecklist — a badge that outlives an explicit
    // dismissal reads as nagging.
    localStorage.setItem(ONBOARDING_DISMISSED_KEY, "1");
    const { container } = renderNudge({ list: [] });

    expect(container).toBeEmptyDOMElement();
  });

  describe("before the list has loaded", () => {
    it("renders nothing rather than assuming zero", async () => {
      // Only ArtistPanel and ProfilePage fetch the list, so elsewhere an
      // empty list means "no request yet". Rendering "Add 3 artists" and
      // correcting it a moment later would be worse than a beat of nothing.
      const { container } = renderNudge({ list: [], loaded: false });

      expect(container).toBeEmptyDOMElement();
    });

    it("fetches the list itself so the count is right anywhere", async () => {
      renderNudge({ list: [], loaded: false });

      await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
    });

    it("does not refetch a list that is already loaded", () => {
      renderNudge({ list: [artist(1)], loaded: true });

      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("does not stack a fetch on top of one in flight", () => {
      renderNudge({ list: [], loaded: false, loading: true });

      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("does not fetch for a logged-out visitor", () => {
      renderNudge({ user: null, loaded: false });

      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });
});
