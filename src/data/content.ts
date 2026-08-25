/* Page copy, verbatim from Backstage.dc.html.
 *
 * The handoff's hard rules apply to anything edited here: invent nothing (no
 * clients, testimonials or logos), never call the offering a
 * tool/platform/software, plain English, British spelling, and never the
 * words "free trial".
 *
 * On statistics, the rule changed and the new one is stricter, not looser.
 * It used to be "no statistics" full stop. EVIDENCE below now carries some,
 * so the rule is: every figure must come from a named primary source, with
 * the population and the fieldwork dates stated, and the source must be
 * visible to the reader on the page. No vendor marketing surveys — the
 * "office workers waste N hours a week" genre is all published by companies
 * selling automation, self-reported, with undisclosed method, and a prospect
 * who checks will find that out. If a figure cannot be sourced to that
 * standard it does not go on the site.
 *
 * Everything the page says lives in this file, including the hero lines and
 * the slogan. That is not tidiness for its own sake: `vite.config.ts` imports
 * this module at build time and renders a static copy of the page into
 * index.html for crawlers that do not run JavaScript. Copy left inline in a
 * component would render for people and be invisible to them, and the two
 * would drift apart silently. If you add page text, add it here.
 */

export const CONTACT_EMAIL = "hello@backstageconsultancy.com";

/* Not live yet — the page carries a "Going live shortly." note beneath it.
   Remove the note, or gate the link, once Julian's site ships. */
export const JULIAN_URL = "https://julian.backstageconsultancy.com";

export const HERO = {
  eyebrow: "Backstage · AI consultancy · UK",
  /* Three lines, each shorter than the one above, so the headline tapers to a
     point: "Welcome to your new" / "AI-powered" / "world". The taper is the
     shape — do not reflow these into two lines or rebalance them by word
     count, and note that `text-wrap: balance` is deliberately off on the
     title for the same reason. */
  lines: ["Welcome to your new", "AI-powered", "world"] as [string, string, string],
};

export const SLOGAN = "We work backstage, so you can take centre stage.";

export const INTRO = {
  eyebrow: "AI consultancy · UK",
  opening:
    "Tell us which process is eating your week. We build whatever fixes it, we run it, and we hand back the finished work. Nobody at your end logs into anything.",
  primaryCta: "Tell us what's eating your week",
  secondaryCta: "See how we work",
};

export const PROBLEM = {
  title: "What we do",
  heading: "Being handed a tool is being handed more work.",
  body: [
    "Buy an AI platform and you have bought a rollout, a training plan, a licence renewal, and somebody internal who now owns all three. Six months later the problem you started with is still yours. You just own some software as well.",
    "We do the opposite. You name the process. We build whatever fixes it, we keep it running, and what comes back to you is the finished work.",
  ],
  pair: [
    { label: "What you get", value: "The output." },
    { label: "What you don't", value: "The machinery." },
  ],
};

/* The evidence section.
 *
 * Every figure here is UK official statistics, from two Office for National
 * Statistics surveys. That choice is deliberate and worth defending, because
 * the obvious alternative is much easier to find: the "employees waste four
 * and a half hours a week on automatable tasks" genre of statistic. Every one
 * of those traces back to a company selling automation software — UiPath,
 * Automation Anywhere, Smartsheet, ProcessMaker — is self-reported, and
 * publishes no method. A consultancy quoting a vendor's marketing survey as
 * evidence is one search away from looking either careless or dishonest, and
 * this page has to survive being read by a sceptic.
 *
 * The two sources:
 *
 *   MES  — Management and Expectations Survey. About 55,000 UK businesses,
 *          fieldwork November 2023 to March 2024. Published by the ONS in
 *          March 2025 as "Management practices and the adoption of technology
 *          and artificial intelligence in UK firms, 2023".
 *   BICS — Business Insights and Conditions Survey. The AI questions ran
 *          15 to 28 June 2026, published July 2026 as "Artificial
 *          intelligence in UK businesses: 2023 to 2026".
 *
 * Two things to hold on to if these are ever edited:
 *
 *  - The 19% is an ASSOCIATION, not a cause. The ONS controlled for
 *    management practice scores and firm characteristics; it did not show
 *    that adopting technology raises turnover. The copy says "associated
 *    with" and it has to keep saying that.
 *  - The denominators differ between the two surveys and between questions.
 *    35% is businesses with ten or more employees; the all-business figure
 *    for the same question is 29%. Quoting one number with the other's
 *    population is the easiest mistake to make here.
 */
export const EVIDENCE = {
  title: "The numbers",
  eyebrow: "UK businesses · Office for National Statistics",
  heading: "The hard part was never the technology.",
  lede:
    "Adoption across UK business has roughly tripled in under three years. What has barely moved is how far anyone gets with it — and the thing firms say stops them is not the price or the skills.",
  /* Each stat carries its own source line. They are rendered on the page, not
     kept here for reference: a figure without a visible source is a claim. */
  stats: [
    {
      id: "barrier",
      value: 39,
      unit: "%",
      claim:
        "of UK firms named working out where it would actually help as their biggest barrier to adopting AI.",
      detail:
        "Ahead of cost, at 21%, and the level of AI expertise and skills, at 16%. The most common answer of any given.",
      source: "ONS, Management and Expectations Survey",
      population: "~55,000 UK businesses · fieldwork Nov 2023 – Mar 2024",
      chart: "bars",
    },
    {
      id: "adoption",
      value: 35,
      unit: "%",
      claim:
        "of UK businesses with ten or more employees now use at least one AI technology.",
      detail:
        "Up from around 12% in late 2023. Across businesses of every size the figure is 29%; among those with 250 or more employees it is 49%.",
      source: "ONS, Business Insights and Conditions Survey",
      population: "Fieldwork 15 – 28 June 2026",
      chart: "rise",
    },
    {
      id: "depth",
      value: 10,
      unit: "%",
      claim:
        "of the businesses that have adopted AI describe their own use of it as extensive.",
      detail:
        "The average adopter uses about 1.6 of the technologies surveyed, up from about 1.4 in late 2023. Adoption has widened much faster than it has deepened.",
      source: "ONS, Business Insights and Conditions Survey",
      population: "Fieldwork 15 – 28 June 2026",
      chart: "waffle",
    },
    {
      id: "return",
      value: 19,
      unit: "%",
      claim:
        "higher turnover per worker is associated with firms that had adopted new technology.",
      detail:
        "After controlling for management practice scores and firm characteristics. An association measured across firms, not proof that adopting technology causes the difference.",
      source: "ONS, Management and Expectations Survey",
      population: "~55,000 UK businesses · fieldwork Nov 2023 – Mar 2024",
      chart: "compare",
    },
  ],
  foot:
    "Nobody is short of things to automate. What they are short of is the time to work out which one is worth it, and someone to keep it running afterwards. That is the job we do.",
} as const;

export const JULIAN = {
  title: "Our products",
  eyebrow: "Our first product",
  heading: "You don't run Julian. Julian runs your outbound.",
  lede: "Julian is an AI sales agent that works your outbound the way a diligent junior would — one company at a time, in your name, from your own inbox. Priced by how many leads it works each month, with thirty days before anything is charged.",
  /* Moved here from step 04 of "How we work", which used to be "Use it
     first". It was the only step in that sequence naming a product, and the
     sequence is about method — but the claim itself is worth keeping and this
     is where it belongs: next to the product it is actually about.

     It is set apart from the lede rather than folded into it because it is a
     different kind of statement. The lede describes what Julian does; this is
     the one line on the page vouching for it, and it is only worth anything
     while it stays literally true. If Julian ever stops running our outbound,
     delete it. */
  ourOwn:
    "Julian runs our own outreach. We do not sell anything we have not lived with ourselves.",
  linkLabel: "Julian's own site",
  note: "Going live shortly.",
};

export const JULIAN_ROWS: { k: string; v: string }[] = [
  { k: "Research", v: "Reads each company before writing a word to it." },
  {
    k: "Writes individually",
    v: "One letter at a time, not a mail merge — sent from your own Gmail, in your name.",
  },
  { k: "Follows up", v: "A fixed cadence: day 0, day 3, day 7, day 12. Then it stops." },
  { k: "Triages replies", v: "Sorts the interested from the polite no from the out-of-office." },
  { k: "Asks before booking", v: "A person approves every meeting before it goes in the diary." },
];

export const HOW_TITLE = "How we work";

export const STEPS: { n: string; title: string; body: string }[] = [
  {
    n: "01",
    title: "Find the real bottleneck",
    body: 'Not "where could AI help" — where time and money are actually leaking this week. Usually it is something nobody has bothered to say out loud.',
  },
  {
    n: "02",
    title: "Build it, then run it",
    body: "Building is the easy half. We operate what we build, so adopting it costs your team nothing: no rollout, no training, no licence to renew.",
  },
  {
    n: "03",
    title: "Keep a human at every decision that matters",
    body: "Automation takes the repetitive middle. A person still makes the calls that carry consequences — and that person can be one of ours or one of yours.",
  },
  /* Was "Use it first" — Julian runs our own outreach, we don't sell what we
     haven't lived with. Replaced for two reasons: it was the only step that
     named a product, in a section about method rather than catalogue; and it
     sat next to an offer made to early clients that is not going to be
     extended to everyone, so leaving it there implied a promise.

     What replaced it deliberately makes no commercial commitment. "You can
     judge it yourself" is a statement about what the work looks like — the
     finished output, not a dashboard — not an undertaking about notice
     periods or refunds. If a walk-away guarantee is ever offered in writing,
     it belongs in terms, not in a step describing how the work is done. */
  {
    n: "04",
    title: "Keep it earning its place",
    body: "Going live is the middle, not the end. The process shifts, and something built once quietly stops fitting it. We keep adjusting what we run for you — and because what comes back is finished work rather than a dashboard, you can judge it yourself.",
  },
];

export const CONTACT = {
  title: "Get in touch",
  heading: "Tell us what's eating your week.",
  lede: "One process, in your own words. We'll come back to you and say whether it's something we can take off your hands.",
};

export const FOOTER = {
  line: "Backstage — AI consultancy · UK",
  est: "Est. 2026",
  /* Deliberately in the footer and nowhere else. A privacy notice has to be
     easy to find, which the footer satisfies — it is the first place anybody
     looks for one — but it is not a thing to sell, so it stays out of the
     nav. /privacy, not /privacy.html: Workers' default html_handling serves
     the clean path and 301s the .html form to it. Do not "help" that with a
     _redirects rewrite — pointing /privacy back at /privacy.html makes the
     two rules chase each other and the page dies in a redirect loop. */
  privacy: { href: "/privacy", label: "Privacy" },
};

export const NAV_LINKS: { href: string; label: string; strong?: boolean }[] = [
  { href: "#problem", label: "What we do" },
  { href: "#evidence", label: "The numbers" },
  { href: "#julian", label: "Our products" },
  { href: "#how", label: "How we work" },
  { href: "#contact", label: "Get in touch", strong: true },
];
