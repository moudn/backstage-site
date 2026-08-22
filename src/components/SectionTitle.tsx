/* The big centred section titles, animated against scroll.
 *
 * Two things happen, and they are deliberately different in kind:
 *
 *  1. On arrival, the letters rise into place one after another. A stagger
 *     reads as the title assembling itself rather than a block fading in.
 *  2. While the section is on screen, the whole title drifts slowly upward
 *     and loses a little scale, tied to scroll position. That is the part
 *     that makes it feel attached to the scroll rather than triggered by it —
 *     the trick the reference leans on throughout.
 *
 * The drift is written straight to the DOM on a rAF. It changes every scroll
 * frame; a React re-render per frame would be wasted work and would fight
 * Lenis for the frame budget.
 *
 * Accessibility: the whole word is in the accessible name via aria-label, and
 * the per-letter spans are hidden, so a screen reader says "What we do" and
 * not "W. h. a. t." Under prefers-reduced-motion nothing animates and nothing
 * is transformed — the title is simply there.
 */

import { useEffect, useRef } from "react";
import "./SectionTitle.css";

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export function SectionTitle({ children }: { children: string }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Play the letters in once the title has actually arrived.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.shown = "true";
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);

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
      el!.style.setProperty("--t-shift", `${(progress * -34).toFixed(1)}px`);
      el!.style.setProperty("--t-scale", (1 - Math.abs(progress) * 0.035).toFixed(4));
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(apply);
    }

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /* Split on words first, then letters, so a title still wraps between words
     on a narrow screen instead of breaking mid-word. */
  const words = children.split(" ");
  let index = 0;

  return (
    <h2 ref={ref} className="sec-title" aria-label={children}>
      {words.map((word, w) => (
        <span className="sec-title__word" key={`${word}-${w}`} aria-hidden="true">
          {[...word].map((ch, c) => (
            <span
              className="sec-title__ch"
              key={`${ch}-${c}`}
              style={{ transitionDelay: `${index++ * 28}ms` }}
            >
              {ch}
            </span>
          ))}
        </span>
      ))}
    </h2>
  );
}

export default SectionTitle;
