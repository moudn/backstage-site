/* The page's ground: four drifting lights, a turning sheen, a vignette and a
 * layer of grain, fixed behind everything. See AmbientField.css.
 *
 * Almost all of it is CSS. The one thing JavaScript does is publish how far
 * down the page the reader is, as --amb-p on the root of the layer, which the
 * stylesheet turns into a hue rotation: the whole field changes colour as you
 * scroll, so the top of the site and the bottom of it are different rooms.
 *
 * It takes no theme prop. The colours — including how far the hue travels —
 * are custom properties, so a theme change repaints it without React being
 * involved at all; passing `theme` down would re-render the component on every
 * toggle to produce identical markup.
 */

import { useEffect, useRef } from "react";
import "./AmbientField.css";

export function AmbientField() {
  const ref = useRef<HTMLDivElement>(null);

  /* Written straight to a custom property on a rAF, not through state. This
   * changes on every scroll frame and a re-render per frame would fight Lenis
   * for the budget — the same reason the jellyfish backdrop and the footer
   * crowd write their scroll position this way rather than storing it. */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    /* Reduced motion leaves --amb-p at its CSS default of 0, so the field
       keeps the colours it opens on rather than being animated by scrolling.
       The global `* { animation: none }` in tokens.css cannot cover this one,
       because it is not an animation. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    function apply() {
      frame = 0;
      const span = document.documentElement.scrollHeight - window.innerHeight;
      const p = span > 0 ? Math.min(1, Math.max(0, window.scrollY / span)) : 0;
      el!.style.setProperty("--amb-p", p.toFixed(4));
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
  }, []);

  return (
    <div className="ambient" ref={ref} aria-hidden="true">
      <div className="ambient__lights">
        <span className="ambient__light ambient__light--a" />
        <span className="ambient__light ambient__light--b" />
        <span className="ambient__light ambient__light--c" />
        <span className="ambient__light ambient__light--d" />
      </div>
      <div className="ambient__sheen" />
      <div className="ambient__vignette" />
      <div className="ambient__grain" />
    </div>
  );
}

export default AmbientField;
