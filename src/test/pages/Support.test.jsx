import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Support, { SUPPORT_EMAIL } from "../../pages/Support/Support";
import { ONBOARDING_TARGET } from "../../components/OnboardingChecklist/OnboardingChecklist";
import { CRATE_MIN, CRATE_MAX } from "../../components/CrateShare/CrateShare";
import { MAX_PICKS } from "../../components/QuarterlyPicks/QuarterlyPicks";

// /support is the App Store Connect Support URL. Apple rejects a support URL
// that doesn't lead to help and a way to make contact, and a guide that
// describes buttons the app doesn't have is worse than none. These pin both.

const renderSupport = () =>
  render(
    <MemoryRouter>
      <Support />
    </MemoryRouter>
  );

describe("Support", () => {
  it("gives a working way to contact us", () => {
    renderSupport();

    const link = screen.getByRole("link", { name: SUPPORT_EMAIL });
    expect(link).toHaveAttribute("href", `mailto:${SUPPORT_EMAIL}`);
    expect(SUPPORT_EMAIL).toBe("support@onstanbox.com");
  });

  it("links every contents entry to a section that exists", () => {
    const { container } = renderSupport();

    const nav = screen.getByRole("navigation", { name: "On this page" });
    const targets = [...nav.querySelectorAll("a")].map((a) => a.getAttribute("href").slice(1));

    expect(targets.length).toBeGreaterThan(5);
    for (const id of targets) {
      expect(container.querySelector(`section#${id}`)).not.toBeNull();
    }
  });

  it("states the limits the profile actually enforces", () => {
    const { container } = renderSupport();
    const text = container.textContent;

    expect(text).toContain(`Add ${ONBOARDING_TARGET} artists to your Top 20`);
    expect(text).toContain(`${CRATE_MIN} to ${CRATE_MAX} artists`);
    expect(text).toContain(`the ${MAX_PICKS} releases`);
    // GRACE_PERIOD_DAYS in the backend's src/utils/quarters.ts.
    expect(text).toContain("until 14 days after the quarter ends");
  });

  it("matches the sign-in limits in the backend", () => {
    const { container } = renderSupport();

    // CODE_TTL_SECONDS = 300, MAX_CODES_PER_WINDOW = 5 per 15-minute window
    // (src/services/loginCode.ts).
    expect(container.textContent).toMatch(/works for 5 minutes/);
    expect(container.textContent).toMatch(/up to 5 codes every 15 minutes/);
  });

  it("says report and block are iOS-only, with an email route on the web", () => {
    const { container } = renderSupport();
    const text = container.textContent;

    expect(text).toMatch(/In the iOS app, open the menu on any post or profile to report it or block/);
    expect(text).toMatch(/Reporting and blocking aren't on the web yet/);
  });

  it("shows web and iOS steps side by side where they differ", () => {
    renderSupport();

    expect(screen.getAllByText("On the web").length).toBeGreaterThanOrEqual(4);
    expect(screen.getAllByText("In the iOS app").length).toBe(screen.getAllByText("On the web").length);
  });
});
