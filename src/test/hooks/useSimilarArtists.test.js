import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import axiosInstance from "../../utils/axiosInstance";
import {
  useSimilarArtists,
  tagLabel,
  similarReason,
  FANS_ENOUGH,
} from "../../hooks/useSimilarArtists";

vi.mock("../../utils/axiosInstance", () => ({
  default: { get: vi.fn() },
}));

const fan = (id) => ({ artist_id: id, artist_name: `Fan pick ${id}`, genre: "hip-hop", overlap_count: 1 });
const sound = (id, tags = ["dream-pop", "indie-pop", "pop"]) => ({
  artist_id: id,
  artist_name: `Sound pick ${id}`,
  genre: "dream pop",
  score: 7.5,
  reasons: { shared_tags: tags, co_list: 0 },
});

// Route by endpoint so each test reads as "what each one returns".
const mockApi = ({ related = [], similar = [], relatedFails = false } = {}) =>
  axiosInstance.get.mockImplementation((url) => {
    if (url.includes("/related")) return relatedFails ? Promise.reject(new Error("500")) : Promise.resolve({ data: related });
    if (url.includes("/similar")) return Promise.resolve({ data: similar });
    return Promise.resolve({ data: [] });
  });

const calledSimilar = () => axiosInstance.get.mock.calls.some(([url]) => url.includes("/similar"));

describe("useSimilarArtists", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it(`keeps "Fans Also Love" and skips /similar when co-listing has ${FANS_ENOUGH}+ artists`, async () => {
    mockApi({ related: [fan(1), fan(2), fan(3), fan(4)] });

    const { result } = renderHook(() => useSimilarArtists(10));

    await waitFor(() => expect(result.current.artists).toHaveLength(4));
    expect(result.current.title).toBe("Fans Also Love");
    expect(result.current.artists.every((a) => a.reason === null)).toBe(true);
    expect(calledSimilar()).toBe(false);
  });

  it('tops up sparse co-listing with similar-sound artists, fan picks first, as "Similar Artists"', async () => {
    mockApi({ related: [fan(1)], similar: [sound(1), sound(2), sound(3)] });

    const { result } = renderHook(() => useSimilarArtists(10));

    await waitFor(() => expect(result.current.artists).toHaveLength(3));
    expect(result.current.title).toBe("Similar Artists");
    expect(result.current.artists.map((a) => a.artist_id)).toEqual([1, 2, 3]); // 1 not repeated
    expect(result.current.artists[0].reason).toBeNull();
    expect(result.current.artists[1].reason).toBe("dream pop · indie pop");
  });

  it("works for an artist no one has stanned — the reason this exists", async () => {
    mockApi({ related: [], similar: [sound(5, ["hip-hop"])] });

    const { result } = renderHook(() => useSimilarArtists(130458));

    await waitFor(() => expect(result.current.artists).toHaveLength(1));
    expect(result.current.title).toBe("Similar Artists");
    expect(result.current.artists[0].reason).toBe("hip-hop");
  });

  it("caps the box at 8", async () => {
    mockApi({ related: [], similar: Array.from({ length: 20 }, (_, i) => sound(100 + i)) });

    const { result } = renderHook(() => useSimilarArtists(10));

    await waitFor(() => expect(result.current.artists).toHaveLength(8));
  });

  it("falls back to /similar when /related fails", async () => {
    mockApi({ relatedFails: true, similar: [sound(7)] });

    const { result } = renderHook(() => useSimilarArtists(10));

    await waitFor(() => expect(result.current.artists).toHaveLength(1));
  });

  it("stays empty (and the box hidden) when neither has anything", async () => {
    mockApi();

    const { result } = renderHook(() => useSimilarArtists(10));

    await waitFor(() => expect(calledSimilar()).toBe(true));
    expect(result.current).toEqual({ artists: [], title: "Fans Also Love" });
  });

  it("does nothing without an artist id", () => {
    mockApi();
    renderHook(() => useSimilarArtists(undefined));
    expect(axiosInstance.get).not.toHaveBeenCalled();
  });

  it("ignores a late response for an artist the user already left", async () => {
    let resolveFirst;
    axiosInstance.get.mockImplementation((url) => {
      if (url === "/artists/1/related?limit=8") return new Promise((r) => { resolveFirst = r; });
      if (url.includes("/artists/2/related")) return Promise.resolve({ data: [fan(21), fan(22), fan(23), fan(24)] });
      return Promise.resolve({ data: [] });
    });

    const { result, rerender } = renderHook(({ id }) => useSimilarArtists(id), { initialProps: { id: 1 } });
    rerender({ id: 2 });
    await waitFor(() => expect(result.current.artists.map((a) => a.artist_id)).toEqual([21, 22, 23, 24]));

    resolveFirst({ data: [fan(11), fan(12), fan(13), fan(14)] });
    await new Promise((r) => setTimeout(r, 0));
    expect(result.current.artists.map((a) => a.artist_id)).toEqual([21, 22, 23, 24]);
  });
});

describe("tagLabel", () => {
  it.each([
    ["dream-pop", "dream pop"],
    ["r-and-b", "R&B"],
    ["hip-hop", "hip-hop"],
    ["southern-hip-hop", "southern hip-hop"],
    ["uk-hip-hop", "UK hip-hop"],
    ["edm", "EDM"],
    ["mpb", "MPB"],
  ])("%s → %s", (slug, label) => {
    expect(tagLabel(slug)).toBe(label);
  });
});

describe("similarReason", () => {
  it("uses the first two shared tags", () => {
    expect(similarReason({ shared_tags: ["dream-pop", "indie-pop", "pop"] })).toBe("dream pop · indie pop");
  });

  it("is empty when there are no shared tags (a co-list-only match)", () => {
    expect(similarReason({ shared_tags: [], co_list: 2 })).toBe("");
    expect(similarReason(undefined)).toBe("");
  });
});
