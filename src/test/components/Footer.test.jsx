import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Footer from "../../components/Footer/Footer";

// MusicBrainz genre tags are CC BY-NC-SA, which requires credit, and
// MetaBrainz asks to be credited for ListenBrainz data. The credit has to be
// on every page, so it lives in the footer.
describe("Footer — music data credit", () => {
  const renderFooter = () =>
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

  it.each([
    ["MusicBrainz", "https://musicbrainz.org"],
    ["ListenBrainz", "https://listenbrainz.org"],
    ["MetaBrainz Foundation", "https://metabrainz.org"],
  ])("credits %s with a link", (name, href) => {
    renderFooter();
    const link = screen.getByRole("link", { name });
    expect(link).toHaveAttribute("href", href);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });
});
