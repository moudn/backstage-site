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
 * The drift now comes from useScrollDrift, which DriftSection also uses at a
 * smaller amount. That is the important part: this title used to be the only
 * thing on the page moving with scroll, and a title drifting against a static
 * block of copy reads as the title having come loose rather than as depth.
 * The section carries the copy along underneath, slightly slower, and the two
 * transforms compose — so the amount here is smaller than it was while the
 * title's total travel is unchanged.
 *
 * Accessibility: the whole word is in the accessible name via aria-label, and
 * the per-letter spans are hidden, so a screen reader says "What we do" and
 * not "W. h. a. t." Under prefers-reduced-motion nothing animates and nothing
 * is transformed — the title is simply there.
 */

import { Fragment, useEffect, type CSSProperties } from "react";
import { useScrollDrift } from "../lib/useScrollDrift";
import "./SectionTitle.css";

/** Was 34 when the title drifted alone. DriftSection now contributes 14 of
 *  that beneath it, and the two compose. */
const TITLE_SHIFT = 20;

export function SectionTitle({ children }: { children: string }) {
  const ref = useScrollDrift<HTMLHeadingElement>(TITLE_SHIFT, 0.035);

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
    /* The drift used to live here too. It is useScrollDrift's job now — this
       effect only decides when the letters play in. */
    return () => io.disconnect();
  }, [ref]);

  /* Split on words first, then letters, so a title still wraps between words
     on a narrow screen instead of breaking mid-word. */
  const words = children.split(" ");
  let index = 0;

  return (
    <h2 ref={ref} className="sec-title" aria-label={children}>
      {/* The space between words is a real text node BETWEEN the word spans,
          not the ::after pseudo-element it used to be, and not inside them.

          Why it matters: a pseudo-element's `content` is not part of the
          document text. It is not in textContent, it is not selectable, and a
          crawler reading this heading saw "Whyshouldyouimplementourservices?"
          as a single unreadable token. Headings are among the strongest
          on-page signals there are, and every section title on this site was
          arriving as a run of letters with no words in it.

          It has to be a sibling, not the first child of the word span: that
          span is an inline-block, and leading whitespace inside an
          inline-block is trimmed, so a space put in there would vanish and
          the bug would look fixed in the DOM while still rendering wrong. */}
      {words.map((word, w) => (
        <Fragment key={`${word}-${w}`}>
          {w > 0 ? " " : null}
          <span className="sec-title__word" aria-hidden="true">
            {[...word].map((ch, c) => (
              <span
                className="sec-title__ch"
                key={`${ch}-${c}`}
                /* --i drives the specular sweep's stagger in CSS; the delay is
                   the same number, kept here so the two never drift apart. */
                style={{ "--i": index, transitionDelay: `${index++ * 28}ms` } as CSSProperties}
              >
                {ch}
              </span>
            ))}
          </span>
        </Fragment>
      ))}
    </h2>
  );
}

export default SectionTitle;
