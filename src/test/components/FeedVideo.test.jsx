import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

// ArtistPanel is ~1,700 lines with redux, routing, a player and a dozen
// fetches, and FeedPost is not exported — mounting it to assert four lines of
// markup would test the harness more than the behaviour. These read the
// source instead, which is honest about what they can and cannot prove:
// they pin the decisions, not the rendering.
const read = (p) => fs.readFileSync(path.resolve(process.cwd(), p), "utf8");

/**
 * Source with comments stripped.
 *
 * Without this, a comment explaining *why* there is no autoplay fails a test
 * asserting there is no autoplay — and "no YouTube" fails for the comment
 * saying YouTube was removed. The assertions are about code, so the input
 * should be code.
 */
const code = (p) =>
  read(p)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

const panel = read("src/components/ArtistPanel/ArtistPanel.jsx");
const upload = code("src/components/UploadModal/UploadModal.jsx");
const app = read("src/App.jsx");

describe("feed video rendering", () => {
  it("renders a video element for video posts", () => {
    expect(panel).toMatch(/isVideo\s*&&/);
    expect(panel).toMatch(/<video/);
  });

  it("never autoplays", () => {
    // The audio player owns the bottom bar; a feed that starts making noise
    // beside it is a bad surprise.
    const panelCode = code("src/components/ArtistPanel/ArtistPanel.jsx");
    const block = panelCode.slice(
      panelCode.indexOf("{isVideo &&"),
      panelCode.indexOf("{isVideo &&") + 400
    );
    expect(block).not.toMatch(/autoPlay/i);
    expect(block).toMatch(/controls/);
    expect(block).toMatch(/preload="metadata"/);
  });

  it("excludes legacy youtube rows from the player", () => {
    // video_type 'youtube' is no longer creatable, but old rows must not
    // try to play a bare video id through a <video> tag.
    expect(panel).toMatch(/post\.video_type !== "youtube"/);
  });
});

describe("the video filter", () => {
  it("filters the feed rather than routing to a page", () => {
    expect(panel).toMatch(/feedFilter/);
    expect(panel).toMatch(/p\.post_type === "video"/);
  });

  it("says the filter is empty rather than the feed is", () => {
    // An empty filter on a working feed reads as an invitation; "no posts
    // yet" when there are posts reads as a bug.
    expect(panel).toMatch(/No videos yet/);
  });
});

describe("youtube entry points are closed", () => {
  it("offers no url paste in the uploader", () => {
    // This was the one path that let the platform refill with YouTube by
    // hand — cleaning the display without closing it would not have held.
    expect(upload).not.toMatch(/youtube/i);
    expect(upload).not.toMatch(/Paste URL/);
    expect(upload).not.toMatch(/feed\/video-url/);
  });

  it("has no youtube video page left to route to", () => {
    expect(app).not.toMatch(/ArtVideoFeed/);
    expect(app).not.toMatch(/art-video/);
  });

  it("keeps upload and record, which are the platform paths", () => {
    expect(upload).toMatch(/Upload File/);
    expect(upload).toMatch(/Record/);
    expect(upload).toMatch(/feed\/video/);
  });
});
