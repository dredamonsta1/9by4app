import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../utils";
import ArtistPanel, { FeedPost } from "../../components/ArtistPanel/ArtistPanel";
import axiosInstance from "../../utils/axiosInstance";

// Signed-out visitors see the bot accounts' public feed instead of an empty
// "Log in to see the feed" box. Fans' posts stay behind sign-in.

vi.mock("../../utils/axiosInstance", () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

const botPost = {
  id: 19038,
  user_id: 973,
  username: "9by4Sports",
  is_agent_post: true,
  category: "sports",
  post_type: "text",
  content: "Stroud, defense star as Texans beat Colts",
  created_at: new Date().toISOString(),
};

const feedCalls = () =>
  axiosInstance.get.mock.calls.map(([url]) => url).filter((u) => /^\/feed(\/public)?$/.test(u));

// The landing page draws nothing until it has an artist to feature.
const mj = { artist_id: 85, artist_name: "Michael Jackson", genre: "Pop", count: 6 };
const respond = (publicFeed) => (url) => {
  if (url === "/feed/public") return Promise.resolve({ data: publicFeed });
  if (url === "/artists/85") return Promise.resolve({ data: { artist: mj } });
  if (url.startsWith("/artists?") || url === "/artists") {
    return Promise.resolve({ data: { artists: [mj], hasMore: false } });
  }
  return Promise.resolve({ data: [] });
};
const withArtist = { artists: { artists: [mj] } };

beforeEach(() => {
  vi.clearAllMocks();
  axiosInstance.get.mockImplementation(respond([botPost]));
});

describe("the landing feed for guests", () => {
  it("loads the public bot feed and shows it with a sign-up note", async () => {
    renderWithProviders(<ArtistPanel />, { preloadedState: withArtist });

    expect(await screen.findByText(/Texans beat Colts/)).toBeInTheDocument();
    expect(feedCalls()).toEqual(["/feed/public"]);
    expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute("href", "/signup");
    expect(screen.queryByText("Log in to see the feed.")).not.toBeInTheDocument();
  });

  it("asks guests to log in when even the public feed is empty", async () => {
    axiosInstance.get.mockImplementation(respond([]));
    renderWithProviders(<ArtistPanel />, { preloadedState: withArtist });

    expect(await screen.findByText("Log in to see the feed.")).toBeInTheDocument();
  });

  it("uses the signed-in feed once you're logged in", async () => {
    renderWithProviders(<ArtistPanel />, {
      preloadedState: { ...withArtist, auth: { isLoggedIn: true, user: { id: 1, username: "andrew3" } } },
    });

    await waitFor(() => expect(feedCalls()).toContain("/feed"));
    expect(feedCalls()).not.toContain("/feed/public");
  });
});

describe("FeedPost for a guest", () => {
  it("has no comment button, since comments need an account", () => {
    renderWithProviders(<FeedPost post={botPost} currentUserId={undefined} onPlayMusic={() => {}} />);
    expect(screen.queryByRole("button", { name: /comment/i })).not.toBeInTheDocument();
  });

  it("keeps the comment button for signed-in fans", () => {
    renderWithProviders(<FeedPost post={botPost} currentUserId={1} onPlayMusic={() => {}} />);
    expect(screen.getByRole("button", { name: /comment/i })).toBeInTheDocument();
  });
});
