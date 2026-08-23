/* The route the backdrop jellyfish swims, and the maths that reads it.
 *
 * Split out of JellyfishBackdrop because it is pure — no React, no DOM, no
 * browser APIs — which means it can be run and checked directly instead of
 * only through a scrolling page. That matters more than it sounds: the
 * component's scroll position is driven by Lenis, which reverts any
 * programmatic `window.scrollTo`, so probing this through the DOM means
 * wheel-driving the page and hoping the samples land where you wanted.
 *
 * `at` is progress along the creature's stretch of page: the top of "Our
 * products" to the bottom of "Get in touch".
 *
 * `x` and `y` are fractions of the drift budget rather than pixels, so the
 * same route works on a phone and a desktop — the budget shrinks, the shape
 * does not. `h` is position along the theme's hue sweep, a fraction for the
 * same reason.
 */

export type Waypoint = {
  at: number;
  x: number;
  y: number;
  rot: number;
  scale: number;
  h: number;
};

/* Evenly spaced on purpose — see the interpolation note below.
 *
 * The middle waypoint is where "Our products" hands over to "How we work",
 * and it is deliberately the calmest point on the route. The first version
 * swung from +0.55 to -0.45 and straight back to +0.40 across that handover:
 * nearly two full drift-widths of travel, with a direction reversal in the
 * middle of it. It read as choppy because it was — the creature crossed the
 * screen, stopped dead, and came back.
 *
 * Here the horizontal travel through that stretch is a fraction of what it
 * was, and the **colour** carries the change instead: `h` covers roughly half
 * its whole journey between 0.25 and 0.50. A section handover signalled by a
 * shift in hue rather than a dash across the screen is calmer to watch and
 * easier to follow. */
export const PATH: Waypoint[] = [
  { at: 0.0, x: 0.5, y: 0.55, rot: 0.5, scale: 0.9, h: 0.0 },
  { at: 0.25, x: 0.1, y: 0.26, rot: 0.18, scale: 0.97, h: 0.2 },
  { at: 0.5, x: -0.12, y: -0.04, rot: -0.12, scale: 1.02, h: 0.62 },
  { at: 0.75, x: 0.2, y: -0.34, rot: 0.22, scale: 1.06, h: 0.84 },
  { at: 1.0, x: 0.0, y: -0.55, rot: 0.0, scale: 1.12, h: 1.0 },
];

/* Catmull-Rom, not smoothstep-per-segment.
 *
 * Smoothstep eases within each segment, which means velocity is zero at every
 * waypoint — the creature accelerates, decelerates, halts, and sets off
 * again, five times over. Each of those halts is a stutter, and they were the
 * other half of why the handover looked choppy.
 *
 * A Catmull-Rom spline is C1 continuous: it passes through every waypoint
 * with velocity carried across the join, so the route is one unbroken glide.
 * The endpoints are duplicated to clamp the curve rather than let it fly off
 * past the first and last points.
 *
 * This form assumes evenly spaced knots, which is why PATH sits at 0, ¼, ½,
 * ¾, 1. Move a waypoint off that spacing and velocity stops matching across
 * the join — the exact stutter this replaced. */
function catmull(p0: number, p1: number, p2: number, p3: number, t: number) {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

export function sample(p: number): Omit<Waypoint, "at"> {
  const last = PATH.length - 1;
  let i = 0;
  while (i < last - 1 && p > PATH[i + 1]!.at) i++;
  const a = PATH[i]!;
  const b = PATH[i + 1]!;
  const before = PATH[Math.max(0, i - 1)]!;
  const after = PATH[Math.min(last, i + 2)]!;
  const span = b.at - a.at || 1;
  const t = Math.min(1, Math.max(0, (p - a.at) / span));
  const on = (k: keyof Omit<Waypoint, "at">) => catmull(before[k], a[k], b[k], after[k], t);
  /* The spline can overshoot slightly past a waypoint's value. That is wanted
     for x/y/rot — it is what makes a turn look like a turn rather than a
     corner — but scale and hue are clamped, because a creature that briefly
     grows past its largest, or slides outside the theme's hue range, is a
     glitch rather than a flourish. */
  return {
    x: on("x"),
    y: on("y"),
    rot: on("rot"),
    scale: Math.min(1.14, Math.max(0.88, on("scale"))),
    h: Math.min(1, Math.max(0, on("h"))),
  };
}
