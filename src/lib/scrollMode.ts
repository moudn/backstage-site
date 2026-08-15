/* Two scroll architectures, switchable at runtime.
 *
 * They are genuinely different machines, not a setting — one hands the work to
 * the browser, the other takes it over — so rather than maintain two branches
 * they both ship and a switcher picks between them. Pick a winner and delete
 * the other: see README, "Choosing a scroll mode".
 *
 *   snap       CSS scroll-snap. The scroll settles on one section at a time.
 *              The browser does the assisting, so the keyboard, Page Down,
 *              find-in-page and anchor jumps all keep working, and if the JS
 *              fails the page is an ordinary document.
 *
 *   cinematic  Lenis drives the scroll position itself, with inertia. Nothing
 *              snaps; sections hold themselves in place while their content
 *              advances against scroll progress. This is the technique the
 *              Noomo sites use (GSAP ScrollSmoother, which is the paid
 *              equivalent of Lenis). Costs the native behaviours above.
 *
 * The mode is on <html> as data-scroll-mode so CSS can branch on it too —
 * panels.css only switches snapping on inside [data-scroll-mode="snap"].
 */

import { useCallback, useEffect, useState } from "react";

export const SCROLL_MODES = ["snap", "cinematic"] as const;
export type ScrollMode = (typeof SCROLL_MODES)[number];

export const DEFAULT_SCROLL_MODE: ScrollMode = "snap";

const STORAGE_KEY = "backstage-scroll-mode";

function isMode(value: unknown): value is ScrollMode {
  return typeof value === "string" && (SCROLL_MODES as readonly string[]).includes(value);
}

/** ?scroll=cinematic wins over the stored choice, so a link can open the site
 *  in a specific mode — which is the point when two people are comparing. */
function readInitialMode(): ScrollMode {
  if (typeof window === "undefined") return DEFAULT_SCROLL_MODE;

  const fromQuery = new URLSearchParams(window.location.search).get("scroll");
  if (isMode(fromQuery)) return fromQuery;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isMode(stored)) return stored;
  } catch {
    // Private mode, or storage disabled. Not worth failing over.
  }
  return DEFAULT_SCROLL_MODE;
}

export function useScrollMode() {
  const [mode, setMode] = useState<ScrollMode>(readInitialMode);

  useEffect(() => {
    document.documentElement.dataset.scrollMode = mode;
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // As above.
    }
  }, [mode]);

  const choose = useCallback((next: ScrollMode) => {
    setMode((current) => {
      if (current === next) return current;
      // Switching rebuilds the scroll machinery underneath the visitor, and
      // landing them at a scroll offset that means something different in the
      // other mode is disorienting. Start both from the same place.
      window.scrollTo({ top: 0, behavior: "instant" });
      return next;
    });
  }, []);

  return { mode, choose };
}
