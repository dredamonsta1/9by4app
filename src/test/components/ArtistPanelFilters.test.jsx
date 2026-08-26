import { describe, it, expect } from "vitest";
import { filterParams } from "../../components/ArtistPanel/ArtistPanel";

// filterParams is the single translation from a pill to query params. It's
// exported and tested on its own because the failure mode when the initial
// fetch and the load-more disagree is silent: page two comes back as a
// different set and gets appended to the list already on screen.
describe("filterParams", () => {
  it("maps a genre pill to a genre param", () => {
    expect(filterParams({ type: "genre", value: "Hip Hop" })).toEqual({
      genre: "Hip Hop",
    });
  });

  it("maps a region pill to a region param", () => {
    // The route matches this against region OR state — most artists carry
    // one or the other.
    expect(filterParams({ type: "region", value: "South" })).toEqual({
      region: "South",
    });
  });

  it("sends nothing for 'all'", () => {
    expect(filterParams({ type: "all", value: "" })).toEqual({});
  });

  it("sends nothing for 'my list', which restores the unfiltered set", () => {
    // My list is applied client-side, but the fetch still has to be
    // unfiltered — otherwise picking a genre and then "my list" would show
    // only the artists in your list who also matched that genre.
    expect(filterParams({ type: "mylist", value: "" })).toEqual({});
  });

  it("is safe against a missing or malformed filter", () => {
    expect(filterParams(undefined)).toEqual({});
    expect(filterParams(null)).toEqual({});
    expect(filterParams({})).toEqual({});
  });
});
