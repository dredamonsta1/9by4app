import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import FirstRunGate, {
  WELCOME_SKIPPED_KEY,
} from "../../components/FirstRunGate/FirstRunGate";

const navigateSpy = vi.fn();
let pathname = "/";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateSpy,
    useLocation: () => ({ pathname }),
  };
});

const fetchSpy = vi.fn();
vi.mock("../../redux/actions/profileListActions", () => ({
  fetchProfileList: () => {
    fetchSpy();
    return { type: "noop" };
  },
}));

const renderGate = ({
  user = { user_id: 1 },
  list = [],
  loaded = true,
  loading = false,
  at = "/",
} = {}) => {
  pathname = at;
  return render(
    <Provider
      store={configureStore({
        reducer: {
          auth: () => ({ user }),
          profileList: () => ({ list, loaded, loading }),
        },
      })}
    >
      <MemoryRouter>
        <FirstRunGate />
      </MemoryRouter>
    </Provider>
  );
};

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  pathname = "/";
});

describe("FirstRunGate", () => {
  it("sends a logged-in user with no artists to the welcome flow", () => {
    // The redirect used to live only in the auth handlers, so a tab running
    // a pre-deploy bundle called navigate("/") and the flow never happened.
    renderGate({ list: [] });

    expect(navigateSpy).toHaveBeenCalledWith("/welcome", { replace: true });
  });

  it("leaves a user who already has artists alone", () => {
    renderGate({ list: [{ artist_id: 1 }] });

    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it("leaves logged-out visitors alone", () => {
    renderGate({ user: null, list: [] });

    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it("waits for the list before deciding", () => {
    // An empty list that hasn't loaded is "unknown", not "zero" — redirecting
    // on it would drag an established user through first-run onboarding.
    renderGate({ list: [], loaded: false });

    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it("fetches the list when nothing else has", async () => {
    renderGate({ list: [], loaded: false });

    await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
  });

  it("does not hijack a deep link", () => {
    // Someone opening a shared artist page stays on it.
    renderGate({ list: [], at: "/artist/130450" });

    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it("respects a deliberate skip", () => {
    // Without this the skip lands on "/" and the gate bounces them straight
    // back — an unescapable loop.
    localStorage.setItem(WELCOME_SKIPPED_KEY, "1");
    renderGate({ list: [] });

    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it("uses a different key from the nudge's dismissal", () => {
    // Skip is "not now" and must leave the navbar nudge alive; dismiss is
    // "stop asking". Sharing one key would make skipping silence the only
    // route back.
    expect(WELCOME_SKIPPED_KEY).not.toBe("stanbox_onboarding_dismissed");
  });
});
