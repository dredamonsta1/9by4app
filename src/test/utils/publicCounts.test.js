import { describe, it, expect } from "vitest";
import { PUBLIC_COUNT_THRESHOLD, showPublicCount } from "../../utils/publicCounts";

describe("showPublicCount", () => {
  it("hides counts below 100 and shows them from 100", () => {
    expect(PUBLIC_COUNT_THRESHOLD).toBe(100);
    expect(showPublicCount(0)).toBe(false);
    expect(showPublicCount(14)).toBe(false);
    expect(showPublicCount(99)).toBe(false);
    expect(showPublicCount(100)).toBe(true);
    expect(showPublicCount(112583)).toBe(true);
  });

  it("treats missing counts as small", () => {
    expect(showPublicCount(undefined)).toBe(false);
    expect(showPublicCount(null)).toBe(false);
  });
});
