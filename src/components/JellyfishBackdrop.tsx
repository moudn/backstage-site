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
 *  - It doesn't render at all on very low core counts or under reduced
 *    motion. See the note on the guard below for why screen size is no
 *    longer one of the conditions.
 */

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { sample } from "../lib/jellyfishPath";
import type { Theme } from "../lib/useTheme";
import "./JellyfishBackdrop.css";

const Jellyfish3D = lazy(() =>
  import("./Jellyfish3D").then((m) => ({ default: m.Jellyfish3D }))
);

/* The hue sweep, per theme, because the two creatures no longer start from
 * the same colour and a single range cannot serve both.
 *
 * Dark starts violet (~285deg), so rotating a little forward opens on pink
 * and sweeping backwards runs through to blue — the whole journey stays
 * inside the palette. Rotating *forward* by any real amount from violet lands
 * in yellow-green; at +150 the contact screen came out olive and gold,
 * colours that appear nowhere else on the site.
 *
 * Light now starts blue-teal, and the same numbers applied to it would undo
 * the point of that: -68 from blue lands in green. So light gets a much
 * narrower sweep that stays between teal and indigo. */
const HUE_SWEEP: Record<Theme, { start: number; end: number }> = {
  dark: { start: 22, end: -68 },
  light: { start: 18, end: -26 },
};
/* How far the creature travels across the whole scrollable body. These are
 * what make it read as something the page moves past rather than a fixed
 * image: it drifts sideways, rises, and turns slowly as you go. */
const DRIFT_X = 420;   // px travelled left-to-right, centred on 0
const DRIFT_Y = 260;   // px risen over the page
const ROTATE = 14;     // degrees of slow turn

/* The drift distances above are absolute pixels, chosen against a desktop
 * viewport. Used unchanged on a phone they are catastrophic: ±210px of
 * horizontal travel on a 390px-wide screen walks the creature more than half
 * a screen width, so by the contact section it has left the page entirely
 * and all that remains is a sliver of bell against the right edge.
 *
 * So the travel is capped as a fraction of the viewport. 28% either side is
 * enough to still read as movement, and keeps the creature behind the text
 * where it belongs rather than beside it. On a desktop the cap is never the
 * binding constraint and the original numbers apply unchanged. */
function driftFor(viewportW: number, viewportH: number) {
  return {
    x: Math.min(DRIFT_X, viewportW * 0.56),
    y: Math.min(DRIFT_Y, viewportH * 0.34),
  };
}

/* The route itself lives in ../lib/jellyfishPath — pure maths, no React and
 * no DOM, so it can be run and checked directly rather than only by scrolling
 * a page whose scroll position Lenis owns. */
export function JellyfishBackdrop({ theme }: { theme: Theme }) {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  /** Canvas exists and has drawn. Wider band than `visible`. */
  const [mounted, setMounted] = useState(false);
  /** Creature is faded in. Only while its section owns the screen. */
  const [visible, setVisible] = useState(false);
  /** Overrides the above once the footer's crowd takes the screen. */
  const [suppressed, setSuppressed] = useState(false);

  /* Screen size is deliberately *not* a condition here any more.
   *
   * It used to be — anything under 900px got nothing — on the reasoning that
   * "a phone should not be running two fluid simulations and a 3D scene to
   * read four paragraphs". That reasoning had gone stale on both counts:
   *
   *  - There are no fluid simulations on a phone. SplashCursor gates itself
   *    on `(hover: hover) and (pointer: fine)`, so a touch device never
   *    starts it.
   *  - The two 3D scenes never run together. This one only mounts while #how
   *    or #contact is on screen, and the title card's canvas unmounts once it
   *    leaves the viewport. A phone runs one at a time, exactly as a desktop
   *    does, and the 890KB three.js chunk is already downloaded for the title
   *    card either way — so the marginal cost here is GPU time, not bytes.
   *
   * What remains is a guard on genuinely weak hardware and on reduced motion.
   * The creature already renders at `quality="low"` (14 tentacles, not 28)
   * and the renderer caps at 2x DPR, which is what keeps this affordable on
   * a high-density phone screen. */
  useEffect(() => {
    const weak = (navigator.hardwareConcurrency ?? 8) <= 2;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(!weak && !still);
  }, []);

  /* Only over the three sections it belongs to.
   *
   * Running it behind the *whole* page put a creature behind the intro and
   * the "what we do" copy, where it has nothing to do with what is being said
   * and reads as a busy background. Those two sections still get nothing.
   *
   * "Our products" was added later, and for a reason worth recording: with
   * the creature scoped to #how and #contact it kept appearing over the Julian
   * copy anyway, because #how is ~400vh and starts immediately underneath.
   * Tightening the band helped on a desktop and not on a phone. Rather than
   * keep chasing the boundary, the section became part of the route — an
   * accident turned into the opening of the swim, which is where PATH now
   * starts.
   *
   * Two observers, not one, and the reason is a bug this had:
   *
   * #how is roughly 400vh tall and sits directly after "Our products". With a
   * plain `threshold: 0` the creature appeared the instant #how's top edge
   * crossed the bottom of the screen — which happens while the reader is
   * still part-way up the Julian section. Because the backdrop is fixed and
   * fills the viewport, it turned up behind copy it has nothing to do with,
   * reading as a second image colliding with the page rather than as
   * something the page is moving past.
   *
   *  - `shown` uses a band across the middle of the viewport, so the creature
   *    only appears once its section genuinely owns the screen.
   *  - `mounted` uses a generous margin, so the canvas exists and has drawn
   *    a frame before that happens. Fading in a canvas that mounts at the
   *    same moment gets you a fade from black to nothing.
   *
   * The opacity itself is CSS, keyed off `data-shown` — see the .css file. */
  useEffect(() => {
    if (!enabled) return;
    const targets = ["julian", "how", "contact"]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (!targets.length) return;

    const watch = (
      rootMargin: string,
      set: (on: boolean) => void
    ) => {
      const showing = new Set<Element>();
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) showing.add(entry.target);
            else showing.delete(entry.target);
          }
          set(showing.size > 0);
        },
        { threshold: 0, rootMargin }
      );
      targets.forEach((el) => io.observe(el));
      return io;
    };

    const near = watch("15% 0px 15% 0px", setMounted);
    const over = watch("-35% 0px -35% 0px", setVisible);

    /* Hand the bottom of the page over to the footer.
     *
     * The contact section is still inside the band when the reader reaches
     * the end, so the creature was being drawn straight through the crowd —
     * a jellyfish sitting in the audience, two metaphors arguing in the same
     * 200 pixels. Fading it out as the house arrives also gives the page an
     * ending: the stage atmosphere clears, and what is left is the people
     * watching. */
    /* Watch the crowd itself, not the whole footer.
     *
     * The crowd is the thing that actually conflicts, and it is the only part
     * of the footer whose visibility means "the house has taken the screen".
     * Two attempts at using .footer both failed, in opposite directions, and
     * both for the same underlying reason — the footer's height relative to
     * the viewport is completely different on a phone and a desktop:
     *
     *   -55% from the top  ->  fired while #contact was still centred, so the
     *                          creature vanished for the screen it is meant
     *                          to be largest on.
     *   -60% from the bottom -> never fired on a phone at all, because the
     *                          page ends before the footer can rise into the
     *                          top 40% of a tall viewport.
     *
     * The crowd is pinned to the bottom of the document, so "is it on screen
     * yet" is the same question on every device. The small bottom margin just
     * means it has to be properly in view rather than one pixel over the
     * edge. */
    const house = document.querySelector(".crowd") ?? document.querySelector(".footer");
    let byeFooter: IntersectionObserver | undefined;
    if (house) {
      byeFooter = new IntersectionObserver(
        ([entry]) => setSuppressed(!!entry?.isIntersecting),
        { threshold: 0, rootMargin: "0px 0px -12% 0px" }
      );
      byeFooter.observe(house);
    }

    return () => {
      near.disconnect();
      over.disconnect();
      byeFooter?.disconnect();
    };
  }, [enabled]);

  /* The swim.
   *
   * Progress used to be measured against the whole document, and the motion
   * was a straight line from one end of it to the other: the creature entered
   * bottom-right and left top-left, at constant speed, whatever was on the
   * screen. Over three sections that reads as an image being dragged rather
   * than something moving under its own power.
   *
   * Now progress is measured across the creature's own stretch of page — the
   * top of "Our products" to the bottom of "Get in touch" — and it follows
   * the waypoints in PATH, so it crosses, doubles back, rises and settles.
   * Same technique, but the shape of the motion is authored rather than
   * implied by the endpoints.
   *
   * Written straight to custom properties on a rAF, not through state: this
   * changes every frame and a re-render per frame would fight Lenis for the
   * budget. */
  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    let startY = 0;
    let endY = 1;

    /* Measured once and on resize rather than every frame. Two
       getBoundingClientRect calls per scroll frame is a forced layout the
       page does not need, and these only move when the page reflows. */
    function measure() {
      const first = document.getElementById("julian");
      const last = document.getElementById("contact");
      if (!first || !last) return;
      startY = first.getBoundingClientRect().top + window.scrollY;
      endY = last.getBoundingClientRect().bottom + window.scrollY;
      if (endY <= startY) endY = startY + 1;
    }

    function apply() {
      frame = 0;
      /* Against the viewport's centre line, so the creature's position tracks
         what the reader is actually looking at rather than where the top edge
         of the window happens to be. */
      const centre = window.scrollY + window.innerHeight / 2;
      const progress = Math.min(1, Math.max(0, (centre - startY) / (endY - startY)));

      const at = sample(progress);
      const sweep = HUE_SWEEP[theme];
      const hue = sweep.start + at.h * (sweep.end - sweep.start);
      /* Recomputed here rather than cached, so a rotation or a resize is
         picked up — this already runs on resize. */
      const drift = driftFor(window.innerWidth, window.innerHeight);

      el!.style.setProperty("--jf-hue", `${hue.toFixed(1)}deg`);
      el!.style.setProperty("--jf-x", `${(at.x * drift.x).toFixed(1)}px`);
      el!.style.setProperty("--jf-y", `${(at.y * drift.y).toFixed(1)}px`);
      el!.style.setProperty("--jf-rot", `${(at.rot * ROTATE).toFixed(2)}deg`);
      el!.style.setProperty("--jf-scale", at.scale.toFixed(3));
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(apply);
    }

    function onResize() {
      measure();
      onScroll();
    }

    measure();
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    /* The sections change height as fonts land, images decode and the held
       sequence sizes itself, and a span measured before that is wrong for the
       whole visit. Cheap insurance: re-measure whenever the layout moves. */
    const ro = new ResizeObserver(onResize);
    const body = document.querySelector(".page");
    if (body) ro.observe(body);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [enabled, theme]);

  if (!enabled) return null;

  return (
    <div ref={ref} className="jf-backdrop" aria-hidden="true" data-shown={visible && !suppressed}>
      <div className="jf-backdrop__inner">
        {mounted && (
          <Suspense fallback={null}>
            <Jellyfish3D loop={34} theme={theme} quality="low" variant="backdrop" />
          </Suspense>
        )}
      </div>
    </div>
  );
}

export default JellyfishBackdrop;
