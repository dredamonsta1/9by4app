import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import NewMusicSection from "../../components/NewMusicSection/NewMusicSection";

vi.mock("../../utils/axiosInstance", () => ({
  default: { get: vi.fn() },
}));

// Shaped exactly like GET /music/upcoming's response. The card read
// `imageUrl`, which the API never sends, so every release showed initials
// instead of its artwork — and nothing caught it because nothing rendered
// the component with the real field names.
const release = {
  id: "am-6820239289",
  title: "Flavorz Pack",
  artist: "Dei V",
  date: "2026-10-14",
  image_url: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/2f/07/88/885288786965.jpg/600x600bb.jpg",
  url: "https://music.apple.com/us/album/flavorz-pack/6820239289",
  source: "Apple Music",
};

const renderSection = (upcomingReleases) =>
  render(
    <MemoryRouter>
      <NewMusicSection upcomingReleases={upcomingReleases} />
    </MemoryRouter>
  );

describe("NewMusicSection upcoming releases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axiosInstance.get.mockResolvedValue({ data: [] });
  });

  it("shows each release's artwork from image_url", () => {
    renderSection([release]);

    const img = screen.getByRole("img", { name: "Flavorz Pack" });
    expect(img).toHaveAttribute("src", release.image_url);
  });

  it("falls back to initials when a release has no artwork", () => {
    renderSection([{ ...release, image_url: null }]);

    expect(screen.queryByRole("img", { name: "Flavorz Pack" })).toBeNull();
    expect(screen.getByText("FP")).toBeInTheDocument();
  });

  it("shows the artist, date and source", () => {
    renderSection([release]);

    expect(screen.getByText("Dei V")).toBeInTheDocument();
    expect(screen.getByText("2026-10-14")).toBeInTheDocument();
    expect(screen.getByText("Apple Music")).toBeInTheDocument();
  });
});
