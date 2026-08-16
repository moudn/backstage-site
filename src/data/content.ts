/* Page copy, verbatim from Backstage.dc.html.
 *
 * The handoff's hard rules apply to anything edited here: invent nothing (no
 * clients, testimonials, logos or statistics), never call the offering a
 * tool/platform/software, plain English, British spelling, and never the
 * words "free trial". */

export const CONTACT_EMAIL = "hello@backstageconsultancy.com";

/* Not live yet — the page carries a "Going live shortly." note beneath it.
   Remove the note, or gate the link, once Julian's site ships. */
export const JULIAN_URL = "https://julian.backstageconsultancy.com";

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

export const NAV_LINKS: { href: string; label: string; strong?: boolean }[] = [
  { href: "#problem", label: "What we do" },
  { href: "#julian", label: "Our products" },
  { href: "#how", label: "How we work" },
  { href: "#contact", label: "Get in touch", strong: true },
];
