/* The evidence section: four ONS figures, each with a chart and a source.
 *
 * Two things here are accessibility decisions rather than visual ones, and
 * both are easy to undo by accident:
 *
 *  - The counting number is aria-hidden and the real value sits beside it in
 *    a visually hidden span. A screen reader announcing a number that is
 *    still climbing reads out whatever it happened to catch, which for the
 *    39% figure could be any number between 0 and 39.
 *  - The source is behind a real <button> with aria-expanded, not a hover.
 *    Hover is unreachable on a touch screen and by a keyboard, and the source
 *    is the part a sceptical reader most needs — hiding it behind the one
 *    interaction some people cannot perform would defeat the point of citing
 *    it at all.
 */

import { useEffect, useRef, useState } from "react";
import { EVIDENCE } from "../data/content";
import { EvidenceChart } from "./EvidenceChart";
import "./Evidence.css";

/** Counts to `value` once, when it first comes into view. */
function useCountUp(value: number, run: boolean) {
  const [shown, setShown] = useState(run ? value : 0);

  useEffect(() => {
    if (!run) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(value);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const DURATION = 1100;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      /* Expo-out. The same curve the rest of the site uses for movement: most
         of the count happens early, then it settles onto the final figure
         rather than ticking up to it at a constant rate, which reads as a
         mechanical counter. */
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setShown(Math.round(eased * value));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [run, value]);

  return shown;
}

function Stat({ stat, index }: { stat: (typeof EVIDENCE.stats)[number]; index: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const [seen, setSeen] = useState(false);
  const [open, setOpen] = useState(false);
  const shown = useCountUp(stat.value, seen);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    /* Once only. A figure that re-counts every time it scrolls back past is a
       distraction, and on a page this long it would happen a lot. */
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <li className="ev__stat" ref={ref} data-seen={seen} style={{ transitionDelay: `${index * 90}ms` }}>
      <div className="ev__figure">
        <span className="ev__value" aria-hidden="true">
          {shown}
          <span className="ev__unit">{stat.unit}</span>
        </span>
        {/* The real figure, for anything that does not watch it count. */}
        <span className="ev__sr">
          {stat.value}
          {stat.unit}
        </span>
      </div>

      <p className="ev__claim">{stat.claim}</p>

      <div className="ev__chart">
        <EvidenceChart kind={stat.chart} on={seen} />
      </div>

      <button
        type="button"
        className="ev__toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="ev__toggle-label">{open ? "Hide source" : "Source"}</span>
        <span className="ev__toggle-mark" aria-hidden="true" />
      </button>

      {/* Kept in the DOM and collapsed with a grid row rather than unmounted,
          so the height can transition and so find-in-page can still reach the
          source text. */}
      <div className="ev__more" data-open={open}>
        <div className="ev__more-inner">
          <p className="ev__detail">{stat.detail}</p>
          <p className="ev__source">
            {stat.source}
            <span className="ev__pop">{stat.population}</span>
          </p>
        </div>
      </div>
    </li>
  );
}

export function Evidence() {
  return (
    <>
      <ul className="ev__grid">
        {EVIDENCE.stats.map((s, i) => (
          <Stat key={s.id} stat={s} index={i} />
        ))}
      </ul>
      <p className="ev__foot">{EVIDENCE.foot}</p>
    </>
  );
}

export default Evidence;
