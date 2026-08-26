/* The questions.
 *
 * Native <details> and <summary>, not a hand-built accordion. The reasons are
 * the same ones that made the calculator use a real range input: open and
 * close by keyboard, correct announcement to a screen reader, and — the part
 * that matters here specifically — find-in-page reaches text inside a closed
 * <details> and the browser opens it to show the match. A div-based accordion
 * that unmounts its answer breaks that, and breaks it silently.
 *
 * It also settles the crawler question. Every answer is in the document at
 * load, open or shut. Nothing here depends on an interaction happening first,
 * so there is no version of this page where the text exists for people and
 * not for the things reading it.
 *
 * No height animation. Animating a <details> to its content height means
 * intercepting the toggle, holding the element open, measuring, and animating
 * it shut yourself — which is most of the way back to reimplementing the
 * control this is deliberately not reimplementing. The answer fades and rises
 * a few pixels instead, which reads as deliberate rather than as missing.
 */

import { FAQ } from "../data/content";
import "./Faq.css";

export function Faq() {
  return (
    <ul className="faq__list">
      {FAQ.items.map((item) => (
        <li className="faq__item" key={item.q}>
          <details className="faq__d">
            <summary className="faq__q">
              <span className="faq__q-text">{item.q}</span>
              {/* A plus that becomes a minus: two bars, one of which turns.
                  aria-hidden because <summary> already announces its own
                  expanded state — the mark is a picture of that, not a
                  second source of it. */}
              <span className="faq__mark" aria-hidden="true" />
            </summary>
            <div className="faq__a">
              <p>{item.a}</p>
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}

export default Faq;
