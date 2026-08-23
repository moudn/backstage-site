/* Page copy, verbatim from Backstage.dc.html.
 *
 * The handoff's hard rules apply to anything edited here: invent nothing (no
 * clients, testimonials, logos or statistics), never call the offering a
 * tool/platform/software, plain English, British spelling, and never the
 * words "free trial".
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
  lines: ["Welcome to your new", "AI-powered world"] as [string, string],
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

export const JULIAN = {
  title: "Our products",
  eyebrow: "Our first product",
  heading: "You don't run Julian. Julian runs your outbound.",
  lede: "Julian is an AI sales agent that works your outbound the way a diligent junior would — one company at a time, in your name, from your own inbox. Priced by how many leads it works each month, with thirty days before anything is charged.",
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
  {
    n: "04",
    title: "Use it first",
    body: "Julian runs our own outreach. We do not sell anything we have not lived with ourselves.",
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
     nav. /privacy, not /privacy.html: the host serves the clean path, and
     public/_redirects makes that true regardless of host. */
  privacy: { href: "/privacy", label: "Privacy" },
};

export const NAV_LINKS: { href: string; label: string; strong?: boolean }[] = [
  { href: "#problem", label: "What we do" },
  { href: "#julian", label: "Our products" },
  { href: "#how", label: "How we work" },
  { href: "#contact", label: "Get in touch", strong: true },
];
