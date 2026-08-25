/* Everything below the two full-screen sections. All copy comes from
 * src/data/content.ts — see the note at the top of that file for why none of
 * it is inline here, and for the hard rules that govern edits to any of it.
 *
 * On the scroll reveal: ScrollReveal is used for the big text moments —
 * section headings and lead paragraphs — where a word-by-word reveal reads as
 * deliberate. The structured lists (Julian's rows) get a plain fade-up
 * instead. Word-splitting a five-item reference table makes it harder to
 * read, not more impressive, and constant motion across a page of detail is
 * tiring.
 *
 * Heading levels: GlowHorizon owns the h1 and the jellyfish slogan is the
 * first h2. Each section's big centred label (SectionTitle) is the h2 that
 * opens it, and the sentence beneath is an h3 — so the outline matches what
 * the page looks like, which is what both a screen reader and a crawler walk.
 *
 * "How we work" is no longer a grid of four cards; it is StepSequence, a held
 * section the reader advances through.
 */

import { DriftSection } from "./DriftSection";
import { FooterCrowd } from "./FooterCrowd";
import { Reveal } from "./Reveal";
import { ScrollReveal } from "./ScrollReveal";
import { SectionTitle } from "./SectionTitle";
import { StepSequence } from "./StepSequence";
import {
  CONTACT,
  CONTACT_EMAIL,
  FOOTER,
  INTRO,
  JULIAN,
  JULIAN_ROWS,
  JULIAN_URL,
  PROBLEM,
} from "../data/content";
import "../styles/page.css";
import "../styles/chrome.css";
import "../styles/panels.css";

export function PageBody() {
  return (
    <div className="page">
      {/* The .aurora and .aurora-veil pair that used to sit here is gone. It
          was an absolutely positioned 120vh band, so it lit the first screen
          and a half and left the rest of the page flat; AmbientField is fixed
          and covers all of it. */}
      <div className="shell">
        <main id="top">
          <DriftSection className="panel intro">
            <Reveal>
              <p className="eyebrow">{INTRO.eyebrow}</p>
            </Reveal>
            <ScrollReveal mode="scrub" className="intro__opening" baseRotation={2}>
              {INTRO.opening}
            </ScrollReveal>
            <Reveal delay={120}>
              <div className="intro__actions">
                {/* The chrome ring is a wrapper because it is drawn on two
                    pseudo-elements behind the pill — see chrome.css. */}
                <span className="btn-chrome">
                  <a className="btn-pill" href="#contact">
                    {INTRO.primaryCta}
                  </a>
                </span>
                <a className="link-rule" href="#how">
                  {INTRO.secondaryCta}
                </a>
              </div>
            </Reveal>
          </DriftSection>

          <DriftSection id="problem" className="panel section">
            <SectionTitle>{PROBLEM.title}</SectionTitle>
            <div className="split">
              <ScrollReveal mode="scrub" as="h3" className="h2" baseRotation={2}>
                {PROBLEM.heading}
              </ScrollReveal>
              <div>
                <ScrollReveal mode="scrub" className="body-copy" textClassName="mb-18">
                  {PROBLEM.body[0]}
                </ScrollReveal>
                <ScrollReveal mode="scrub" className="body-copy body-copy--spaced">
                  {PROBLEM.body[1]}
                </ScrollReveal>
                <Reveal delay={80}>
                  <div className="problem__pair">
                    {PROBLEM.pair.map((cell) => (
                      <div className="problem__cell" key={cell.label}>
                        <p className="problem__label">{cell.label}</p>
                        <p className="problem__value">{cell.value}</p>
                      </div>
                    ))}
                  </div>
                </Reveal>
              </div>
            </div>
          </DriftSection>

          <DriftSection id="julian" className="panel panel--tall section">
            <SectionTitle>{JULIAN.title}</SectionTitle>
            <div className="split">
              <div>
                <Reveal>
                  <p className="eyebrow">{JULIAN.eyebrow}</p>
                </Reveal>
                <ScrollReveal mode="scrub" as="h3" className="h2" baseRotation={2}>
                  {JULIAN.heading}
                </ScrollReveal>
                <ScrollReveal mode="scrub" className="julian__lede">
                  {JULIAN.lede}
                </ScrollReveal>
                {/* Set apart from the lede: the paragraph above describes the
                    product, this vouches for it. A plain fade rather than the
                    word-by-word reveal — one short claim read one word at a
                    time turns a statement of fact into a flourish. */}
                <Reveal delay={100}>
                  <p className="julian__proof">{JULIAN.ourOwn}</p>
                </Reveal>
                <Reveal delay={120}>
                  <div>
                    <a className="julian__link" href={JULIAN_URL}>
                      {JULIAN.linkLabel}
                      <span
                        aria-hidden="true"
                        style={{ font: "400 11px/1 ui-monospace,Menlo,monospace", color: "var(--text-3)" }}
                      >
                        ↗
                      </span>
                    </a>
                    {/* Remove once Julian's site is live. */}
                    <p className="julian__note">{JULIAN.note}</p>
                  </div>
                </Reveal>
              </div>

              <ul className="julian__rows">
                {JULIAN_ROWS.map((row, i) => (
                  <Reveal key={row.k} as="li" className="julian__row" delay={i * 70}>
                    <p className="julian__key">{row.k}</p>
                    <p className="julian__val">{row.v}</p>
                  </Reveal>
                ))}
              </ul>
            </div>
          </DriftSection>

          {/* No .panel / .section here: the sequence is a tall scroll region
              that manages its own height, and a section's vertical padding
              would put the sticky stage out of register with it. */}
          <section id="how" className="how">
            <StepSequence />
          </section>

          {/* One address, set large, and nothing to fill in. A form asks
              somebody to compose their problem in a textarea on a stranger's
              website; an address lets them write it where they already write
              everything else, from an account we can actually reply from. */}
          <DriftSection id="contact" className="panel contact">
            <SectionTitle>{CONTACT.title}</SectionTitle>
            <ScrollReveal mode="scrub" as="h3" className="contact__title" baseRotation={2}>
              {CONTACT.heading}
            </ScrollReveal>
            {/* The address is the call to action, so it is the largest and
                heaviest thing on the screen — the arrangement the reference
                uses, where the address *is* the contact page. */}
            <Reveal delay={80}>
              <a className="contact__email" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
            </Reveal>
            <ScrollReveal mode="scrub" className="contact__lede">
              {CONTACT.lede}
            </ScrollReveal>
          </DriftSection>
        </main>

        {/* The crowd is positioned against this element, so the footer is the
            containing block — hence position: relative in the CSS. It is also
            why the hover rules for the crowd key off .footer rather than the
            crowd itself: the whole footer is the hover target, not a band of
            silhouettes the pointer has to find. */}
        <footer className="footer">
          <FooterCrowd />
          <span className="footer__brand">{FOOTER.line}</span>
          <span className="footer__meta">
            <span>{FOOTER.est}</span>
            <a className="footer__link" href={FOOTER.privacy.href}>
              {FOOTER.privacy.label}
            </a>
            <span>© {new Date().getFullYear()} Backstage Consultancy</span>
          </span>
        </footer>
      </div>
    </div>
  );
}

export default PageBody;
