import React from "react";
import ArtistPanel from "../components/ArtistPanel/ArtistPanel";

// HomePage is now a thin wrapper around ArtistPanel. With no artistId in
// the URL, ArtistPanel defaults to the top-ranked artist — so "/" IS the
// home view of the #1 artist's surface. The old browse-mode content
// (FiltersBar / TrendingShelf / ClickableList grid / NewMusicSection /
// RankView / StickyCtaBar) is intentionally retired here as part of the
// IA pivot; discovery happens via ▲/▼ rank flip + the navbar artist
// search. Those components remain in the codebase as orphans pending
// the cleanup PR that deletes them.
const HomePage = () => <ArtistPanel />;

export default HomePage;
