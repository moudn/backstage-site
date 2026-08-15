/* In-page anchor jumps.
 *
 * Lenis owns the scroll position, so a native scrollIntoView sets a value
 * Lenis overwrites on the next frame and the page springs straight back. The
 * jump has to be asked of Lenis instead. Skipping to a section is the reason
 * the nav exists, so this has to work.
 */

import { useEffect, type RefObject } from "react";
import type Lenis from "lenis";

export function useAnchorScroll(lenisRef: RefObject<Lenis | null>) {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const link = (event.target as Element | null)?.closest?.("a[href^='#']");
      if (!(link instanceof HTMLAnchorElement)) return;

      const id = link.getAttribute("href")!.slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;

      const lenis = lenisRef.current;
      // No Lenis means reduced motion, or it failed to start. The browser's
      // own anchor handling is correct in that case — leave it alone.
      if (!lenis) return;

      event.preventDefault();
      lenis.scrollTo(target, { offset: 0, duration: 1.1 });
      history.pushState(null, "", `#${id}`);
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [lenisRef]);
}
