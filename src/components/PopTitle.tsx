/* The held section's title, with an entrance of its own.
 *
 * Every other section uses SectionTitle: letters rise a little and fade, and
 * the whole line drifts against scroll position. That is right for a title
 * you scroll past. "How we work" is not scrolled past — the section pins
 * itself and holds while four steps advance — so the same treatment reads as
 * a smaller version of a thing that then refuses to leave.
 *
 * This one comes *out* of the page instead. Each letter starts pushed back in
 * Z, tilted away, blurred and thin, then springs forward onto the picture
 * plane, straightening and thickening as it lands. The overshoot in the
 * easing is what makes it read as a pop rather than a fade.
 *
 * Two details that do most of the work:
 *
 *  - The weight is animated, not just the transform. Sora is a variable font,
 *    so `font-variation-settings: 'wght'` can run 200 -> 700 over the same
 *    900ms. A letter that thickens as it arrives looks like it is being lit
 *    rather than moved, and it costs nothing: one file already covers every
 *    weight.
 *  - Perspective sits on the container, not on each letter. Per-letter
 *    `perspective()` gives every character its own vanishing point, so they
 *    fly at the viewer in parallel like a wall. One shared camera makes the
 *    outer letters swing wider than the middle ones, which is what a real
 *    lens does.
 *
 * Accessibility matches SectionTitle: the letters are aria-hidden and the
 * whole string is on the container, so a screen reader reads "How we work"
 * and not nine separate characters.
 */

import { Fragment, useEffect, useRef, useState } from "react";
import "./PopTitle.css";

export function PopTitle({ children, className = "" }: { children: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Words first, then letters, so the line still breaks between words on a
     narrow screen rather than mid-word. */
  const words = children.split(" ");
  let index = 0;

  return (
    <h2
      ref={ref}
      className={`pop-title ${className}`.trim()}
      data-shown={shown}
      aria-label={children}
    >
      {/* A real space between the word spans. It used to be a ::after
          pseudo-element, whose `content` is not part of the document text —
          so this heading reached a crawler as "Howwework". Same fix and same
          reasoning as SectionTitle; see the longer note there. It has to sit
          between the spans rather than inside one, because leading whitespace
          inside an inline-block is trimmed. */}
      {words.map((word, w) => (
        <Fragment key={`${word}-${w}`}>
          {w > 0 ? " " : null}
          <span className="pop-title__word" aria-hidden="true">
          {[...word].map((ch, c) => (
            <span
              className="pop-title__ch"
              key={`${ch}-${c}`}
              /* Slower than SectionTitle's 28ms. The travel here is longer and
                 the easing overshoots, so a tight stagger turns the line into
                 one blurred lump instead of letters arriving in sequence. */
              style={{ transitionDelay: `${index++ * 46}ms` }}
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

export default PopTitle;
