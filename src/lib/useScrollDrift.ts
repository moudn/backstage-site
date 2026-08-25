/* Scroll-linked drift, shared.
 *
 * Writes custom properties on the element as it crosses the viewport:
 *
 *   --t-shift   px, positive below the fold and negative above it
 *   --t-scale   a slight shrink at either extreme, 1 at the centre
 *
 * and, when `rotate` is on, three more that turn the section in depth:
 *
 *   --t-rot     degrees, leaning one way coming in and the other going out
 *   --t-z       px, negative at both ends — away is away in both directions
 *   --t-fade    1 while the section owns the screen, --fade-floor when gone
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

/** How far a rotating section leans, how far back it goes, and how much of it
 *  is left when it is fully away. Tuned together — a big angle with no depth
 *  reads as a page that is falling over rather than one turning. */
const TILT_DEG = 8;
const DEPTH_PX = 160;
const FADE_FLOOR = 0.66;

export function useScrollDrift<T extends HTMLElement>(
  shift: number,
  squeeze = 0,
  /** Also write --t-rot / --t-z / --t-fade, for sections that turn. */
  rotate = false
) {
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

      /* The turn.
       *
       * progress is -1 below the fold, 0 centred, +1 above — so a section
       * leans one way coming in and the other way going out, and is square on
       * only while it owns the screen. Depth and fade key off the ABSOLUTE
       * value, because both ends are "away": the section you have finished
       * with recedes, and the next one comes forward out of the same place.
       *
       * The rotation is negated so a section arriving from below is tipped
       * away at its top edge — it swings up to meet you rather than falling
       * towards you, which is the direction that reads as the page turning
       * rather than collapsing. */
      if (rotate) {
        /* Its OWN progress, normalised over the section's height plus the
           viewport rather than over half a viewport.
         *
         * `progress` above saturates as soon as the section's centre is half a
         * screen from the screen's centre. That is fine for a 14px nudge and
         * wrong for this: a .panel is 100svh PLUS up to 368px of padding, so a
         * section can still be filling the screen while its centre is a long
         * way from the middle of it. Measured with the old normalisation there
         * were scroll positions where the section nearest the centre was 832px
         * out, fully tilted and at 0.42 opacity — stretches of the page where
         * everything visible was dim and leaning.
         *
         * Over (height + viewport)/2, ±1 lands exactly when the section is
         * about to touch an edge of the screen and 0 when it is centred,
         * whatever its height. */
        const span = (rect.height + window.innerHeight) / 2;
        let turn = clamp(
          (window.innerHeight / 2 - (rect.top + rect.height / 2)) / (span || 1),
          -1,
          1
        );

        /* Flatten out at both ends of the document.
         *
         * The first and last sections can never reach the centre of the screen
         * — there is no more page to scroll — so they were stuck part-turned at
         * the two positions a reader is most likely to sit still and look. At
         * the bottom that showed as a divide above the footer: the contact
         * section was leaning 3.8deg and sitting at 0.84 opacity while the
         * footer beneath it was square on and solid, and the perspective
         * foreshortening pulled its painted bottom edge 60px clear of its
         * layout box, leaving a strip of bare background between the two.
         *
         * Damping the turn to nothing within three quarters of a screen of
         * either end means you land on a flat page and finish on one, and the
         * effect only exists in the middle where there is something to turn
         * between. */
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const fromEnd = Math.min(window.scrollY, maxScroll - window.scrollY);
        turn *= clamp(fromEnd / (window.innerHeight * 0.75), 0, 1);

        const away = Math.abs(turn);
        el!.style.setProperty("--t-rot", `${(turn * -TILT_DEG).toFixed(2)}deg`);
        el!.style.setProperty("--t-z", `${(-away * DEPTH_PX).toFixed(1)}px`);
        el!.style.setProperty("--t-fade", (1 - away * (1 - FADE_FLOOR)).toFixed(3));
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
  }, [shift, squeeze, rotate]);

  return ref;
}
