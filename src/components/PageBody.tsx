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
 * section the reader advances through. It behaves under both scroll modes.
 */

import { ContactForm } from "./ContactForm";
import { Reveal } from "./Reveal";
import { ScrollReveal } from "./ScrollReveal";
import { StepSequence } from "./StepSequence";
import { CONTACT_EMAIL, JULIAN_ROWS, JULIAN_URL } from "../data/content";
import { DEFAULT_SCROLL_MODE, type ScrollMode } from "../lib/scrollMode";
import "../styles/page.css";
import "../styles/panels.css";

export function PageBody({ mode = DEFAULT_SCROLL_MODE }: { mode?: ScrollMode }) {
  /* Snap mode gives a heading no gradual scroll to scrub against — the panel
     arrives all at once — so the reveal plays on entry instead. Cinematic
     mode scrolls continuously, which is what scrubbing was designed for. */
  const revealMode = mode === "cinematic" ? "scrub" : "enter";

  return (
    <div className="page">
      <div className="aurora" aria-hidden="true" />
      <div className="aurora-veil" aria-hidden="true" />

      <div className="shell">
        <main id="top">
          <section className="panel intro">
            <Reveal>
              <p className="eyebrow">AI consultancy · Gloucester, UK</p>
            </Reveal>
            <ScrollReveal mode={revealMode} as="h2" className="intro__title" baseRotation={2}>
              We work backstage, so you can be on stage.
            </ScrollReveal>
            <ScrollReveal mode={revealMode} className="intro__lede" baseRotation={1.5}>
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

          <section id="problem" className="panel section split">
            <ScrollReveal mode={revealMode} as="h2" className="h2" baseRotation={2}>
              Being handed a tool is being handed more work.
            </ScrollReveal>
            <div>
              <ScrollReveal mode={revealMode} className="body-copy" textClassName="mb-18">
                Buy an AI platform and you have bought a rollout, a training plan, a licence
                renewal, and somebody internal who now owns all three. Six months later the
                problem you started with is still yours. You just own some software as well.
              </ScrollReveal>
              <ScrollReveal mode={revealMode} className="body-copy body-copy--spaced">
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
          </section>

          <section id="julian" className="panel panel--tall section">
            <div className="split">
              <div>
                <Reveal>
                  <p className="eyebrow">Our first product</p>
                </Reveal>
                <ScrollReveal mode={revealMode} as="h2" className="h2" baseRotation={2}>
                  You don't run Julian. Julian runs your outbound.
                </ScrollReveal>
                <ScrollReveal mode={revealMode} className="julian__lede">
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
              that manages its own height and its own snap targets, and a
              section's vertical padding would put the sticky stage out of
              register with them. */}
          <section id="how" className="how">
            <StepSequence />
          </section>

          <section className="panel section">
            <Reveal>
              <div className="offer">
                <div className="offer__aurora" aria-hidden="true" />
                <div className="offer__inner">
                  <p className="eyebrow">The offer</p>
                  <ScrollReveal mode={revealMode} as="h2" className="h2" baseRotation={2}>
                    We'd do the first one at our cost.
                  </ScrollReveal>
                  <ScrollReveal mode={revealMode} className="body-copy">
                    Pick the process that annoys you most. We'll take it on and carry the cost
                    of the first one ourselves, because it is a great deal easier to show you
                    this than to describe it. If it works, we'll talk about the next one. If it
                    doesn't, you've lost nothing and we've learned something.
                  </ScrollReveal>
                </div>
              </div>
            </Reveal>
          </section>

          <section id="contact" className="panel panel--tall contact">
            <div>
              <ScrollReveal mode={revealMode} as="h2" className="contact__title" baseRotation={2}>
                Tell us what's eating your week.
              </ScrollReveal>
              <ScrollReveal mode={revealMode} className="contact__lede">
                One process, in your own words. We'll come back to you and say whether it's
                something we can take off your hands.
              </ScrollReveal>
              <Reveal delay={100}>
                <a className="contact__email" href={`mailto:${CONTACT_EMAIL}`}>
                  {CONTACT_EMAIL}
                </a>
              </Reveal>
            </div>
            <Reveal delay={140}>
              <ContactForm />
            </Reveal>
          </section>
        </main>

        <footer className="footer">
          <span>Backstage — Gloucester, UK</span>
          <span>© {new Date().getFullYear()} Backstage Consultancy</span>
        </footer>
      </div>
    </div>
  );
}

export default PageBody;
