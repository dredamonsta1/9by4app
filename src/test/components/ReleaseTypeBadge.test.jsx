import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { renderWithProviders } from "../utils";
import ReleaseTypeBadge from "../../components/ReleaseTypeBadge/ReleaseTypeBadge";
import NewMusicSection from "../../components/NewMusicSection/NewMusicSection";
import { releaseTypeBadge, splitReleaseSuffix, RELEASE_TYPE_LABEL } from "../../utils/releaseType";
import axiosInstance from "../../utils/axiosInstance";

// Story 17: fans see "EP" / "Single" on releases. Albums (~95% of the
// catalogue) stay unbadged.

vi.mock("../../utils/axiosInstance", () => ({ default: { get: vi.fn() } }));

describe("ReleaseTypeBadge", () => {
  it.each([
    ["ep", "EP"],
    ["single", "Single"],
  ])("shows %s as %s", (type, label) => {
    render(<ReleaseTypeBadge type={type} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it.each([["album"], [null], [undefined], ["compilation"]])("renders nothing for %s", (type) => {
    const { container } = render(<ReleaseTypeBadge type={type} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("releaseType utils", () => {
  it("keeps one label map, shared with the artist dashboard", () => {
    expect(RELEASE_TYPE_LABEL).toEqual({ single: "Single", ep: "EP", album: "Album" });
    expect(releaseTypeBadge("album")).toBeNull();
  });

  it.each([
    ["Long Life Living for a Lover Boy - EP", { title: "Long Life Living for a Lover Boy", type: "ep" }],
    ["She's the Best - Single", { title: "She's the Best", type: "single" }],
    ["Mud", { title: "Mud", type: null }],
    ["Self-Titled - Deluxe", { title: "Self-Titled - Deluxe", type: null }],
  ])("splits Apple's format suffix off %s", (input, out) => {
    expect(splitReleaseSuffix(input)).toEqual(out);
  });
});

describe("NewMusicSection badges", () => {
  beforeEach(() => vi.clearAllMocks());

  it("badges EPs and singles from the catalogue, not albums", async () => {
    axiosInstance.get.mockResolvedValue({
      data: [
        { album_id: 1, album_name: "Habits", artist_id: 9, artist_name: "Maeta", year: 2024, release_type: "ep" },
        { album_id: 2, album_name: "Blonde", artist_id: 75, artist_name: "Frank Ocean", year: 2016, release_type: "album" },
        { album_id: 3, album_name: "Spread My Ashes", artist_id: 5, artist_name: "X", year: 2026, release_type: "single" },
      ],
    });
    renderWithProviders(<NewMusicSection upcomingReleases={[]} />);

    expect(await screen.findByText("EP")).toBeInTheDocument();
    expect(screen.getByText("Single")).toBeInTheDocument();
    expect(screen.queryByText("Album")).toBeNull();
  });

  it("badges Apple upcoming releases from their title suffix, and shows the clean title", async () => {
    axiosInstance.get.mockResolvedValue({ data: [] });
    renderWithProviders(
      <NewMusicSection
        upcomingReleases={[
          { id: "am-1", title: "Long Life Living for a Lover Boy - EP", artist: "Someone", date: "2026-10-09", source: "Apple Music" },
          { id: "am-2", title: "Mud", artist: "Remi Wolf", date: "2026-10-09", source: "Apple Music" },
        ]}
      />
    );

    expect(await screen.findByText("Long Life Living for a Lover Boy")).toBeInTheDocument();
    expect(screen.getByText("EP")).toBeInTheDocument();
    expect(screen.queryByText(/ - EP$/)).toBeNull();
    expect(screen.getAllByText(/EP|Single/)).toHaveLength(1);
  });
});
