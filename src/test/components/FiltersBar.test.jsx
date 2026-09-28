import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FiltersBar from "../../components/FiltersBar/FiltersBar";

const renderBar = (props = {}) =>
  render(
    <FiltersBar
      activeFilter={{ type: "all", value: "" }}
      onFilterChange={vi.fn()}
      isLoggedIn={false}
      hasListItems={false}
      {...props}
    />
  );

describe("FiltersBar genres", () => {
  it("offers Country", async () => {
    // 2,940 artists carry a country genre and had no way to be browsed to.
    renderBar();
    expect(screen.getByRole("button", { name: "Country" })).toBeInTheDocument();
  });

  it("offers Dancehall after Reggae", async () => {
    // Adjacent genres, and Reggae is the broader term — 44 of the 155
    // dancehall artists already match it, so this surfaces the other 111.
    renderBar();
    const labels = screen.getAllByRole("button").map((b) => b.textContent.trim());
    expect(labels).toContain("Dancehall");
    expect(labels.indexOf("Reggae")).toBeLessThan(labels.indexOf("Dancehall"));
  });

  it("sends the pill's label as the genre filter", async () => {
    // The server matches with ILIKE '%value%', so the label is the query —
    // renaming a pill silently changes what it filters.
    const onFilterChange = vi.fn();
    const user = userEvent.setup({ delay: null });
    renderBar({ onFilterChange });

    await user.click(screen.getByRole("button", { name: "Country" }));

    expect(onFilterChange).toHaveBeenCalledWith({ type: "genre", value: "Country" });
  });

  it("leads with Hip Hop rather than the largest genre", async () => {
    // Order is platform identity, not volume: Rock has ~30x the artists of
    // Hip Hop. If this ever sorts by count, that's a decision, not a tidy-up.
    renderBar();
    const genreButtons = screen
      .getAllByRole("button")
      .map((b) => b.textContent.trim());
    expect(genreButtons.indexOf("Hip Hop")).toBeLessThan(genreButtons.indexOf("Rock"));
    expect(genreButtons.indexOf("Rock")).toBeLessThan(genreButtons.indexOf("Country"));
  });
});

describe("FiltersBar regions", () => {
  // Every region pill has to match a value the API can actually return.
  // The filter matches `region OR state` EXACTLY, with no wildcards —
  // deliberately, so "%South%" cannot also catch "South Carolina". That makes
  // a typo or a hopeful guess indistinguishable from a working pill until
  // someone taps it.

  const labels = () => {
    renderBar();
    return screen.getAllByRole("button").map((b) => b.textContent.trim());
  };

  it("does not offer cities, which have no column to match", async () => {
    // Chicago, Houston and Detroit shipped for months and returned an empty
    // list every time. One artist in 112k has "Chicago" anywhere, and only as
    // a substring. Meaningful places in music, but not data we hold.
    const shown = labels();
    for (const city of ["Chicago", "Houston", "Detroit"]) {
      expect(shown).not.toContain(city);
    }
  });

  it("uses the stored region value, not an abbreviation of it", async () => {
    // "East" matched nothing because the column holds "East Coast" and the
    // comparison is exact.
    const shown = labels();
    expect(shown).not.toContain("East");
    expect(shown).toContain("East Coast");
  });

  it("offers the four US regions the catalogue actually uses", async () => {
    // Counted 2026-09-28: East Coast 1783, South 553, West Coast 543,
    // Midwest 459. Midwest and West Coast were missing entirely, so ~1,000
    // artists had no region pill that reached them.
    const shown = labels();
    for (const region of ["East Coast", "West Coast", "South", "Midwest"]) {
      expect(shown).toContain(region);
    }
  });

  it("keeps the state-level pills that work", async () => {
    // NY 1231, Georgia 115, LA 12 — these match on `state` rather than
    // `region`, which is why they survived a list that was otherwise wrong.
    const shown = labels();
    for (const s of ["NY", "Georgia", "LA", "UK"]) {
      expect(shown).toContain(s);
    }
  });
});
