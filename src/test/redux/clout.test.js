import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildMockStore } from "../utils";
import {
  addArtistToProfileList,
  removeArtistFromProfileList,
} from "../../redux/actions/profileListActions";
import axiosInstance from "../../utils/axiosInstance";

// Clout is counted by the server from Top 20 entries. The app used to make a
// second call, PUT /artists/:id/clout, which let any signed-in user change any
// artist's clout. Adding and removing must now call only the Top 20 routes,
// and show the count the server returns.

vi.mock("../../utils/axiosInstance", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const mj = { artist_id: 85, artist_name: "Michael Jackson", count: 4 };

const storeWith = (list = []) =>
  buildMockStore({
    auth: { user: { id: 1, user_id: 1 }, token: "t" },
    artists: { artists: [mj], searchResults: [mj] },
    profileList: { list },
  });

beforeEach(() => vi.clearAllMocks());

describe("clout on Top 20 add and remove", () => {
  it("adds through the Top 20 route only, and shows the server's count", async () => {
    axiosInstance.post.mockResolvedValue({ data: { position: 1, clout: 5 } });
    const store = storeWith();

    await store.dispatch(addArtistToProfileList(mj));

    expect(axiosInstance.post).toHaveBeenCalledTimes(1);
    expect(axiosInstance.post).toHaveBeenCalledWith("/profile/list/85");
    expect(axiosInstance.put).not.toHaveBeenCalled();
    expect(store.getState().profileList.list[0].count).toBe(5);
    expect(store.getState().artists.artists[0].count).toBe(5);
  });

  it("removes through the Top 20 route only, and shows the server's count", async () => {
    axiosInstance.delete.mockResolvedValue({ data: { clout: 3 } });
    const store = storeWith([{ ...mj }]);

    await store.dispatch(removeArtistFromProfileList(85));

    expect(axiosInstance.delete).toHaveBeenCalledWith("/profile/list/85");
    expect(axiosInstance.put).not.toHaveBeenCalled();
    expect(store.getState().profileList.list).toHaveLength(0);
    expect(store.getState().artists.artists[0].count).toBe(3);
  });

  it("still updates sensibly against a server that doesn't return clout yet", async () => {
    // During a deploy the frontend can be ahead of the backend.
    axiosInstance.post.mockResolvedValue({ data: { position: 1 } });
    const store = storeWith();

    await store.dispatch(addArtistToProfileList(mj));

    expect(store.getState().profileList.list[0].count).toBe(5);
    expect(axiosInstance.put).not.toHaveBeenCalled();
  });
});
