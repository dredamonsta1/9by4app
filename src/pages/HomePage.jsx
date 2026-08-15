import React from "react";
import ArtistPanel from "../components/ArtistPanel/ArtistPanel";

// HomePage is a thin wrapper around ArtistPanel, which IS the landing
// page — filter strip, rankings, featured artist and its detail boxes all
// render inside it.
//
// A previous version of this comment claimed FiltersBar / TrendingShelf /
// RankView / NewMusicSection were "intentionally retired here" and left as
// orphans pending a cleanup PR. That was wrong: all of them render inside
// ArtistPanel, and anyone trusting it would go looking for landing-page
// work in the wrong file.
//
// As of the rankings-first pivot (Story 5) the layout is two columns —
// platform content dominant on the left with the rankings list at the top,
// and the selected artist plus everything about them as the companion on
// the right. RankView (the old table) is the one thing genuinely orphaned
// now, replaced by RankCardList.
const HomePage = () => <ArtistPanel />;

export default HomePage;
