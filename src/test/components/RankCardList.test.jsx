import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RankCardList from "../../components/landing/RankCardList";

const artist = (id, over = {}) => ({
  artist_id: id,
  artist_name: `Artist ${id}`,
  image_url: null,
  count: id * 100,
  genre: "Hip Hop",
  ...over,
});

const roster = (n) => Array.from({ length: n }, (_, i) => artist(i + 1));

describe("RankCardList", () => {
  it("ranks by list order", () => {
    render(<RankCardList artists={roster(3)} />);

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  describe("paging", () => {
    it("shows five at a time so the section keeps a fixed height", () => {
      render(<RankCardList artists={roster(25)} />);

      expect(screen.getAllByRole("listitem")).toHaveLength(5);
      expect(screen.getByText("1\u20135 of 25")).toBeInTheDocument();
    });

    it("keeps ranks true to position on later pages", async () => {
      render(<RankCardList artists={roster(25)} />);

      await userEvent.click(screen.getByRole("button", { name: /next ranks/i }));

      // Page two is 6-10, not 1-5 again.
      expect(screen.getByText("6")).toBeInTheDocument();
      expect(screen.getByText("Artist 10")).toBeInTheDocument();
      expect(screen.queryByText("Artist 1")).not.toBeInTheDocument();
      expect(screen.getByText("6\u201310 of 25")).toBeInTheDocument();
    });

    it("stops at both ends", async () => {
      render(<RankCardList artists={roster(7)} />);

      expect(screen.getByRole("button", { name: /previous ranks/i })).toBeDisabled();

      await userEvent.click(screen.getByRole("button", { name: /next ranks/i }));

      expect(screen.getByRole("button", { name: /next ranks/i })).toBeDisabled();
      expect(screen.getByText("6\u20137 of 7")).toBeInTheDocument();
    });

    it("offers no pager when everything fits", () => {
      render(<RankCardList artists={roster(4)} />);

      expect(screen.queryByRole("button", { name: /next ranks/i })).not.toBeInTheDocument();
    });

    it("snaps back to page one when the filter changes", async () => {
      // The whole reason rankings sits up top is the filter feedback loop —
      // clicking a pill has to visibly change what's on screen, which it
      // wouldn't if you were left stranded on page four.
      const { rerender } = render(
        <RankCardList artists={roster(25)} resetKey="all" />
      );
      await userEvent.click(screen.getByRole("button", { name: /next ranks/i }));
      expect(screen.getByText("6\u201310 of 25")).toBeInTheDocument();

      rerender(<RankCardList artists={roster(25)} resetKey="hip-hop" />);

      expect(screen.getByText("1\u20135 of 25")).toBeInTheDocument();
    });
  });

  it("shows fans and genre per row", () => {
    render(<RankCardList artists={[artist(2)]} />);

    expect(screen.getByText(/200 fans · Hip Hop/)).toBeInTheDocument();
  });

  it("copes with an artist that has no genre", () => {
    render(<RankCardList artists={[artist(2, { genre: null })]} />);

    expect(screen.getByText("200 fans")).toBeInTheDocument();
  });

  it("selects on a click anywhere in the row", async () => {
    // Auth-wall rule: browsing is free and the whole row is the target,
    // so only the add button commits.
    const onSelect = vi.fn();
    render(<RankCardList artists={roster(3)} onSelect={onSelect} />);

    await userEvent.click(screen.getByText("Artist 2"));

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ artist_id: 2 }));
  });

  it("selects by keyboard", async () => {
    const onSelect = vi.fn();
    render(<RankCardList artists={roster(2)} onSelect={onSelect} />);

    // The row's accessible name comes from its contents, so target it via
    // the artist name rather than an empty-name role query.
    const row = screen.getByText("Artist 1").closest('[role="button"]');
    row.focus();
    await userEvent.keyboard("{Enter}");

    expect(onSelect).toHaveBeenCalled();
  });

  it("adds without also selecting the row", async () => {
    const onAdd = vi.fn();
    const onSelect = vi.fn();
    render(
      <RankCardList artists={roster(2)} onAdd={onAdd} onSelect={onSelect} />
    );

    await userEvent.click(screen.getByRole("button", { name: /add artist 1/i }));

    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({ artist_id: 1 }));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("marks an artist already in the list and blocks re-adding", async () => {
    const onAdd = vi.fn();
    render(
      <RankCardList artists={roster(2)} onAdd={onAdd} inList={new Set([1])} />
    );

    const added = screen.getByRole("button", { name: /already in your top 20/i });
    expect(added).toBeDisabled();

    await userEvent.click(added);
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("renders nothing for an empty list", () => {
    render(<RankCardList artists={[]} />);

    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });
});

describe("RankCardList — loading more", () => {
  const many = (n) =>
    Array.from({ length: n }, (_, i) => ({
      artist_id: i + 1,
      artist_name: `Artist ${i + 1}`,
      image_url: null,
      count: 0,
    }));

  it("asks for more before reaching the last page", async () => {
    // Fetching only at the final row makes every boundary a visible wait.
    const onNeedMore = vi.fn();
    render(
      <RankCardList artists={many(25)} hasMore onNeedMore={onNeedMore} />
    );

    // 25 artists = 5 pages. Prefetch window is 2, so page 3 (index 2) trips it.
    const next = screen.getByRole("button", { name: /next ranks/i });
    await userEvent.click(next);
    expect(onNeedMore).not.toHaveBeenCalled();

    await userEvent.click(next);
    expect(onNeedMore).toHaveBeenCalled();
  });

  it("does not ask when there is nothing more to load", async () => {
    const onNeedMore = vi.fn();
    render(
      <RankCardList artists={many(25)} hasMore={false} onNeedMore={onNeedMore} />
    );

    const next = screen.getByRole("button", { name: /next ranks/i });
    await userEvent.click(next);
    await userEvent.click(next);
    await userEvent.click(next);
    expect(onNeedMore).not.toHaveBeenCalled();
  });

  it("does not stack requests while one is in flight", async () => {
    const onNeedMore = vi.fn();
    render(
      <RankCardList artists={many(25)} hasMore loadingMore onNeedMore={onNeedMore} />
    );

    const next = screen.getByRole("button", { name: /next ranks/i });
    await userEvent.click(next);
    await userEvent.click(next);
    expect(onNeedMore).not.toHaveBeenCalled();
  });

  it("offers paging even when one fetch fits on a single page", () => {
    // Otherwise a 5-artist first page hides the only way to reach the rest.
    render(<RankCardList artists={many(5)} hasMore onNeedMore={vi.fn()} />);

    expect(screen.getByRole("button", { name: /next ranks/i })).toBeEnabled();
  });

  it("hides paging entirely at the true end of a short catalogue", () => {
    render(<RankCardList artists={many(5)} hasMore={false} />);

    expect(screen.queryByRole("button", { name: /next ranks/i })).not.toBeInTheDocument();
  });

  it("disables next on the final page once everything is loaded", async () => {
    render(<RankCardList artists={many(10)} hasMore={false} />);

    await userEvent.click(screen.getByRole("button", { name: /next ranks/i }));
    expect(screen.getByRole("button", { name: /next ranks/i })).toBeDisabled();
  });

  it("marks the total as partial while more exists", () => {
    // The count is what's loaded, not the catalogue. Labelled rather than a
    // bare "+", which says nothing to a screen reader.
    render(<RankCardList artists={many(25)} hasMore onNeedMore={vi.fn()} />);

    expect(screen.getByLabelText(/more artists available/i)).toBeInTheDocument();
  });

  it("works with no handler at all", () => {
    // The component is used outside the paginated list too.
    expect(() => render(<RankCardList artists={many(10)} />)).not.toThrow();
  });
});
