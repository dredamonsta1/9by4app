// src/hooks/useLiveCompose.ts
// Composer hook — runs prepare() on every keystroke in pre-wrap mode.
// Exposes line count + overflow status to the editor UI.

import { useState, useEffect, useRef } from "react";
import { prepare, layout } from "@chenglou/pretext";
import { FEED_FONT, FEED_LINE_HEIGHT } from "../services/textMeasurement";

interface LiveComposeOptions {
  maxLines?: number;
  containerWidth?: number;
  font?: string;
  lineHeight?: number;
}

interface LiveComposeResult {
  lineCount: number;
  height: number;
  isOverLimit: boolean;
  containerRef: React.RefObject<HTMLTextAreaElement>;
}

export function useLiveCompose(
  text: string,
  {
    maxLines = 20,
    font = FEED_FONT,
    lineHeight = FEED_LINE_HEIGHT,
  }: LiveComposeOptions = {}
): LiveComposeResult {
  const containerRef = useRef<HTMLTextAreaElement>(null);
  const [width, setWidth] = useState(0);
  const [lineCount, setLineCount] = useState(0);
  const [height, setHeight] = useState(0);

  // Track container width via ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    setWidth(containerRef.current.getBoundingClientRect().width);
    const observer = new ResizeObserver((entries) => {
      setWidth(entries[0]?.contentRect.width ?? 0);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Re-prepare and layout on every text or width change
  useEffect(() => {
    if (!text || width <= 0) {
      setLineCount(0);
      setHeight(0);
      return;
    }
    // No caching — composer text changes on every keystroke
    const prepared = prepare(text, font, { whiteSpace: "pre-wrap" });
    const result = layout(prepared, width, lineHeight);
    setLineCount(result.lineCount);
    setHeight(result.height);
  }, [text, width, font, lineHeight]);

  return {
    lineCount,
    height,
    isOverLimit: lineCount > maxLines,
    containerRef,
  };
}
