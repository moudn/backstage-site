/* /cost-calculator — the calculator on a page of its own.
 *
 * Deliberately lean. It does not mount the WebGL jellyfish, the fluid cursor,
 * Lenis or the scroll sequence, because somebody arriving here came for the
 * sliders and everything else is weight between them and it. The ambient field
 * stays so the page still looks like the rest of the site.
 *
 * It also does not reuse SiteNav. That component reads NAV_LINKS, which is a
 * list of anchors into the homepage's sections, and every one of them would be
 * a dead link here. A small header with one real link back is better than a
 * full navigation bar where six of seven items go nowhere.
 */

import { AmbientField } from "./AmbientField";
import { Calculator } from "./Calculator";
import { ThemeToggle } from "./ThemeToggle";
import { CALC_PAGE, CONTACT_EMAIL } from "../data/content";
import { useTheme } from "../lib/useTheme";
import "../styles/page.css";
import "../styles/chrome.css";
import "./CalculatorPage.css";

export function CalculatorPage() {
  const { theme, toggle } = useTheme();

  return (
    <>
      <AmbientField />

      <header className="cp__bar">
        <a className="cp__home" href="/">
          <span className="cp__dot" aria-hidden="true" />
          <span className="cp__brand">{CALC_PAGE.homeLabel}</span>
          <span className="cp__hint">{CALC_PAGE.homeHint}</span>
        </a>
        <ThemeToggle theme={theme} onToggle={toggle} />
      </header>

      <main className="cp">
        <p className="eyebrow">{CALC_PAGE.eyebrow}</p>
        <h1 className="cp__h1">{CALC_PAGE.h1}</h1>
        <p className="cp__lede">{CALC_PAGE.lede}</p>

        <Calculator />

        {/* The prose below is why this page exists as something other than a
            copy of a homepage section: it is the reasoning, which the homepage
            has no room for and which is the part worth linking to. */}
        <div className="cp__notes">
          {CALC_PAGE.sections.map((sec) => (
            <section className="cp__note" key={sec.title}>
              <h2 className="cp__h2">{sec.title}</h2>
              {sec.body.map((para) => (
                <p key={para}>{para}</p>
              ))}
            </section>
          ))}
        </div>

        <div className="cp__close">
          <span className="btn-chrome">
            <a className="btn-pill" href={`mailto:${CONTACT_EMAIL}`}>
              {CALC_PAGE.cta}
            </a>
          </span>
          <a className="cp__back" href="/">
            Back to the site
          </a>
        </div>
      </main>
    </>
  );
}

export default CalculatorPage;
