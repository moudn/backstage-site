/* ScrollReveal — word-by-word reveal tied to scroll position.
 * Adapted from React Bits (reactbits.dev), with four changes:
 *
 *  1. The element is configurable. The original always rendered an <h2>
 *     wrapping a <p>, which is invalid (h2 takes phrasing content, not flow)
 *     and would put an h2 around every paragraph it touched, wrecking the
 *     document outline. `as` defaults to <p>.
 *
 *  2. Cleanup is scoped. The original ran
 *     `ScrollTrigger.getAll().forEach(t => t.kill())` on unmount, which kills
 *     every trigger on the page — so unmounting one instance would silently
 *     break every other one. gsap.context() reverts only what this instance
 *     created.
 *
 *  3. prefers-reduced-motion is honoured. GSAP writes inline styles, so the
 *     site's global `*{animation:none;transition:none}` does not stop it —
 *     without this check a reduced-motion visitor is left reading text pinned
 *     at 10% opacity, permanently. When reduced motion is set we simply never
 *     animate, and the text renders normally.
 *
 *  4. Children must be a string, and that is now enforced by the type. The
 *     original fell back to an empty string for anything else, so passing JSX
 *     rendered nothing at all with no warning.
 */

import { createElement, useEffect, useMemo, useRef, type ElementType } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./ScrollReveal.css";

gsap.registerPlugin(ScrollTrigger);

export type ScrollRevealProps = {
  /** Plain text. It gets split into words, so markup can't survive here. */
  children: string;
  /** Element to render. Pick the one the outline actually needs. */
  as?: ElementType;
  /** How the reveal is driven.
   *
   *  "scrub" ties progress to scroll position — the original behaviour, right
   *  for a long freely-scrolling page.
   *
   *  "enter" plays once when the element arrives, for a section that lands
   *  all at once: with no gradual scroll through it left to scrub against, a
   *  scrubbed reveal either finishes instantly or never starts. */
  mode?: "scrub" | "enter";
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  className?: string;
  textClassName?: string;
  rotationEnd?: string;
  wordAnimationEnd?: string;
  /** "enter" mode only: seconds before the stagger starts. */
  delay?: number;
};

export function ScrollReveal({
  children,
  as: Tag = "p",
  mode = "enter",
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  className = "",
  textClassName = "",
  rotationEnd = "bottom bottom",
  wordAnimationEnd = "bottom bottom",
  delay = 0,
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLElement>(null);

  const words = useMemo(
    () =>
      children.split(/(\s+)/).map((word, i) =>
        /^\s+$/.test(word) ? (
          word
        ) : (
          <span className="sr-word" key={i}>
            {word}
          </span>
        )
      ),
    [children]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const wordEls = el.querySelectorAll(".sr-word");

      if (mode === "enter") {
        // Plays once when the section arrives. `once` matters: without it,
        // scrolling back up to a section would replay the reveal
        // every time and the page would never settle.
        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
          delay,
        });
        tl.fromTo(
          el,
          { transformOrigin: "0% 50%", rotate: baseRotation },
          { rotate: 0, duration: 0.9, ease: "power3.out" },
          0
        );
        tl.fromTo(
          wordEls,
          {
            opacity: baseOpacity,
            ...(enableBlur ? { filter: `blur(${blurStrength}px)` } : null),
            willChange: "opacity, filter",
          },
          {
            opacity: 1,
            ...(enableBlur ? { filter: "blur(0px)" } : null),
            duration: 0.75,
            ease: "power2.out",
            stagger: 0.035,
            // Drop will-change once it has played; leaving it on every word
            // keeps a layer alive for each one, for nothing.
            onComplete: () => gsap.set(wordEls, { willChange: "auto" }),
          },
          0.05
        );
        return;
      }

      gsap.fromTo(
        el,
        { transformOrigin: "0% 50%", rotate: baseRotation },
        {
          ease: "none",
          rotate: 0,
          scrollTrigger: { trigger: el, start: "top bottom", end: rotationEnd, scrub: true },
        }
      );

      gsap.fromTo(
        wordEls,
        { opacity: baseOpacity, willChange: "opacity" },
        {
          ease: "none",
          opacity: 1,
          stagger: 0.05,
          scrollTrigger: {
            trigger: el,
            start: "top bottom-=20%",
            end: wordAnimationEnd,
            scrub: true,
          },
        }
      );

      if (enableBlur) {
        gsap.fromTo(
          wordEls,
          { filter: `blur(${blurStrength}px)` },
          {
            ease: "none",
            filter: "blur(0px)",
            stagger: 0.05,
            scrollTrigger: {
              trigger: el,
              start: "top bottom-=20%",
              end: wordAnimationEnd,
              scrub: true,
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [mode, enableBlur, baseOpacity, baseRotation, blurStrength, rotationEnd, wordAnimationEnd, delay]);

  // createElement rather than <Tag>: a polymorphic `as` widens the JSX props
  // to a union TypeScript resolves to `never`, so ref and className fail to
  // typecheck through the element syntax.
  return createElement(
    Tag,
    { ref: containerRef, className: `scroll-reveal ${className}`.trim() },
    <span className={`scroll-reveal-text ${textClassName}`.trim()}>{words}</span>
  );
}

export default ScrollReveal;
