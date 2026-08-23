/* Scroll-linked drift, shared.
 *
 * Writes two custom properties on the element as it crosses the viewport:
 *
 *   --t-shift   px, positive below the fold and negative above it
 *   --t-scale   a slight shrink at either extreme, 1 at the centre
 *
 * This started life inside SectionTitle, which is why only the titles moved.
 * That turned out to be the problem: a title drifting against a completely
 * static block of copy does not read as depth, it reads as the title having
 * come loose. Motion only says "these things are at different distances" if
 * the other things are moving too — one moving object against a fixed
 * background is just one moving object.
 *
 * So the section carries a small drift and the title carries a smaller one on
 * top of it. Transforms compose down the tree, so the title's total travel is
 * unchanged from before; what changed is that the copy underneath now travels
 * with it, slightly slower. That difference is the parallax.
 *
 * Written straight to the DOM on a rAF rather than through React state: this
 * updates every scroll frame, and a re-render per frame would be wasted work
 * and would fight Lenis for the frame budget.
 */

import { useEffect, useRef } from "react";

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function useScrollDrift<T extends HTMLElement>(shift: number, squeeze = 0) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /* Reduced motion gets nothing. The global `*{transition:none}` rule does
       not help here — this is a transform driven by a custom property, not a
       transition, so it would keep running unless it is switched off at the
       source. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    function apply() {
      frame = 0;
      const rect = el!.getBoundingClientRect();
      // -1 well below the fold, 0 at the vertical centre, 1 well above it.
      const progress = clamp(
        (window.innerHeight / 2 - (rect.top + rect.height / 2)) / (window.innerHeight / 2),
        -1,
        1
      );
      el!.style.setProperty("--t-shift", `${(progress * -shift).toFixed(1)}px`);
      if (squeeze) {
        el!.style.setProperty("--t-scale", (1 - Math.abs(progress) * squeeze).toFixed(4));
      }
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(apply);
    }

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [shift, squeeze]);

  return ref;
}
