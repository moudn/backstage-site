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
