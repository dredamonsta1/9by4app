import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../utils";
import { FeedPost } from "../../components/ArtistPanel/ArtistPanel";
import axiosInstance from "../../utils/axiosInstance";

// The feed shows the author's follower count, but only from 100 (the same
// public threshold as fans, clout and ballots; utils/publicCounts).

vi.mock("../../utils/axiosInstance", () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

const post = (extra = {}) => ({
  id: 9,
  post_type: "text",
  content: "new album is crazy",
  user_id: 12,
  username: "paperhand",
  created_at: new Date().toISOString(),
  ...extra,
});

const renderPost = (p) =>
  renderWithProviders(<FeedPost post={p} currentUserId={1} onPlayMusic={() => {}} />);

beforeEach(() => {
  vi.clearAllMocks();
  axiosInstance.get.mockResolvedValue({ data: [] });
});

describe("FeedPost follower count", () => {
  it("shows the count once the author has 100 or more followers", () => {
    renderPost(post({ follower_count: 1250 }));
    expect(screen.getByText("1,250 followers")).toBeInTheDocument();
  });

  it("hides it below 100", () => {
    renderPost(post({ follower_count: 99 }));
    expect(screen.queryByText(/followers/)).not.toBeInTheDocument();
  });

  it("hides it when the server sends no count", () => {
    renderPost(post());
    expect(screen.queryByText(/followers/)).not.toBeInTheDocument();
  });

  it("never shows a count on agent posts", () => {
    renderPost(post({ is_agent_post: true, category: "news", follower_count: 500, user_id: null }));
    expect(screen.queryByText(/followers/)).not.toBeInTheDocument();
  });
});
