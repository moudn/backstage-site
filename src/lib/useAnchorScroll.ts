/* In-page anchor jumps. Both scroll modes break them, in different ways, and
 * this is the one interaction that must survive either: skipping straight to
 * a section is the reason the nav exists.
 *
 * snap       Mandatory snapping captures a smooth-scroll animation at the
 *            first snap point it reaches and stops there — clicking "Get in
 *            touch" from the top travelled exactly one panel and stalled,
 *            permanently. (An instant jump lands fine; it is specifically the
 *            animation that gets caught.) Suspending snap for the duration of
 *            the jump gives both the animation and the destination.
 *
 * cinematic  Lenis owns the scroll position, so a native scrollIntoView sets
 *            a value Lenis overwrites on the next frame and the page springs
 *            back. The jump has to be asked of Lenis instead.
 */

import { useEffect, type RefObject } from "react";
import type Lenis from "lenis";
import type { ScrollMode } from "./scrollMode";

const SETTLE_FAILSAFE_MS = 3200;

export function useAnchorScroll(mode: ScrollMode, lenisRef: RefObject<Lenis | null>) {
  useEffect(() => {
    const root = document.documentElement;
    let restoreTimer: number | undefined;
    let settle: (() => void) | null = null;

    function restore() {
      root.style.scrollSnapType = "";
      if (settle) window.removeEventListener("scrollend", settle);
      settle = null;
      window.clearTimeout(restoreTimer);
    }

    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const link = (event.target as Element | null)?.closest?.("a[href^='#']");
      if (!(link instanceof HTMLAnchorElement)) return;

      const id = link.getAttribute("href")!.slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const lenis = lenisRef.current;

      if (mode === "cinematic" && lenis) {
        event.preventDefault();
        lenis.scrollTo(target, { offset: 0, duration: reduced ? 0 : 1.1 });
        history.pushState(null, "", `#${id}`);
        return;
      }

      // Nothing to work around when snapping isn't on (short window, phone,
      // reduced motion) — let the browser handle it natively.
      if (getComputedStyle(root).scrollSnapType === "none") return;

      event.preventDefault();
      restore(); // clear any jump still in progress
      root.style.scrollSnapType = "none";

      target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      history.pushState(null, "", `#${id}`);

      // Restore only once the scroll has actually arrived. A scrollend can
      // belong to a scroll that was already in flight when the link was
      // clicked — restoring on that one switches snapping back on mid-jump and
      // the animation gets captured, which is the bug this exists to avoid.
      // Checking the target's position first makes it self-correcting.
      const deadline = Date.now() + 3000;
      settle = () => {
        const arrived = Math.abs(target.getBoundingClientRect().top) < 8;
        if (arrived || Date.now() > deadline) {
          restore();
          return;
        }
        if (settle) window.addEventListener("scrollend", settle, { once: true });
      };
      window.addEventListener("scrollend", settle, { once: true });
      // Belt and braces: scrollend is not in every browser yet, and snapping
      // must never be left switched off.
      restoreTimer = window.setTimeout(restore, SETTLE_FAILSAFE_MS);
    }

    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      restore();
    };
  }, [mode, lenisRef]);
}
