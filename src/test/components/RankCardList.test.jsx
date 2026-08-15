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
