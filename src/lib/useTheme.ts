import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "backstage-theme";

function systemTheme(): Theme {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function storedTheme(): Theme | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null; // private mode / storage disabled
  }
}

/** The active theme, plus a toggle that persists the choice.
 *
 * The stylesheet handles the system preference on its own via the media
 * query, so nothing is stamped on <html> until the user actually picks —
 * stamping on load would freeze visitors out of following their OS. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() =>
    typeof window === "undefined" ? "light" : (storedTheme() ?? systemTheme())
  );
  const [explicit, setExplicit] = useState<boolean>(() =>
    typeof window === "undefined" ? false : storedTheme() !== null
  );

  useEffect(() => {
    const root = document.documentElement;
    if (explicit) root.setAttribute("data-theme", theme);
    else root.removeAttribute("data-theme");
  }, [theme, explicit]);

  // Follow the OS while the visitor hasn't overridden it.
  useEffect(() => {
    if (explicit) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setTheme(systemTheme());
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [explicit]);

  const toggle = useCallback(() => {
    /* Cross-fade the swap.
     *
     * Custom properties do not transition — they are not animatable unless
     * registered with @property — so transitioning `--bg` itself does nothing.
     * What can transition is each property that READS one, which is why this
     * paints a class on <html> for the length of the fade and lets a single
     * blanket rule in tokens.css cover the whole tree. It is a heavy selector,
     * so it is only live for those 420ms and never during normal scrolling.
     *
     * Deliberately not the View Transitions API: that snapshots the document,
     * and three WebGL canvases and a fixed background do not survive being
     * photographed and cross-faded — the creatures freeze mid-swap. */
    const root = document.documentElement;
    root.classList.add("theme-changing");
    window.setTimeout(() => root.classList.remove("theme-changing"), 460);

    setTheme((current) => {
      const next: Theme = current === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* nothing to do — the toggle still works for this session */
      }
      return next;
    });
    setExplicit(true);
  }, []);

  return { theme, toggle };
}
