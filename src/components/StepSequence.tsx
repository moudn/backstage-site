/* "How we work" as a held sequence: the section stays put while the four
 * steps advance against scroll position.
 *
 * Built on `position: sticky` rather than GSAP's ScrollTrigger pin. Pinning
 * works by switching the element to `position: fixed` and inserting a spacer
 * to replace its height, which rewrites the document's scroll height as
 * triggers refresh. That fights Lenis, which is reading and writing the same
 * scroll position. Sticky is three lines of CSS, changes no layout, and still
 * shows the content if the JS never runs — none of which a pin manages.
 *
 * The animation is written to the DOM directly, not through React state. This
 * runs on every scroll frame; a re-render per frame would be pointless work
 * and would fight Lenis for the frame budget.
 */

import { useEffect, useRef } from "react";
import { HOW_TITLE, STEPS } from "../data/content";
import { PopTitle } from "./PopTitle";
import "./StepSequence.css";

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export function StepSequence() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cards = Array.from(root.querySelectorAll<HTMLElement>(".steps-seq__card"));
    const rail = root.querySelector<HTMLElement>(".steps-seq__rail-fill");
    const counter = root.querySelector<HTMLElement>(".steps-seq__counter-now");
    const rows = Array.from(root.querySelectorAll<HTMLElement>(".steps-seq__idx"));
    const last = STEPS.length - 1;

    let frame = 0;
    let shown = -1;

    function apply() {
      frame = 0;
      const rect = root!.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      // Guard against the reduced-motion / static layout where there is no
      // travel at all: dividing by zero here would put every card at NaN and
      // blank the section.
      const progress = travel > 0 ? clamp(-rect.top / travel, 0, 1) : 0;
      const head = progress * last;

      for (let i = 0; i < cards.length; i++) {
        // Distance from the reading head, in steps. 0 is centre stage.
        const d = i - head;
        const away = Math.abs(d);
        // Deliberately narrow: a card is legible only while it is the one
        // being read. Overlapping paragraphs at half opacity read as a
        // rendering fault, not as depth.
        const opacity = clamp(1 - away * 1.35, 0, 1);
        const card = cards[i]!;
        card.style.opacity = String(opacity);
        card.style.transform = `translate3d(0, ${(d * 44).toFixed(2)}px, 0)`;
        card.style.filter = away > 0.02 ? `blur(${Math.min(away * 5, 10).toFixed(2)}px)` : "none";
        // Fully faded cards must not swallow clicks on what is behind them.
        card.style.visibility = opacity < 0.01 ? "hidden" : "visible";
      }

      if (rail) rail.style.transform = `scaleY(${progress || 0})`;

      const active = Math.round(head);
      if (active !== shown) {
        shown = active;
        if (counter) counter.textContent = STEPS[active]?.n ?? STEPS[0]!.n;
        rows.forEach((row, i) => {
          row.classList.toggle("is-active", i === active);
          row.classList.toggle("is-done", i < active);
          // The index is the reader's map of a section that otherwise hides
          // its own length, so it has to say where they are out loud too.
          if (i === active) row.setAttribute("aria-current", "step");
          else row.removeAttribute("aria-current");
        });
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
  }, []);

  return (
    <div
      ref={rootRef}
      className="steps-seq"
      style={{ "--steps": STEPS.length } as React.CSSProperties}
    >
      <div className="steps-seq__stage">
        <div className="steps-seq__head">
          <PopTitle className="steps-seq__title">{HOW_TITLE}</PopTitle>
          <p className="steps-seq__counter">
            <span className="steps-seq__counter-now">{STEPS[0]!.n}</span>
            <span className="steps-seq__counter-sep">/</span>
            <span>{String(STEPS.length).padStart(2, "0")}</span>
          </p>
        </div>

        <div className="steps-seq__body">
          <div className="steps-seq__cards">
            {STEPS.map((step) => (
              <article key={step.n} className="steps-seq__card">
                <p className="steps-seq__n">{step.n}</p>
                <h3 className="steps-seq__step-title">{step.title}</h3>
                <p className="steps-seq__step-body">{step.body}</p>
              </article>
            ))}
          </div>

          {/* The index. A held section hides its own length — the reader
              cannot see how much is left, or what they are being taken
              towards, and that is what makes this kind of thing feel like
              being trapped rather than led. All four are listed, the current
              one lit. It is also the whole list for anyone who arrives with
              the JS not running. */}
          <ol className="steps-seq__index">
            <span className="steps-seq__rail" aria-hidden="true">
              <span className="steps-seq__rail-fill" />
            </span>
            {STEPS.map((step, i) => (
              <li
                key={`idx-${step.n}`}
                className={`steps-seq__idx${i === 0 ? " is-active" : ""}`}
                {...(i === 0 ? { "aria-current": "step" as const } : null)}
              >
                <span className="steps-seq__idx-n">{step.n}</span>
                <span className="steps-seq__idx-t">{step.title}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

export default StepSequence;
