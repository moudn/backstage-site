/* The audience.
 *
 * The whole site is the stage and this is the house looking back at it —
 * which is the one place the company's name can be drawn rather than
 * explained. It sits behind the footer, below everything, as the last thing
 * on the page.
 *
 * Three rows, receding. Depth is carried by four things at once, because any
 * one of them alone reads as "same shape, different size":
 *
 *   further away  ->  smaller, higher up the frame, fainter, and moves less
 *
 * That last one is the parallax. The rows shift at different rates as the
 * footer comes into view, so the crowd has volume rather than being a printed
 * backdrop. It is the same trick as the jellyfish drifting behind the body
 * copy, applied to a flat shape.
 *
 * The figures are generated rather than drawn by hand, from a seeded
 * generator — so the spacing is irregular the way a real crowd is, but
 * identical on every render and every machine. An unseeded Math.random() here
 * would reshuffle the audience on each mount, and in React's StrictMode you
 * would watch it happen twice.
 *
 * The few bright specks are phone screens. They are the only warm thing in
 * the shape and they are what stops it reading as a hedge.
 */

import { useEffect, useRef } from "react";
import "./FooterCrowd.css";

const W = 1600;
const H = 260;

/* Where the drawing actually starts.
 *
 * The back row sits at y=104 with up to 8 units of jitter and a head radius
 * that tops out near 10.6, so nothing is painted above y≈89 — the top third of
 * the viewBox is empty. That empty band matters because of how the SVG is
 * fitted: see the preserveAspectRatio note below. Cropping the viewBox to the
 * ink means the band is filled with people rather than with nothing. */
const TOP = 84;

/** mulberry32 — small, fast, and deterministic from a fixed seed. */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Person = { x: number; y: number; r: number };

/** One row. `gap` is the average spacing; each figure is nudged off it so the
 *  row never reads as a comb. */
function row(seed: number, y: number, r: number, gap: number, jitter: number): Person[] {
  const rand = rng(seed);
  const people: Person[] = [];
  /* Start off the left edge and finish past the right one, so the crowd is
     cropped by the viewport rather than ending inside it. */
  for (let x = -40; x < W + 40; x += gap) {
    people.push({
      x: x + (rand() - 0.5) * gap * 0.75,
      y: y + (rand() - 0.5) * jitter,
      r: r * (0.82 + rand() * 0.36),
    });
  }
  return people;
}

/* Spacing is set against shoulder width, not eyeballed. Shoulders are drawn
 * at 1.45x the head radius, so a figure is about 2.9r across; a gap below
 * that merges the row into one continuous mass — which is what the first
 * version did, and it came out looking like a hedge rather than people. Each
 * gap here is comfortably wider than its figure, so silhouettes touch and
 * overlap in places without ever fusing. */
const ROWS = [
  { key: "back", people: row(1207, 104, 9, 36, 8), lights: 0 },
  { key: "mid", people: row(48311, 156, 13, 50, 10), lights: 3 },
  { key: "front", people: row(90210, 216, 19, 68, 12), lights: 2 },
];

/** A handful of phone screens, held up at head height. */
function lightsFor(people: Person[], count: number, seed: number) {
  if (!count) return [];
  const rand = rng(seed);
  const picks: { x: number; y: number; r: number }[] = [];
  for (let i = 0; i < count; i++) {
    const p = people[Math.floor(rand() * people.length)];
    if (!p) continue;
    picks.push({
      x: p.x + p.r * (rand() < 0.5 ? -1.5 : 1.5),
      y: p.y - p.r * (0.5 + rand()),
      r: Math.max(1.6, p.r * 0.16),
    });
  }
  return picks;
}

export function FooterCrowd() {
  const ref = useRef<HTMLDivElement>(null);

  /* Parallax against how far the footer has entered the viewport. Written to
   * a custom property on a rAF rather than through state: this runs on every
   * scroll frame, and a re-render per frame would fight Lenis for the budget
   * exactly as the other scroll-linked pieces would. */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    function apply() {
      frame = 0;
      const rect = el!.getBoundingClientRect();
      /* 0 as the crowd's top edge touches the bottom of the screen, 1 once
         the whole band is in view.
         Normalised against the crowd's own height, not the viewport's. The
         crowd sits at the very bottom of the document, so it finishes
         arriving at exactly maximum scroll — dividing by the viewport meant
         the value topped out around 0.22 and the parallax only ever ran a
         fifth of its travel. */
      const p = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / (rect.height || 1)));
      el!.style.setProperty("--crowd-p", p.toFixed(3));
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
    <div className="crowd" ref={ref} aria-hidden="true">
      {/* Light spilling off the stage and onto the front rows. It sits
          outside .crowd__stage on purpose: the clip that crops the figures
          would cut a hard horizontal edge across this gradient, and a straight
          line is the one thing a glow must not have. */}
      <div className="crowd__spill" />
      <div className="crowd__stage">
      <svg
        className="crowd__svg"
        viewBox={`0 ${TOP} ${W} ${H - TOP}`}
        /* YMin, not YMax — this was cutting the heads off.
         *
         * `slice` scales the drawing to COVER the band and clips whatever
         * overflows; the alignment keyword decides which edge is kept. The
         * band is far wider in proportion than the viewBox (1440x198 against
         * 1600x176), so the overflow is vertical, and YMax pinned the BOTTOM
         * edge — which put the overflow at the top and sliced the back row's
         * heads clean off.
         *
         * YMin pins the top instead, so the overflow falls off the bottom.
         * That is also what the drawing wants: the figures' bodies are meant
         * to run off the bottom of the page rather than end in mid-air, which
         * is why the shoulder ellipses are drawn far below the frame. Heads
         * are the part that has to survive. */
        preserveAspectRatio="xMidYMin slice"
        focusable="false"
      >
        {ROWS.map((r, i) => (
          <g key={r.key} className={`crowd__row crowd__row--${r.key}`}>
            {r.people.map((p, n) => (
              <g key={n}>
                {/* Shoulders: one ellipse whose top edge is the only part that
                    shows, everything below cropped by the frame. Narrower and
                    set lower than a first guess would put it — wide, high
                    shoulders read as a snowman, and the head stops looking
                    like a head. */}
                <ellipse cx={p.x} cy={p.y + p.r * 2.9} rx={p.r * 1.45} ry={p.r * 2.5} />
                <circle cx={p.x} cy={p.y} r={p.r} />
              </g>
            ))}
            {lightsFor(r.people, r.lights, 700 + i).map((l, n) => (
              <circle
                key={`l${n}`}
                className="crowd__light"
                cx={l.x}
                cy={l.y}
                r={l.r}
                style={{ animationDelay: `${n * 2.3}s` }}
              />
            ))}
          </g>
        ))}
      </svg>
      </div>
    </div>
  );
}

export default FooterCrowd;
