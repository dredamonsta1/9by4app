import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TermsOfUse from "../../pages/TermsOfUse/TermsOfUse";

// The Terms drifted out of sync with the product once already: §9 described
// a Creator subscription with recurring charges for months after that model
// was retired, sitting directly above a section about one-time purchases.
// These tests pin the parts that would go stale the same way.
describe("TermsOfUse", () => {
  it("numbers its sections contiguously from 1", () => {
    render(<TermsOfUse />);

    const numbers = screen
      .getAllByRole("heading", { level: 2 })
      .map((h) => parseInt(h.textContent, 10));

    expect(numbers).toEqual(numbers.map((_, i) => i + 1));
  });

  it("denies rather than describes recurring billing", () => {
    const { container } = render(<TermsOfUse />);
    const text = container.textContent;

    // stanbox bills one-time purchases only; revenue is the 10% cut on
    // sales, not artist-account fees. Saying so is fine — the hazard is
    // language that implies a subscription actually exists.
    expect(text).toMatch(/does not sell subscriptions/i);
    expect(text).not.toMatch(/paid Creator subscription/i);
    expect(text).not.toMatch(/recurring charge/i);
    expect(text).not.toMatch(/until you cancel/i);
  });

  it("states the platform fee that the checkout actually applies", () => {
    const { container } = render(<TermsOfUse />);
    const text = container.textContent;

    // The default rate is app_settings.platform_fee_bps = 1000. Since Story 36
    // an artist can have a deal rate, so the Terms must not promise a flat
    // 10%/90% to every artist.
    expect(text).toMatch(/10% unless we have agreed a different rate with that artist/i);
    expect(text).not.toMatch(/remaining 90% goes to the artist/i);
  });

  it("doesn't put sales tax on artists, since buyers pay stanbox", () => {
    // Stripe's Connect setup is "buyers purchase from you" (destination
    // charges), so stanbox is the seller. Artists owe income tax on payouts,
    // not the sales tax on the sale.
    const { container } = render(<TermsOfUse />);
    const text = container.textContent;

    expect(text).toMatch(/you pay stanbox, and stanbox pays the artist/i);
    expect(text).toMatch(/shown at checkout before you pay/i);
    expect(text).toMatch(/income taxes on the payouts they receive/i);
    expect(text).not.toMatch(/responsible for any taxes arising from their sales/i);
  });

  it("tells buyers their email goes to the artist", () => {
    const { container } = render(<TermsOfUse />);
    const text = container.textContent;

    expect(text).toMatch(/email address/i);
    expect(text).toMatch(/artist who sold it/i);
  });

  it("refers to the platform by its current name only", () => {
    const { container } = render(<TermsOfUse />);

    expect(container.textContent).not.toMatch(/crates\.fyi/i);
  });
});
