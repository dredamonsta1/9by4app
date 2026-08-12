import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildMockStore } from "../utils";
import { redeemPendingStan } from "../../redux/actions/profileListActions";
import { setPendingStan, PENDING_STAN_KEY } from "../../utils/pendingStan";

vi.mock("../../utils/axiosInstance", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));

import axiosInstance from "../../utils/axiosInstance";

const artist = { artist_id: 130427, artist_name: "Ballad", image_url: null };

describe("redeemPendingStan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    axiosInstance.post.mockResolvedValue({ data: {} });
  });

  it("adds the parked artist to the new account's Top 20", async () => {
    setPendingStan(artist);
    const store = buildMockStore();

    await store.dispatch(redeemPendingStan());

    expect(axiosInstance.post).toHaveBeenCalledWith("/profile/list/130427");
    expect(store.getState().profileList.list).toHaveLength(1);
    expect(store.getState().profileList.list[0].artist_id).toBe(130427);
  });

  it("does nothing when there was no pending artist", async () => {
    const store = buildMockStore();

    const result = await store.dispatch(redeemPendingStan());

    expect(result).toBeNull();
    expect(axiosInstance.post).not.toHaveBeenCalled();
  });

  it("spends the intent, so a later login doesn't re-add", async () => {
    setPendingStan(artist);
    const store = buildMockStore();

    await store.dispatch(redeemPendingStan());
    expect(localStorage.getItem(PENDING_STAN_KEY)).toBeNull();

    axiosInstance.post.mockClear();
    await store.dispatch(redeemPendingStan());
    expect(axiosInstance.post).not.toHaveBeenCalled();
  });

  it("clears the intent even when the add fails", async () => {
    setPendingStan(artist);
    axiosInstance.post.mockRejectedValue(new Error("network down"));
    const store = buildMockStore();

    await store.dispatch(redeemPendingStan());

    // Otherwise a failed credit would silently re-fire on some unrelated
    // future login, long after the user stopped caring.
    expect(localStorage.getItem(PENDING_STAN_KEY)).toBeNull();
  });

  it("never rejects — a bonus must not surface as a login error", async () => {
    setPendingStan(artist);
    axiosInstance.post.mockRejectedValue(new Error("network down"));
    const store = buildMockStore();

    await expect(store.dispatch(redeemPendingStan())).resolves.not.toThrow();
  });

  it("skips an artist the user already has", async () => {
    setPendingStan(artist);
    const store = buildMockStore({ profileList: { list: [artist] } });

    await store.dispatch(redeemPendingStan());

    expect(axiosInstance.post).not.toHaveBeenCalled();
    expect(store.getState().profileList.list).toHaveLength(1);
  });

  it("respects a full Top 20", async () => {
    setPendingStan(artist);
    const full = Array.from({ length: 20 }, (_, i) => ({
      artist_id: i + 1,
      artist_name: `Artist ${i + 1}`,
    }));
    const store = buildMockStore({ profileList: { list: full } });

    await store.dispatch(redeemPendingStan());

    expect(axiosInstance.post).not.toHaveBeenCalled();
    expect(store.getState().profileList.list).toHaveLength(20);
  });
});
