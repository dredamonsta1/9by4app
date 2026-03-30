// src/hooks/useTextHeight.ts
// React hook for feed items — watches container width, returns live height.
// Components never import Pretext or textMeasurement directly.

import { useState, useEffect, useRef } from "react";
import { getTextHeight, FEED_LINE_HEIGHT } from "../services/textMeasurement";

interface TextHeightResult {
  height: number | null;
  lineCount: number | null;
  containerRef: React.RefObject<HTMLDivElement>;
}

export function useTextHeight(
  id: string,
  lineHeight = FEED_LINE_HEIGHT
): TextHeightResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [lineCount, setLineCount] = useState<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const measure = (width: number) => {
      const result = getTextHeight(id, width, lineHeight);
      if (result) {
        setHeight(result.height);
        setLineCount(result.lineCount);
      }
    };

    // Measure immediately
    measure(containerRef.current.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      measure(width);
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [id, lineHeight]);

  return { height, lineCount, containerRef };
}
