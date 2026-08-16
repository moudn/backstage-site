/* Everything below the two full-screen sections. Copy and structure carried
 * over from Backstage.dc.html; see src/data/content.ts for the hard rules
 * that govern edits to any of this wording.
 *
 * On the scroll reveal: ScrollReveal is used for the big text moments —
 * section headings and lead paragraphs — where a word-by-word reveal reads as
 * deliberate. The structured lists (Julian's rows) get a plain fade-up
 * instead. Word-splitting a five-item reference table makes it harder to
 * read, not more impressive, and constant motion across a page of detail is
 * tiring.
 *
 * "How we work" is no longer a grid of four cards; it is StepSequence, a held
 * section the reader advances through.
 */

import { Reveal } from "./Reveal";
import { ScrollReveal } from "./ScrollReveal";
import { SectionTitle } from "./SectionTitle";
import { StepSequence } from "./StepSequence";
import { CONTACT_EMAIL, JULIAN_ROWS, JULIAN_URL } from "../data/content";
import "../styles/page.css";
import "../styles/panels.css";

export function PageBody() {
  return (
    <div className="page">
      <div className="aurora" aria-hidden="true" />
      <div className="aurora-veil" aria-hidden="true" />

      <div className="shell">
        <main id="top">
          <section className="panel intro">
            <Reveal>
              <p className="eyebrow">AI consultancy · UK</p>
            </Reveal>
            <ScrollReveal mode="scrub" className="intro__opening" baseRotation={2}>
              Tell us which process is eating your week. We build whatever fixes it, we run
              it, and we hand back the finished work. Nobody at your end logs into anything.
            </ScrollReveal>
            <Reveal delay={120}>
              <div className="intro__actions">
                <a className="btn-pill" href="#contact">
                  Tell us what's eating your week
                </a>
                <a className="link-rule" href="#how">
                  See how we work
                </a>
              </div>
            </Reveal>
          </section>

          <section id="problem" className="panel section">
            <SectionTitle>What we do</SectionTitle>
            <div className="split">
              <ScrollReveal mode="scrub" as="h2" className="h2" baseRotation={2}>
                Being handed a tool is being handed more work.
              </ScrollReveal>
              <div>
              <ScrollReveal mode="scrub" className="body-copy" textClassName="mb-18">
                Buy an AI platform and you have bought a rollout, a training plan, a licence
                renewal, and somebody internal who now owns all three. Six months later the
                problem you started with is still yours. You just own some software as well.
              </ScrollReveal>
              <ScrollReveal mode="scrub" className="body-copy body-copy--spaced">
                We do the opposite. You name the process. We build whatever fixes it, we keep
                it running, and what comes back to you is the finished work.
              </ScrollReveal>
              <Reveal delay={80}>
                <div className="problem__pair">
                  <div className="problem__cell">
                    <p className="problem__label">What you get</p>
                    <p className="problem__value">The output.</p>
                  </div>
                  <div className="problem__cell">
                    <p className="problem__label">What you don't</p>
                    <p className="problem__value">The machinery.</p>
                  </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          <section id="julian" className="panel panel--tall section">
            <SectionTitle>Our products</SectionTitle>
            <div className="split">
              <div>
                <Reveal>
                  <p className="eyebrow">Our first product</p>
                </Reveal>
                <ScrollReveal mode="scrub" as="h2" className="h2" baseRotation={2}>
                  You don't run Julian. Julian runs your outbound.
                </ScrollReveal>
                <ScrollReveal mode="scrub" className="julian__lede">
                  Julian is an AI sales agent that works your outbound the way a diligent
                  junior would — one company at a time, in your name, from your own inbox.
                  Priced by how many leads it works each month, with thirty days before
                  anything is charged.
                </ScrollReveal>
                <Reveal delay={120}>
                  <div>
                    <a className="julian__link" href={JULIAN_URL}>
                      Julian's own site
                      <span
                        aria-hidden="true"
                        style={{ font: "400 11px/1 ui-monospace,Menlo,monospace", color: "var(--text-3)" }}
                      >
                        ↗
                      </span>
                    </a>
                    {/* Remove once Julian's site is live. */}
                    <p className="julian__note">Going live shortly.</p>
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
          </section>

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
          <section id="contact" className="panel contact">
            <SectionTitle>Get in touch</SectionTitle>
            <ScrollReveal mode="scrub" as="h2" className="contact__title" baseRotation={2}>
              Tell us what's eating your week.
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
              One process, in your own words. We'll come back to you and say whether it's
              something we can take off your hands.
            </ScrollReveal>
          </section>
        </main>

        <footer className="footer">
          <span>Backstage — AI consultancy · UK</span>
          <span className="footer__meta">
            <span>Est. 2026</span>
            <span>© {new Date().getFullYear()} Backstage Consultancy</span>
          </span>
        </footer>
      </div>
    </div>
  );
}

export default PageBody;
