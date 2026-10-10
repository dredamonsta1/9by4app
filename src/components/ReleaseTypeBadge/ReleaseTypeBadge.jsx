import React from "react";
import { releaseTypeBadge } from "../../utils/releaseType";
import styles from "./ReleaseTypeBadge.module.css";

// A quiet outline chip — "EP" / "Single" — next to a release's year.
// Deliberately not chartreuse: that's reserved for CTAs, rank #1 and the
// "New" chip, which this sits beside in New Music.
export default function ReleaseTypeBadge({ type }) {
  const label = releaseTypeBadge(type);
  if (!label) return null;
  return <span className={styles.badge}>{label}</span>;
}
