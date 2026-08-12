import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  setPendingStan,
  takePendingStan,
  PENDING_STAN_KEY,
  PENDING_STAN_TTL_MS,
} from "../../utils/pendingStan";

const artist = {
  artist_id: 130427,
  artist_name: "Ballad",
  image_url: "/uploads/ballad.jpg",
};

describe("pendingStan", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("round-trips the artist a guest was reaching for", () => {
    setPendingStan(artist);

    expect(takePendingStan()).toMatchObject({
      artist_id: 130427,
      artist_name: "Ballad",
      image_url: "/uploads/ballad.jpg",
    });
  });

  it("clears the value on read, so it can only be spent once", () => {
    setPendingStan(artist);

    expect(takePendingStan()).not.toBeNull();
    expect(takePendingStan()).toBeNull();
    expect(localStorage.getItem(PENDING_STAN_KEY)).toBeNull();
  });

  it("returns null when nothing is pending", () => {
    expect(takePendingStan()).toBeNull();
  });

  it("ignores an artist with no id", () => {
    setPendingStan({ artist_name: "Nameless" });

    expect(localStorage.getItem(PENDING_STAN_KEY)).toBeNull();
    expect(takePendingStan()).toBeNull();
  });

  it("accepts the alternate `name` field some artist shapes use", () => {
    setPendingStan({ artist_id: 5, name: "Legacy Shape" });

    expect(takePendingStan().artist_name).toBe("Legacy Shape");
  });

  it("expires stale intent rather than adding it to a later session", () => {
    setPendingStan(artist);

    // A guest who never finished signing up shouldn't have an artist appear
    // in their Top 20 when they eventually log in weeks later.
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + PENDING_STAN_TTL_MS + 1000);

    expect(takePendingStan()).toBeNull();
  });

  it("still honours intent inside the window", () => {
    setPendingStan(artist);

    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + PENDING_STAN_TTL_MS - 1000);

    expect(takePendingStan()).not.toBeNull();
  });

  it("discards a corrupt value, and clears it", () => {
    localStorage.setItem(PENDING_STAN_KEY, "not json");

    expect(takePendingStan()).toBeNull();
    expect(localStorage.getItem(PENDING_STAN_KEY)).toBeNull();
  });

  it("discards a value written before the TTL field existed", () => {
    localStorage.setItem(
      PENDING_STAN_KEY,
      JSON.stringify({ artist_id: 1, artist_name: "Old" })
    );

    expect(takePendingStan()).toBeNull();
  });
});
