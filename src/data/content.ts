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
    "Tell us which process is eating your week. We build whatever fixes it, we run it and we hand back the finished work. Nobody at your end logs into anything.",
  primaryCta: "Tell us what's eating your week",
  secondaryCta: "See how we work",
};

export const PROBLEM = {
  title: "What we do",
  heading: "Being handed a tool is being handed more work.",
  body: [
    "Buy an AI platform and you have bought a rollout, a training plan, a licence renewal and somebody internal who now owns all three. Six months later the problem you started with is still yours. You just own some software as well.",
    "We do the opposite. You name the process. We build whatever fixes it, we keep it running and what comes back to you is the finished work.",
  ],
  pair: [
    { label: "What you get", value: "The output." },
    { label: "What you don't", value: "The machinery." },
  ],
};

/* The evidence section.
 *
 * Every figure here is UK government statistics or peer-reviewed research.
 * That choice is deliberate and worth defending, because the obvious
 * alternative is much easier to find: the "employees waste four and a half
 * hours a week on automatable tasks" genre of statistic. Every one of those
 * traces back to a company selling automation software — UiPath, Automation
 * Anywhere, Smartsheet, ProcessMaker — is self-reported, and publishes no
 * method. A consultancy quoting a vendor's marketing survey as evidence is
 * one search away from looking either careless or dishonest, and this page
 * has to survive being read by a sceptic.
 *
 * The sources:
 *
 *   MES  — ONS Management and Expectations Survey. About 55,000 UK
 *          businesses, fieldwork November 2023 to March 2024. Published by
 *          the ONS in March 2025 as "Management practices and the adoption of
 *          technology and artificial intelligence in UK firms, 2023".
 *   BICS — ONS Business Insights and Conditions Survey. The AI questions ran
 *          15 to 28 June 2026, published July 2026 as "Artificial
 *          intelligence in UK businesses: 2023 to 2026".
 *   DSIT — AI Adoption Research, for the Department for Science, Innovation
 *          and Technology. 3,500 UK business interviews by IFF Research and
 *          Technopolis Group, telephone fieldwork 12 February to 2 May 2025.
 *   QJE  — Brynjolfsson, Li and Raymond, "Generative AI at Work", Quarterly
 *          Journal of Economics 140(2), 2025, pp. 889–942. 5,179 customer
 *          support agents at a Fortune 500 software firm, about three million
 *          conversations, staggered rollout across 2020–21.
 *
 * Three things to hold on to if these are ever edited:
 *
 *  - The 75% is SELF-REPORTED. Businesses were asked whether AI had improved
 *    their productivity and three-quarters said yes; nobody measured their
 *    output. The detail line says so, and it has to keep saying so — that
 *    sentence is what stops a sceptic dismissing the whole card. The QJE
 *    figure in the same detail is the answer to that objection: 14% is a
 *    measured effect from a staggered rollout, not an opinion.
 *  - Do not restate the QJE result as something Backstage delivers. It is
 *    evidence that automating a real process produces a real gain, not a
 *    promise of 14% for anyone. The site does not promise numbers.
 *  - The denominators differ between surveys and between questions. 35% is
 *    businesses with ten or more employees; the all-business figure for the
 *    same question is 29%. Quoting one number with the other's population is
 *    the easiest mistake to make here.
 */
export const EVIDENCE = {
  title: "Why should you implement our services?",
  eyebrow: "UK government statistics · peer-reviewed research",
  heading: "The hard part was never the technology.",
  lede:
    "Adoption across UK business has roughly tripled in under three years. What has barely moved is how far anyone gets with it, and the thing firms say stops them is not the price or the skills.",
  /* Each stat carries its own source line. They are rendered on the page, not
     kept here for reference: a figure without a visible source is a claim. */
  stats: [
    {
      id: "barrier",
      value: 39,
      unit: "%",
      claim:
        "of UK firms said their biggest barrier to adopting AI was working out where it would actually help.",
      detail:
        "Ahead of cost at 21% and AI skills and expertise at 16%. More firms picked it than picked anything else.",
      source: "ONS, Management and Expectations Survey",
      population: "~55,000 UK businesses · fieldwork Nov 2023 to Mar 2024",
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
      population: "Fieldwork 15 to 28 June 2026",
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
      population: "Fieldwork 15 to 28 June 2026",
      chart: "waffle",
    },
    {
      id: "return",
      value: 75,
      unit: "%",
      claim:
        "of UK businesses that have adopted AI say it improved their productivity.",
      detail:
        "That figure is the businesses' own account of it, not a measurement. Where the effect has actually been measured, it holds up: a staggered rollout across 5,179 customer support agents lifted the number of issues resolved per hour by 14%, rising to 34% for the least experienced staff.",
      source: "DSIT AI Adoption Research · Brynjolfsson, Li & Raymond, QJE 2025",
      population: "3,500 UK businesses · fieldwork 12 Feb to 2 May 2025",
      chart: "share",
    },
  ],
  foot:
    "Nobody is short of things to automate. What they are short of is the time to work out which one is worth it and someone to keep it running afterwards. That is the job we do.",
} as const;

/* The calculator.
 *
 * A deliberate decision about the last slider, because it is the one that
 * makes this either honest or not. The obvious way to build this is to assert
 * a recovery rate — "60-70% recoverable with AI" — and multiply by it. Every
 * calculator of this kind on the internet does exactly that, and not one of
 * them can tell you where the number came from. Under the rule at the top of
 * this file it would be the worst kind of figure: unsourced, flattering, and
 * ours.
 *
 * So the share is a slider the reader sets, the label says it is their
 * estimate, and the result line says we would rather work the real number out
 * with them. That is more honest, and it is also better sales: a number
 * somebody chose themselves is a number they believe.
 *
 * On the 46 weeks. Multiplying by 52 assumes nobody takes a day off all year,
 * which overstates every result by about 12%. UK statutory minimum leave is
 * 5.6 weeks including bank holidays, so 46 working weeks is the conservative
 * figure, and the page says so rather than hiding it. Better to be the
 * calculator that under-claims.
 */
export const CALCULATOR = {
  /* The question the section has been building to. */
  lead: "So what does not automating it actually cost you?",
  intro:
    "Most businesses have never added this up. Move the sliders to the shape of your own team and see what a year of it comes to.",
  inputs: [
    {
      id: "people",
      label: "People doing the work",
      min: 1,
      max: 40,
      step: 1,
      initial: 4,
      prefix: "",
      suffix: "",
    },
    {
      id: "hours",
      label: "Hours each per week",
      min: 1,
      max: 30,
      step: 1,
      initial: 6,
      prefix: "",
      suffix: "h",
    },
    {
      id: "rate",
      label: "Average cost per hour",
      min: 12,
      max: 120,
      step: 1,
      initial: 32,
      prefix: "£",
      suffix: "",
    },
    {
      id: "share",
      label: "How much of it could run without a person",
      min: 0,
      max: 90,
      step: 5,
      initial: 55,
      prefix: "",
      suffix: "%",
      /* Rendered under the slider, so nobody can read the result as a promise. */
      note: "Your estimate, not our promise.",
    },
  ],
  /* Working weeks, not calendar weeks. See the note above. */
  weeksPerYear: 46,
  results: {
    hours: "Hours that go into it each week",
    year: "What that costs you a year",
    recover: "The part that need not be a person's job",
  },
  /* No price appears here on purpose. A calculator that ends in "and our
     package costs X, so you break even in month Y" is doing arithmetic on a
     number the reader never agreed to. This ends where the reader's own
     numbers end. */
  closing:
    "That is an estimate built from your figures, not a quote. The useful version of this conversation is the one where we look at the actual process and work out which part of it is worth handing over first.",
  cta: "Tell us what's eating your week",
  /* Shown small, beneath everything. The rigour is the point. */
  basis:
    "Calculated over 46 working weeks a year rather than 52, to allow for statutory leave and bank holidays.",
} as const;

export const JULIAN = {
  title: "Our products",
  eyebrow: "Our first product",
  heading: "You don't run Julian. Julian runs your outbound.",
  lede: "Julian is an AI sales agent that works your outbound the way a diligent junior would: one company at a time, in your name, from your own inbox. Priced by how many leads it works each month, with thirty days before anything is charged.",
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
    v: "One letter at a time, not a mail merge. Sent from your own Gmail, in your name.",
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
    body: 'Not "where could AI help" but where time and money are actually leaking this week. Usually it is something nobody has bothered to say out loud.',
  },
  {
    n: "02",
    title: "Build it, then run it",
    body: "Building is the easy half. We operate what we build, so adopting it costs your team nothing: no rollout, no training, no licence to renew.",
  },
  {
    n: "03",
    title: "Keep a human at every decision that matters",
    body: "Automation takes the repetitive middle. A person still makes the calls that carry consequences, and that person can be one of ours or one of yours.",
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
    body: "Going live is the middle, not the end. The process shifts, and something built once quietly stops fitting it. We keep adjusting what we run for you. Because what comes back is finished work rather than a dashboard, you can judge it yourself.",
  },
];

export const CONTACT = {
  title: "Get in touch",
  heading: "Tell us what's eating your week.",
  lede: "One process, in your own words. We'll come back to you and say whether it's something we can take off your hands.",
};

export const FOOTER = {
  line: "Backstage · AI consultancy · UK",
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

/* The questions section.
 *
 * This exists for two audiences and only one of them is human.
 *
 * The human one is straightforward: these are the questions that come up in
 * every first conversation, and answering them on the page saves both sides a
 * call.
 *
 * The other is the answer engines. robots.txt lets GPTBot, ClaudeBot and
 * PerplexityBot in on purpose — see the note in that file — and for a company
 * nobody is searching by name yet, being the thing an assistant quotes when
 * somebody asks it to explain UK AI consultancies is a more realistic route
 * to a first conversation than outranking Accenture. Those systems quote
 * prose that answers a question completely and in one place, which is why
 * these answers are a paragraph each rather than a line each.
 *
 * Note what this is NOT for. FAQ rich results — the expandable questions that
 * used to appear under a search listing — were narrowed to government and
 * health sites in 2023 and retired altogether on 7 May 2026. The FAQPage
 * schema built from this data buys no rich snippet and never will again. It
 * is here because it is still parsed for page understanding, and because the
 * answers themselves are indexable content aimed at questions people
 * genuinely type. If someone later proposes adding more schema "for the rich
 * results", that is the thing to check first.
 *
 * The usual rules apply and one is easy to break here: no invented clients.
 * "Most of our work is with UK businesses" would be a claim about a client
 * base, so the geography answer talks about where we are and what we know
 * rather than who we have worked for.
 */
export const FAQ = {
  title: "FAQ",
  heading: "The things people ask before the first call.",
  items: [
    {
      q: "What does an AI consultancy actually do?",
      a: "It depends entirely on which one you ask, and that is part of the problem. Some sell you a licence and a training plan. Some write a strategy document and leave. What we do is narrower and easier to check: you name a process that is eating your week, we work out whether automating it is worth doing at all, we build whatever fixes it and then we run it. What comes back to you is the finished work rather than something new to learn. If the honest answer is that a process is not worth automating yet, that is the answer you get, and it costs you nothing to have asked.",
    },
    {
      q: "What is the difference between an AI consultancy and an AI agency?",
      a: "In practice the two labels are used interchangeably and neither tells you much. The question worth asking instead is what you are left holding at the end. An engagement that finishes with a handover leaves you owning a system, its upkeep and whoever inside your business now understands it. An engagement that finishes with the work still being done for you leaves you owning the output and nothing else. We are the second kind. Ask any firm you are considering which of those two they are, and what happens in month seven. The answer separates them far faster than the word on the door does.",
    },
    {
      q: "Do we need anyone technical on our side?",
      a: "No. Nobody at your end logs into anything. That is not a convenience feature, it is the whole arrangement. The most common way an automation project quietly dies is being handed to somebody who already had a full-time job. We build it, we host it, we watch it and we fix it when it breaks. What we do need from you is somebody who understands the process well enough to describe how it really works, including the exceptions nobody has written down. We also need somebody with the authority to sign off the decisions that should have a person behind them.",
    },
    {
      q: "How is this different from buying an AI platform?",
      a: "Buying one gets you a licence, a rollout, a training plan, a renewal date and an internal owner for all four. Six months later the problem you started with is still yours, and now you have a subscription as well. The difference is where the work sits. We do not hand you the machinery and wish you luck with it; we keep the machinery and hand you what comes out of it. If we stop being worth what we cost, you stop paying us, and you have not built a department around something you would then have to unwind.",
    },
    {
      q: "What kinds of process are worth automating first?",
      a: "The dull, frequent ones that follow rules somebody could write down if they sat and thought about it. Volume matters more than complexity: a fiddly thing done twice a year is rarely worth it, a dull thing done forty times a week usually is. The strongest candidates tend to involve moving information between systems that do not talk to each other, chasing people for things or producing the same document from the same inputs. The weak ones are where the judgement is the job. If you are not sure which yours is, that is exactly the conversation to have. Working it out is the part most businesses never find time for.",
    },
    {
      q: "What does it cost?",
      a: "It depends on the process, and we would rather say so than publish a number that turns out not to apply to you. What we can tell you is how it gets decided. We look at the actual process first, work out what a year of doing it by hand costs you and only then talk about price. If the second number is not comfortably smaller than the first, there is no good reason to do any of it. Julian, our AI sales agent, is the one thing with a fixed shape: it is priced by how many leads it works each month, with thirty days before anything is charged.",
    },
    {
      q: "Do you work with businesses outside the UK?",
      a: "We are UK-based, and this site is written for UK businesses because that is where we are and whose rules we know best: UK GDPR, how payroll and invoicing actually run here, the same working day. None of that prevents us working elsewhere, and North America overlaps enough on language and working hours to make that straightforward. What we will not do is take on a process governed by rules we do not know well and learn them at your expense. If that is the situation, we will say so before you have spent anything.",
    },
  ],
} as const;

export const NAV_LINKS: { href: string; label: string; strong?: boolean }[] = [
  { href: "#problem", label: "What we do" },
  /* The section's own title is the full question, "Why should you implement
     our services?". The nav gets the short form — the bar is horizontal and
     five items wide, and a nine-word link would push the row into wrapping. */
  { href: "#evidence", label: "Why us" },
  { href: "#julian", label: "Our products" },
  { href: "#how", label: "How we work" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Get in touch", strong: true },
];
