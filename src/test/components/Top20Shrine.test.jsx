import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Top20Shrine, { tenureLabel } from "../../components/Top20Shrine/Top20Shrine";

const entry = (position, over = {}) => ({
  artist_id: position,
  artist_name: `Artist ${position}`,
  image_url: null,
  position,
  tier: null,
  days_as_member: null,
  ...over,
});

const roster = (n) => Array.from({ length: n }, (_, i) => entry(i + 1));

describe("tenureLabel", () => {
  it.each([
    [null, null],
    [0, "0 days"],
    [1, "1 day"],
    [12, "12 days"],
    [30, "1 mo"],
    [364, "12 mo"],
    [365, "1 yr"],
    [900, "2 yrs"],
  ])("renders %s as %s", (days, expected) => {
    expect(tenureLabel(days)).toBe(expected);
  });
});

describe("Top20Shrine", () => {
  it("gives the top slot its own treatment", () => {
    render(
      <Top20Shrine
        entries={[
          entry(1, { artist_name: "Nas", tier: "day-one", days_as_member: 900 }),
          entry(2),
        ]}
      />
    );

    expect(screen.getByRole("heading", { name: "Nas" })).toBeInTheDocument();
    expect(screen.getByText("Day One")).toBeInTheDocument();
    expect(screen.getByText(/2 yrs in your top 20/i)).toBeInTheDocument();
  });

  it("shows tier and tenure per artist, not in a separate card", () => {
    // This is what retires StanCard — if the shrine can't carry these, the
    // old card has to stay.
    render(
      <Top20Shrine
        entries={[
          entry(1),
          entry(2, { tier: "stan", days_as_member: 400 }),
          entry(3, { tier: "fan", days_as_member: 45 }),
        ]}
      />
    );

    expect(screen.getByText("Stan")).toBeInTheDocument();
    expect(screen.getByText("1 yr")).toBeInTheDocument();
    expect(screen.getByText("Fan")).toBeInTheDocument();
    expect(screen.getByText("1 mo")).toBeInTheDocument();
  });

  it("renders every artist in the list", () => {
    render(<Top20Shrine entries={roster(20)} />);

    expect(screen.getByRole("heading", { name: "Artist 1" })).toBeInTheDocument();
    expect(screen.getByText("Artist 20")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(19);
  });

  it("survives a list of one", () => {
    render(<Top20Shrine entries={[entry(1)]} />);

    expect(screen.getByRole("heading", { name: "Artist 1" })).toBeInTheDocument();
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("shows the caller's empty message", () => {
    render(<Top20Shrine entries={[]} emptyMessage="Build your Top 20" />);

    expect(screen.getByText("Build your Top 20")).toBeInTheDocument();
  });

  describe("interactions the rail used to own", () => {
    it("opens an artist when not editing", async () => {
      const onSelect = vi.fn();
      render(<Top20Shrine entries={roster(3)} onSelect={onSelect} />);

      await userEvent.click(screen.getByText("Artist 2"));

      expect(onSelect).toHaveBeenCalledWith(2);
    });

    it("opens the top slot too", async () => {
      const onSelect = vi.fn();
      render(<Top20Shrine entries={roster(3)} onSelect={onSelect} />);

      await userEvent.click(screen.getByRole("heading", { name: "Artist 1" }));

      expect(onSelect).toHaveBeenCalledWith(1);
    });

    it("offers no remove buttons outside edit mode", () => {
      render(<Top20Shrine entries={roster(3)} editable />);

      expect(screen.queryByRole("button", { name: /remove/i })).not.toBeInTheDocument();
    });

    it("removes an artist in edit mode", async () => {
      const onRemove = vi.fn();
      render(
        <Top20Shrine entries={roster(3)} editable editMode onRemove={onRemove} />
      );

      await userEvent.click(
        screen.getByRole("button", { name: /remove artist 3/i })
      );

      expect(onRemove).toHaveBeenCalledWith(3);
    });

    it("does not open an artist while editing", async () => {
      const onSelect = vi.fn();
      const onRemove = vi.fn();
      render(
        <Top20Shrine
          entries={roster(3)}
          editable
          editMode
          onSelect={onSelect}
          onRemove={onRemove}
        />
      );

      await userEvent.click(screen.getByText("Artist 2"));

      // Clicking a row mid-edit should not navigate away from the edit.
      expect(onSelect).not.toHaveBeenCalled();
    });

    it("is draggable only while editing your own list", () => {
      const { rerender, container } = render(
        <Top20Shrine entries={roster(3)} editable editMode />
      );
      expect(container.querySelectorAll('[draggable="true"]').length).toBe(3);

      rerender(<Top20Shrine entries={roster(3)} editable />);
      expect(container.querySelectorAll('[draggable="true"]').length).toBe(0);
    });

    it("is never draggable on someone else's profile", () => {
      const { container } = render(
        <Top20Shrine entries={roster(3)} editable={false} editMode />
      );

      expect(container.querySelectorAll('[draggable="true"]').length).toBe(0);
    });

    it("offers no remove on someone else's profile", () => {
      render(<Top20Shrine entries={roster(3)} editable={false} editMode />);

      expect(screen.queryByRole("button", { name: /remove/i })).not.toBeInTheDocument();
    });
  });
});
