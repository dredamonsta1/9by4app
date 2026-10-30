import { useEffect } from "react";

/** Calls onEscape when Escape is pressed, while mounted. */
export const useEscape = (onEscape) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onEscape();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onEscape]);
};
