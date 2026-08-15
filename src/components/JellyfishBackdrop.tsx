/* A second jellyfish, drifting behind everything after the title card.
 *
 * Fixed to the viewport rather than scrolled with the page, so it reads as
 * something the page is moving past rather than an image sitting in a section.
 * It drifts on its own slow cycle and its colour shifts with scroll position,
 * which is the trick the Noomo storytelling site uses to make a long scroll
 * feel like one continuous place instead of a stack of pages.
 *
 * Three rules keep it from becoming a nuisance:
 *
 *  - It never takes pointer events, and it is aria-hidden. It is atmosphere.
 *  - It unmounts entirely when it can't be seen — while the title card is on
 *    screen there is already a jellyfish, and running two WebGL scenes to
 *    show one of them is wasted battery.
 *  - It doesn't render at all on small screens, on low core counts, or under
 *    reduced motion. A phone should not be running two fluid simulations and
 *    a 3D scene to read four paragraphs.
 */

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { Theme } from "../lib/useTheme";
import "./JellyfishBackdrop.css";

const Jellyfish3D = lazy(() =>
  import("./Jellyfish3D").then((m) => ({ default: m.Jellyfish3D }))
);

/* Hue rotation, in degrees, across the whole scrollable body. A full circle
 * would take it through greens and yellows that have nothing to do with this
 * palette; a narrow sweep keeps it inside violet → pink → indigo. */
const HUE_SWEEP = 120;

export function JellyfishBackdrop({ theme }: { theme: Theme }) {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const small = window.matchMedia("(max-width: 900px)").matches;
    const weak = (navigator.hardwareConcurrency ?? 8) <= 2;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(!small && !weak && !still);
  }, []);

  // Only alive once the title card has been scrolled past.
  useEffect(() => {
    if (!enabled) return;
    const title = document.getElementById("title");
    if (!title) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    io.observe(title);
    return () => io.disconnect();
  }, [enabled]);

  // Colour follows scroll position. Written straight to a custom property on
  // a rAF rather than through state — this changes every frame.
  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    let frame = 0;

    function apply() {
      frame = 0;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const progress = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
      el!.style.setProperty("--jf-hue", `${(progress * HUE_SWEEP).toFixed(1)}deg`);
      el!.style.setProperty("--jf-drift", `${(progress * 90 - 45).toFixed(1)}px`);
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
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={ref} className="jf-backdrop" aria-hidden="true">
      <div className="jf-backdrop__inner">
        {visible && (
          <Suspense fallback={null}>
            <Jellyfish3D loop={34} theme={theme} quality="low" />
          </Suspense>
        )}
      </div>
    </div>
  );
}

export default JellyfishBackdrop;
