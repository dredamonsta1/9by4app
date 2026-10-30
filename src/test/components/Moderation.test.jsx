import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../utils";
import ModerationMenu from "../../components/Moderation/ModerationMenu";
import BlockedAccounts from "../../components/Moderation/BlockedAccounts";
import { FeedPost } from "../../components/ArtistPanel/ArtistPanel";
import { orderReasons, postTargetType, reasonLabel } from "../../components/Moderation/reportReasons";
import axiosInstance from "../../utils/axiosInstance";

// Story 33: report and block on the web, matching the iOS app. These tests
// check what is actually sent to /api/moderation, not just what renders.

vi.mock("../../utils/axiosInstance", () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

const SERVER_REASONS = ["spam", "harassment", "hate_speech", "other"];

const mockReasons = (reasons = SERVER_REASONS) =>
  axiosInstance.get.mockImplementation((url) =>
    url === "/moderation/report/reasons"
      ? Promise.resolve({ data: { reasons } })
      : Promise.resolve({ data: [] })
  );

const renderMenu = (props = {}) =>
  renderWithProviders(
    <ModerationMenu
      reportLabel="Report post"
      reportTarget={{ type: "image_post", id: 42, preview: "look at this" }}
      userId={7}
      username="troll"
      {...props}
    />
  );

const openMenu = () => fireEvent.click(screen.getByRole("button", { name: /more options for @troll/i }));

beforeEach(() => {
  vi.clearAllMocks();
  axiosInstance.post.mockResolvedValue({ data: {} });
  axiosInstance.delete.mockResolvedValue({ data: {} });
  mockReasons();
});

describe("reportReasons", () => {
  it("maps feed post types to report target types", () => {
    expect(postTargetType("text")).toBe("post");
    expect(postTargetType(undefined)).toBe("post");
    expect(postTargetType("image")).toBe("image_post");
    expect(postTargetType("music")).toBe("music_post");
    expect(postTargetType("video")).toBe("video_post");
  });

  it("orders server reasons like iOS, keeping unknown ones and 'other' last", () => {
    expect(orderReasons(["other", "spam", "doxxing", "harassment"])).toEqual([
      "harassment",
      "spam",
      "doxxing",
      "other",
    ]);
    expect(reasonLabel("doxxing")).toBe("Doxxing");
    expect(reasonLabel("hate_speech")).toBe("Hate speech");
  });
});

describe("ModerationMenu — report", () => {
  it("sends the reason, the target and the person, then thanks them", async () => {
    renderMenu();
    openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "Report post" }));

    expect(screen.getByText("look at this")).toBeInTheDocument();
    const submit = screen.getByRole("button", { name: /submit report/i });
    expect(submit).toBeDisabled();

    fireEvent.click(await screen.findByLabelText("Harassment or bullying"));
    fireEvent.change(screen.getByLabelText(/anything else/i), { target: { value: "  keeps replying  " } });
    fireEvent.click(submit);

    await waitFor(() =>
      expect(axiosInstance.post).toHaveBeenCalledWith("/moderation/report", {
        target_type: "image_post",
        target_id: 42,
        reason: "harassment",
        detail: "keeps replying",
        reported_user_id: 7,
      })
    );
    expect(await screen.findByText(/thanks, we'll take a look/i)).toBeInTheDocument();
  });

  it("sends no detail when the box is left blank", async () => {
    renderMenu();
    openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "Report post" }));
    fireEvent.click(await screen.findByLabelText("Spam"));
    fireEvent.click(screen.getByRole("button", { name: /submit report/i }));

    await waitFor(() => expect(axiosInstance.post).toHaveBeenCalled());
    expect(axiosInstance.post.mock.calls[0][1].detail).toBeNull();
  });

  it("only offers the reasons the server accepts", async () => {
    renderMenu();
    openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "Report post" }));

    await screen.findByLabelText("Spam");
    expect(screen.getAllByRole("radio")).toHaveLength(SERVER_REASONS.length);
    expect(screen.queryByLabelText("Copyright infringement")).not.toBeInTheDocument();
  });

  it("falls back to the built-in reasons if the list can't load", async () => {
    axiosInstance.get.mockRejectedValue(new Error("502"));
    renderMenu();
    openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "Report post" }));

    expect(await screen.findByLabelText("Copyright infringement")).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(10);
  });

  it("keeps the form open with an error if the report fails", async () => {
    axiosInstance.post.mockRejectedValueOnce(new Error("500"));
    renderMenu();
    openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "Report post" }));
    fireEvent.click(await screen.findByLabelText("Spam"));
    fireEvent.click(screen.getByRole("button", { name: /submit report/i }));

    expect(await screen.findByText("Couldn't send that report. Try again.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit report/i })).toBeInTheDocument();
  });
});

describe("ModerationMenu — block", () => {
  it("asks first, then blocks and tells the caller who", async () => {
    const onBlocked = vi.fn();
    renderMenu({ onBlocked });
    openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "Block @troll" }));

    expect(screen.getByText(/they aren't told/i)).toBeInTheDocument();
    expect(axiosInstance.post).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Block" }));

    await waitFor(() => expect(axiosInstance.post).toHaveBeenCalledWith("/moderation/block/7"));
    expect(onBlocked).toHaveBeenCalledWith(7);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("does nothing on cancel", () => {
    const onBlocked = vi.fn();
    renderMenu({ onBlocked });
    openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "Block @troll" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(axiosInstance.post).not.toHaveBeenCalled();
    expect(onBlocked).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("stays open with an error if the block fails", async () => {
    axiosInstance.post.mockRejectedValueOnce(new Error("500"));
    const onBlocked = vi.fn();
    renderMenu({ onBlocked });
    openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "Block @troll" }));
    fireEvent.click(screen.getByRole("button", { name: "Block" }));

    expect(await screen.findByText("Couldn't block this user. Try again.")).toBeInTheDocument();
    expect(onBlocked).not.toHaveBeenCalled();
  });
});

describe("FeedPost — report and block", () => {
  const post = {
    id: 42,
    post_type: "image",
    user_id: 7,
    username: "troll",
    caption: "look at this",
    image_url: "https://img/x.jpg",
    created_at: "2026-10-29T00:00:00Z",
  };

  const renderPost = (props = {}) =>
    renderWithProviders(
      <ul>
        <FeedPost post={post} currentUserId={1} onPlayMusic={() => {}} {...props} />
      </ul>
    );

  it("reports someone else's image post as an image_post", async () => {
    renderPost();
    openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "Report post" }));
    fireEvent.click(await screen.findByLabelText("Spam"));
    fireEvent.click(screen.getByRole("button", { name: /submit report/i }));

    await waitFor(() =>
      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/moderation/report",
        expect.objectContaining({ target_type: "image_post", target_id: 42, reported_user_id: 7 })
      )
    );
  });

  it("hands the blocked user's id to the feed so their posts can go", async () => {
    const onBlocked = vi.fn();
    renderPost({ onBlocked });
    openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "Block @troll" }));
    fireEvent.click(screen.getByRole("button", { name: "Block" }));

    await waitFor(() => expect(onBlocked).toHaveBeenCalledWith(7));
  });

  it("shows no menu on your own post, or when signed out", () => {
    const { unmount } = renderPost({ currentUserId: 7 });
    expect(screen.queryByRole("button", { name: /more options/i })).not.toBeInTheDocument();
    unmount();
    renderPost({ currentUserId: null });
    expect(screen.queryByRole("button", { name: /more options/i })).not.toBeInTheDocument();
  });
});

describe("BlockedAccounts", () => {
  const blocks = [
    { user_id: 7, username: "troll", profile_image: null, created_at: "2026-10-29" },
    { user_id: 8, username: "spammer", profile_image: null, created_at: "2026-10-28" },
  ];

  it("lists blocked accounts and unblocks one", async () => {
    axiosInstance.get.mockResolvedValue({ data: { blocks } });
    renderWithProviders(<BlockedAccounts />);

    fireEvent.click(await screen.findByRole("button", { name: "Unblock @troll" }));

    await waitFor(() => expect(axiosInstance.delete).toHaveBeenCalledWith("/moderation/block/7"));
    await waitFor(() => expect(screen.queryByText("@troll")).not.toBeInTheDocument());
    expect(screen.getByText("@spammer")).toBeInTheDocument();
  });

  it("keeps the row and says so if unblocking fails", async () => {
    axiosInstance.get.mockResolvedValue({ data: { blocks } });
    axiosInstance.delete.mockRejectedValueOnce(new Error("500"));
    renderWithProviders(<BlockedAccounts />);

    fireEvent.click(await screen.findByRole("button", { name: "Unblock @troll" }));

    expect(await screen.findByText("Couldn't unblock @troll. Try again.")).toBeInTheDocument();
    expect(screen.getByText("@troll")).toBeInTheDocument();
  });

  it("shows an empty state", async () => {
    axiosInstance.get.mockResolvedValue({ data: { blocks: [] } });
    renderWithProviders(<BlockedAccounts />);
    expect(await screen.findByText("You haven't blocked anyone.")).toBeInTheDocument();
  });

  it("shows an error with a retry", async () => {
    axiosInstance.get.mockRejectedValueOnce(new Error("502"));
    renderWithProviders(<BlockedAccounts />);
    expect(await screen.findByText(/couldn't load your blocked accounts/i)).toBeInTheDocument();

    axiosInstance.get.mockResolvedValue({ data: { blocks } });
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(await screen.findByText("@troll")).toBeInTheDocument();
  });
});
