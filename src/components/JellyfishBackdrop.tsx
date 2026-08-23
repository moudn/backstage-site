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

  /* Only over the two sections it belongs to.
   *
   * Running it behind the whole page put a creature behind the intro, the
   * "what we do" copy and the Julian table, where it has nothing to do with
   * what is being said and just reads as a busy background. Behind the held
   * step sequence and the contact screen it is doing a job: those are the two
   * moments that are otherwise a lot of empty space.
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
    const targets = ["how", "contact"]
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
    const footer = document.querySelector(".footer");
    let byeFooter: IntersectionObserver | undefined;
    if (footer) {
      byeFooter = new IntersectionObserver(
        ([entry]) => setSuppressed(!!entry?.isIntersecting),
        { threshold: 0, rootMargin: "-55% 0px 0px 0px" }
      );
      byeFooter.observe(footer);
    }

    return () => {
      near.disconnect();
      over.disconnect();
      byeFooter?.disconnect();
    };
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
      const sweep = HUE_SWEEP[theme];
      const hue = sweep.start + progress * (sweep.end - sweep.start);
      /* Recomputed here rather than cached, so a rotation or a resize is
         picked up — this already runs on resize. */
      const drift = driftFor(window.innerWidth, window.innerHeight);
      el!.style.setProperty("--jf-hue", `${hue.toFixed(1)}deg`);
      el!.style.setProperty("--jf-x", `${(progress * drift.x - drift.x / 2).toFixed(1)}px`);
      el!.style.setProperty("--jf-y", `${(drift.y / 2 - progress * drift.y).toFixed(1)}px`);
      el!.style.setProperty("--jf-rot", `${(progress * ROTATE - ROTATE / 2).toFixed(2)}deg`);
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
