// src/hooks/useShrinkWrap.ts
// Comment bubble tightest-fit width via binary search over walkLineRanges.
// Returns an optimal max-width so bubbles hug their content like iMessage.

import { useState, useEffect, useRef } from "react";
import { prepareSegmented, shrinkWrapWidth } from "../services/textMeasurement";

interface ShrinkWrapResult {
  optimalWidth: number | null;
  containerRef: React.RefObject<HTMLDivElement>;
}

let idCounter = 0;

export function useShrinkWrap(
  text: string,
  maxLines = 4
): ShrinkWrapResult {
  // Stable ephemeral ID — not tied to any DB record
  const idRef = useRef(`shrink-${++idCounter}`);
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxWidth, setMaxWidth] = useState(0);
  const [optimalWidth, setOptimalWidth] = useState<number | null>(null);

  // Observe container for max available width
  useEffect(() => {
    if (!containerRef.current) return;
    setMaxWidth(containerRef.current.getBoundingClientRect().width);
    const observer = new ResizeObserver((entries) => {
      setMaxWidth(entries[0]?.contentRect.width ?? 0);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!text || maxWidth <= 0) return;
    const id = idRef.current;
    prepareSegmented(id, text);
    const w = shrinkWrapWidth(id, maxWidth, maxLines);
    setOptimalWidth(w);
  }, [text, maxWidth, maxLines]);

  return { optimalWidth, containerRef };
}
