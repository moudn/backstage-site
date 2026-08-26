/* Who the data controller actually is.
 *
 * ─────────────────────────────────────────────────────────────────────────
 *  The build fails while any of these is still UNSET — deliberately, and the
 *  guard stays even though they are all filled in now. A privacy notice that
 *  goes live reading "[LEGAL NAME]" is worse than not having one: it is a
 *  published admission that nobody checked, and under UK GDPR Article 13 the
 *  controller's identity and contact details are not optional fields.
 *
 *  A failed build takes thirty seconds to fix. A wrong privacy notice sits
 *  there for months.
 * ─────────────────────────────────────────────────────────────────────────
 */

const UNSET = "UNSET";

/** The legal entity, not the brand. If Backstage is not incorporated, this is
 *  your own name — a sole trader is still a data controller, and "Backstage
 *  Consultancy" alone is a trading name that identifies nobody in law.
 *
 *  Limited company:  "Backstage Consultancy Ltd"
 *  Sole trader:      "Mo Uddin, trading as Backstage Consultancy"
 */
export const LEGAL_NAME: string = "Mo Uddin, trading as Backstage Consultancy";

/** "limited company" | "sole trader" | "partnership" — drives one sentence of
 *  the notice, because a company has to publish its number and a sole trader
 *  does not. */
export const LEGAL_FORM: string = "sole trader";

/** Companies House number. Empty because a sole trader does not have one —
 *  the notice omits the line entirely rather than printing a blank field. */
export const COMPANY_NUMBER: string = "";

/** A postal address where correspondence reaches you.
 *
 *  This is the field people stall on, so: it does not have to be an office.
 *  A home address is lawful and extremely common for a new consultancy. If
 *  you would rather not publish where you live, a registered-office or
 *  business-address service costs roughly £30–50 a year and gives you an
 *  address you can put here and at Companies House.
 *
 *  What you cannot do is leave it out and hope. Article 13 requires the
 *  controller's contact details, and the ICO has taken enforcement action
 *  over notices that were vague about exactly this.
 *
 *  Use "\n" between lines. */
export const POSTAL_ADDRESS: string = "95 Oxford Road\nGloucester\nGL1 3EE";

/** ICO registration number, once you have paid the data protection fee.
 *  Set to "" until then — the notice omits the line rather than lying.
 *
 *  You almost certainly do need to register: you process prospects' personal
 *  data electronically for outbound marketing, which is not covered by any of
 *  the exemptions. Tier 1 is £52/year. Check at ico.org.uk/fee-checker. */
export const ICO_REGISTRATION: string = "";

/** Shown at the top and bottom of the notice. Update it when the notice
 *  changes — a privacy notice with no date is one nobody can rely on. */
export const POLICY_EFFECTIVE = "23 August 2026";

/** Called by the build. Throws rather than warns: warnings get scrolled past
 *  in CI logs, and this is the one file where shipping the default is a
 *  legal problem rather than a cosmetic one. */
export function assertLegalIdentityComplete() {
  const missing = Object.entries({
    LEGAL_NAME,
    LEGAL_FORM,
    COMPANY_NUMBER,
    POSTAL_ADDRESS,
    ICO_REGISTRATION,
  })
    .filter(([, v]) => v === UNSET)
    .map(([k]) => k);

  if (missing.length) {
    throw new Error(
      `\n\n  src/data/legal.ts still has placeholders: ${missing.join(", ")}.\n` +
        `  These appear verbatim in the published privacy notice, so the build\n` +
        `  stops here. Fill them in, or set the ones that genuinely do not apply\n` +
        `  to an empty string "" — that is a decision, UNSET is not.\n`
    );
  }
}

/** The processors named in the notice. Kept here because if one of these is
 *  ever swapped out, the notice is wrong the moment the change ships, and
 *  this is the file somebody will actually look at. */
export const PROCESSORS = [
  {
    name: "Cloudflare, Inc.",
    role: "Hosting, CDN and network security for this website.",
    data: "IP address, browser user-agent, requested URL and timestamp, in server logs.",
    where: "Served from the nearest edge location worldwide; company based in the USA.",
  },
  {
    name: "Namecheap, Inc. (Private Email)",
    role: "Our email. Anything you send to us is stored on their servers.",
    data: "Your name, email address and whatever the message contains.",
    where: "USA.",
  },
];
