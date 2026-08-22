# Backstage — website

Vite + React + TypeScript. The 3D jellyfish needs `three` and
`@react-three/fiber`, which is why this is a build rather than a single HTML
file — three.js alone is ~890KB and cannot sensibly be inlined.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/, plain static files
```

## Deploying

The site is hosted on **Cloudflare Pages**, connected to this repository:
every push to `main` builds and deploys. Set these in the Pages project's
build configuration — deliberately *not* in a `wrangler.toml`, because when
that file is present Pages reads its project settings from it and a mismatch
between the `name` there and the real project name fails the build:

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | `22` (also in `.nvmrc`) |

`public/_headers` is read from the build output and sets the caching. The
fingerprinted files under `/assets` and the `.woff2` fonts are immutable and
cached for a year; `index.html` is `must-revalidate`, because it is what
points at the hashed assets and a stale copy makes a deploy look like it
never happened.

`base` in `vite.config.ts` is `'/'`, not `'./'`. The site is served from the
root of its own domain, and relative paths break `404.html` specifically: the
host serves that page for *any* unrecognised path, so at `/a/b/c` a relative
`./assets/…` resolves against `/a/b/` and 404s in turn.

There is no GitHub Actions workflow. It was removed when the site moved off
GitHub Pages — leaving it would deploy the site to two places at once.

## What's here

| Path | What it is |
| --- | --- |
| `src/styles/tokens.css` | The design tokens, verbatim from `Backstage.dc.html`. Light + dark, media query + `[data-theme]`. |
| `src/lib/useTheme.ts` | Theme state, persisted to `localStorage` under `backstage-theme`. Follows the OS until the visitor picks. |
| `src/components/GlowHorizon.tsx` + `.css` | The hero. Headline contained inside the arc. |
| `src/components/JellyfishSection.tsx` | The title card — the orbiting BACKSTAGE ring and the ambience. |
| `src/components/Jellyfish3D.tsx` | The creature itself: shaded bell + shader-driven tentacles. |
| `src/components/SiteNav.tsx` | Fixed nav, revealed once the visitor passes ~72% of the first screen. |
| `src/components/PageBody.tsx` | Everything below the two full-screen sections. |
| `src/data/content.ts` | All page copy, plus the rules that govern editing it. |
| `src/styles/page.css` | Section styles, carried over from the design's inline values. |
| `src/styles/panels.css` | The one-section-per-screen layout. |
| `src/lib/useLenis.ts` | Lenis smooth scrolling — the page's scroll engine. |
| `src/lib/useAnchorScroll.ts` | Routes nav links through Lenis so they land. |
| `src/components/StepSequence.tsx` + `.css` | The held "How we work" sequence. |
| `src/components/JellyfishBackdrop.tsx` + `.css` | The drifting jellyfish behind the body copy. |
| `src/components/SplashCursor.tsx` | Fluid cursor trail, adapted from reactbits.dev. |
| `src/data/seo.ts` | Everything that describes the site to machines. Imported by `vite.config.ts`, not by the app. |
| `tools/og-image.mjs` | Renders `public/og.png`, the social share card. Run by hand: `npm run og`. |
| `public/robots.txt` | Crawler policy, including an explicit decision on the AI crawlers. |

## Two things worth knowing before editing

**GlowHorizon's containment.** The arc and the headline share one variable,
`--arc-h`. The ellipse is pulled up half its own height, so the bowl bottoms
out at `--arc-h / 2`, and the content layer *is* that box. If you place the
headline by any other measure it will drift through the rim as the window
resizes — that was the original bug.

**The arc's paint order reads backwards.** The page-coloured mask goes on
*top* of the bright ellipses. It is smaller than the rim and the indigo, so
only their edges survive, and that edge is the horizon line. Reorder them
"sensibly" and the whole bowl floods and washes out the headline.

## Scrolling

Lenis drives the page. It stops the browser scrolling natively and moves the
document itself, easing towards the target each frame — the inertia is the
effect: the scroll carries, sections glide, and the held sequence reads as
film rather than a slideshow. This is the technique the Noomo sites use; they
run GSAP's ScrollSmoother (a Club GreenSock licence), Lenis is the
open-source equivalent, so there is nothing to buy.

What it costs, stated plainly because it is easy to forget once it looks
good: the browser's own scrolling is gone. Scroll position is animated by
JavaScript, so find-in-page, focus scrolling and the scrollbar all go through
a translation layer, and if the script fails the page barely scrolls.

Under `prefers-reduced-motion` Lenis never starts and the browser scrolls
normally. `useAnchorScroll` routes nav links through Lenis, because a native
`scrollIntoView` sets a position Lenis overwrites on the next frame and the
page springs straight back.

## The held step sequence

"How we work" holds itself in place while the four steps advance against
scroll position — the pinned effect the Noomo sites are built around.

It uses **`position: sticky`, not GSAP's ScrollTrigger pin.** Pinning works by
switching the element to `position: fixed` and inserting a spacer to stand in
for its height, which rewrites the document's scroll height whenever triggers
refresh — which fights Lenis, reading and writing the same scroll position.
Sticky changes no layout, adds no spacer, is three lines of CSS, and still
shows the content if the JS never runs.

The **index** on the right isn't decoration. A held section hides its own
length — the reader can't see how much is left or what they're being taken
towards, which is what makes this pattern feel like being trapped rather than
led. It also *is* the content for anyone whose JS didn't run.

The animation is written straight to the DOM on a rAF, not through React
state. It runs every scroll frame; a re-render per frame would be wasted work
and would fight Lenis for the frame budget.

## One section per screen

Below the title card each section is a full-screen panel — `.panel` in
`panels.css`. There is no scroll-snapping; the panels are layout only, giving
each section a screen of its own so they read as separate moments rather than
one wall of text. Sections that can outgrow the viewport carry `panel--tall`,
which aligns their content to the top instead of centring it.

`.page` must stay `overflow-x: clip`, never `overflow: hidden`. `hidden`
makes it a scroll container, which breaks `position: sticky` for everything
inside it — the held step sequence stops holding.

`.page` also paints no background of its own. The jellyfish backdrop is fixed
behind the page and `.page` paints after it, so an opaque colour here hides
the backdrop completely. The page colour comes from `<body>`.

## Scroll reveals

Two reveal systems, used for different things:

- **`ScrollReveal`** (GSAP, adapted from reactbits.dev) — word-by-word, scrubbed
  to scroll position, with blur and a slight container rotation. Used on the
  section headings and lead paragraphs, where it reads as deliberate.
- **`Reveal`** — a plain fade-up on an IntersectionObserver, fired once. Used
  for the structured blocks: Julian's rows, buttons, the address.
  Word-splitting a reference table makes it harder to read, not more
  impressive, and constant motion across a page of detail is tiring.

Both are driven by scroll position, which Lenis owns — see Scrolling above.

### Four fixes applied to the upstream ScrollReveal

Worth knowing before pulling a newer copy from reactbits.dev, because these
would come back:

1. It rendered `<h2>` wrapping a `<p>` — invalid, and it put an `h2` around
   every paragraph it touched. `as` is a prop now, defaulting to `p`.
2. Its cleanup ran `ScrollTrigger.getAll().forEach(t => t.kill())`, killing
   *every* trigger on the page. Unmounting one instance broke all the others.
   Scoped to `gsap.context()` now. There are 12 instances on this page.
3. No `prefers-reduced-motion` check. GSAP writes inline styles, so the global
   `*{animation:none;transition:none}` does not stop it — reduced-motion
   visitors were left reading text pinned at 10% opacity, permanently.
4. Non-string children silently rendered nothing. The type enforces `string`.

The same reduced-motion trap applies to `Reveal`: its hidden state sits inside
`@media (prefers-reduced-motion: no-preference)` rather than being switched off
later, so there is no way for those visitors to end up with invisible content.

## Search, and being found

The head metadata, the JSON-LD and the no-script document are all written
into `index.html` during the build by the `backstage-seo` plugin in
`vite.config.ts`, from `src/data/seo.ts` and `src/data/content.ts`. None of it
is hand-written and none of it ships in the bundle, for one reason: React
cannot help here. A `<meta>` tag added on mount arrives long after a crawler
has read the document and moved on.

**The problem this is solving.** The built page is `<div id="root"></div>` and
nothing else — every word is written by JavaScript. Google runs JavaScript and
gets there eventually, on a second pass. The crawlers behind the AI answer
engines mostly do not run it at all, so to them this site was a blank
document. That is the gap the `<noscript>` copy closes, and it is why
`robots.txt` names GPTBot, ClaudeBot and PerplexityBot explicitly rather than
leaving them to a wildcard: whether an assistant can describe this company
when someone asks it for a UK AI consultancy is a decision, and it should be
a recorded one.

**What is deliberately not claimed.** The structured data says the company
operates in the United Kingdom and nothing narrower. There is no street
address, no phone number, no rating, no client list — because none of those
are established facts, and structured data is a set of claims made to Google
in machine-readable form. Inventing one to win a local search is how you earn
a manual action. If a real address exists, add it and switch the schema to
`LocalBusiness`; until then this is the honest shape.

**What this cannot do.** Technical SEO makes a site *eligible* to rank. It
does not make it rank for "AI consultancy" — that is a head term with a
decade of incumbents, and one page of ~600 words will not take it, however
well marked up. What this setup can realistically win is the brand search,
long-tail phrasing, and citation by AI answer engines. Ranking for the head
terms needs pages that do not exist yet, and writing them means having
something true to say.

**The brand collision is real.** "Backstage" alone belongs to Spotify's
developer portal and to Backstage.com, and both are enormous. Every machine-
readable name here is "Backstage Consultancy" for that reason. Keep it
consistent everywhere the company is written down — Companies House,
LinkedIn, email signatures, directories — or there is nothing for Google to
attach a brand to.

## The 404

`public/404.html`, which the host serves for any unrecognised path. It is
deliberately standalone — no bundle, no webfont, no framework, about 4KB
inline. A 404 is the one page that has to render when something has already
gone wrong, and a 404 that depends on the app bundle is a blank screen when
the bundle is what broke. The creature is CSS rather than the WebGL
jellyfish: same idea, none of the weight, and it still draws with scripting
off.

## Type

Two self-hosted variable fonts, installed from npm and imported in
`main.tsx` — no Google Fonts request, nothing third-party in the critical
path, and the files are fingerprinted and cached like any other asset.

- **Sora** (`--font-display`) — section titles, headings, the BACKSTAGE ring.
  Geometric and even, and it holds together at the 130px section titles where
  a text face looks stretched.
- **Inter** (`--font-text`) — everything you actually read. A geometric face
  is tiring over a paragraph; the display font is for titles, not for prose.

Both are variable, so one file each covers every weight and asking for 700
costs nothing over 400. System fallbacks stay in both stacks, so the page is
still set correctly in the moment before the woff2 lands, and if it never
lands.

To swap the display face, change `--font-display` in `tokens.css` and the
import in `main.tsx` — nothing else references a family name directly.

## Performance

three.js is code-split, so the hero paints without it and the download only
starts when someone scrolls near the jellyfish. The canvas also unmounts when
the section leaves the viewport, and the creature drops from 28 tentacles to
14 on small screens or low core counts.

Measured from `npm run build`: the initial JavaScript is ~123KB gzipped and
the CSS ~6KB; the jellyfish chunk is a further ~237KB gzipped, and does not
load until someone scrolls to it. (This section previously claimed ~63KB
initial. That was stale — it dated from before GSAP, ScrollTrigger, Lenis and
the fluid cursor went in, and none of those are code-split.)

If that number ever needs to come down, GSAP + ScrollTrigger and the fluid
cursor are the candidates to measure first — neither is code-split, so both
are downloaded before anything renders. Measure before cutting: which of them
actually dominates has not been checked.

## The contact form

There isn't one. The contact section is the address, set large, and nothing
to fill in — the pattern the Noomo site uses. A form asks somebody to compose
their problem in a textarea on a stranger's website and trust that it
arrived; an address lets them write it where they already write everything
else, from an account we can reply to.

It also removes the only part of the site that needed a server. A static
build cannot send email, so a form here meant a third-party relay, a key in
the bundle, and a silent-failure mode where an enquiry vanishes. None of that
exists now.

## Still open

1. Should Julian's link be live at launch, or hidden until his site ships?
   Right now it links out with a "Going live shortly." note beneath it.
2. Is there a phone number to add alongside the address?
3. Do they want Julian's pricing tiers on the page later? The page currently
   acknowledges pricing exists without printing numbers, which was deliberate.
4. Is there a phone number to add alongside the email?
