/* Lenis smooth scrolling — the page's scrolling.
 *
 * Lenis stops the browser scrolling natively and moves the page itself,
 * easing towards the target position each frame. That inertia is the whole
 * effect: the scroll carries, sections glide rather than jump, and a held
 * section feels like film rather than like a slideshow. The Noomo sites get
 * it from GSAP's ScrollSmoother, which is the same idea behind a Club
 * GreenSock licence; Lenis is the open-source equivalent.
 *
 * What it costs, stated plainly because it is easy to forget once it looks
 * good: the browser's own scrolling is gone. Scroll position is now animated
 * by JavaScript, so if the script fails the page cannot scroll at all beyond
 * what the wheel handler allows. Everything native that reads scroll position
 * — find-in-page, focus scrolling, the scrollbar drag — is going through a
 * translation layer.
 */

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Taking over the scroll is precisely what a reduced-motion visitor is
    // asking not to happen. Leave the browser's scrolling alone for them.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      /* Emulating the reference's weight, which is
       *
       *   ScrollSmoother.create({ smooth: innerWidth > 1024 ? 1.5 : 0.2,
       *                           smoothTouch: 0, normalizeScroll: true })
       *
       * `smooth: 1.5` means the view takes ~1.5s to catch up with the real
       * scroll position, decaying exponentially towards it. That is Lenis's
       * *lerp* mode, not its duration mode: `duration` + `easing` runs a
       * fixed-length tween per gesture, and with an ease-out most of the
       * distance is covered in the first fraction of it — measured at 240ms
       * of actual travel, nothing like a 1.5s glide, which is why setting
       * duration: 1.5 changed almost nothing.
       *
       * lerp is the fraction of the remaining distance covered each frame.
       * Tuned by measurement rather than by the formula: 0.055 still covered 84%
       * of the distance in 200ms. 0.03 is the value that actually lags. */
      lerp: 0.03,
      // Touch devices already have inertial scrolling in hardware, and
      // doubling it up feels laggy and fights the address bar. This is the
      // reference's smoothTouch: 0.
      smoothWheel: true,
      syncTouch: false,
    });
    lenisRef.current = lenis;

    // ScrollTrigger reads scroll position on its own schedule; without this it
    // samples a value Lenis has already moved past and every scroll-driven
    // animation trails the page by a frame or more.
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    // One clock. GSAP's ticker drives Lenis rather than Lenis running its own
    // requestAnimationFrame loop, so the scroll position and everything keyed
    // to it are computed in the same frame instead of interleaving.
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    // lagSmoothing hides a slow frame by pretending less time passed. With the
    // scroll position itself on the ticker that reads as the page sticking.
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33); // GSAP's default, restored.
      lenis.off("scroll", onScroll);
      lenis.destroy();
      lenisRef.current = null;
      // Leaving the document mid-glide would strand the visitor at whatever
      // offset the last frame happened to land on.
      ScrollTrigger.refresh();
    };
  }, []);

  return lenisRef;
}
