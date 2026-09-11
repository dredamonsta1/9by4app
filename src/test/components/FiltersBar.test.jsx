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
