# Backstage — website

Vite + React + TypeScript. The 3D jellyfish needs `three` and
`@react-three/fiber`, which is why this is a build rather than a single HTML
file — three.js alone is ~890KB and cannot sensibly be inlined.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/, plain static files
```

`dist/` deploys as-is to Netlify, Vercel, Cloudflare Pages or any static host.
No server needed.

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
| `src/components/ContactForm.tsx` | The contact form. No backend — see below. |
| `src/data/content.ts` | All page copy, plus the rules that govern editing it. |
| `src/styles/page.css` | Section styles, carried over from the design's inline values. |
| `src/styles/panels.css` | The one-section-per-screen scroll snapping, and where it switches itself off. |
| `src/lib/useAnchorScroll.ts` | Makes nav links jump correctly under both scroll modes. |
| `src/lib/scrollMode.ts` | The snap/cinematic switch. Temporary — see above. |
| `src/lib/useLenis.ts` | Lenis smooth scrolling, cinematic mode only. |
| `src/components/StepSequence.tsx` + `.css` | The held "How we work" sequence. |

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

## Choosing a scroll mode

The site ships with **two scroll architectures** so you can feel the
difference rather than read about it. Switch with the control at the bottom
left, or open `?scroll=snap` / `?scroll=cinematic` directly. The choice is
remembered.

| | **Snap** (default) | **Cinematic** |
| --- | --- | --- |
| Engine | CSS `scroll-snap` | Lenis, JS-driven |
| Feel | Settles onto one section at a time | Inertial; the scroll carries |
| Keyboard, Page Down, find-in-page | Native | Through a translation layer |
| If the JS fails | Ordinary scrolling page | Page barely scrolls |
| Weight | 0 KB | ~7 KB gzipped |

Cinematic is the technique the Noomo sites use. They run GSAP's
**ScrollSmoother**, which needs a Club GreenSock licence (~$99/yr); Lenis is
the open-source equivalent and is what's wired up here, so there's nothing to
buy either way.

Both modes share the held "How we work" sequence, so that isn't the variable —
the difference is purely how the page moves between sections.

**This is scaffolding for a decision, not a feature.** No visitor should be
asked to pick a scroll engine. Once you've chosen:

1. Delete `src/components/ScrollModeSwitcher.tsx` and its CSS.
2. Delete `src/lib/scrollMode.ts` and the `mode` plumbing in `App.tsx` and
   `PageBody.tsx`.
3. Keeping **snap**: delete `src/lib/useLenis.ts`, `npm uninstall lenis`, drop
   the cinematic branch in `useAnchorScroll.ts`, and unscope the
   `[data-scroll-mode="snap"]` selectors in `panels.css` and
   `StepSequence.css`.
   Keeping **cinematic**: delete `src/styles/panels.css` and the `panel`
   classes, and drop the snap branch in `useAnchorScroll.ts`.

## The held step sequence

"How we work" holds itself in place while the four steps advance against
scroll position — the pinned effect the Noomo sites are built around.

It uses **`position: sticky`, not GSAP's ScrollTrigger pin.** Pinning works by
switching the element to `position: fixed` and inserting a spacer to stand in
for its height, which rewrites the document's scroll height whenever triggers
refresh. Under scroll-snap that is a direct fight: the snap targets move while
someone is scrolling through them. Sticky changes no layout, adds no spacer,
works identically in both modes, is three lines of CSS, and still shows the
content if the JS never runs.

Two details worth keeping:

- The section carries `scroll-snap-align: none`, and four absolutely
  positioned **waypoints** carry the snap points instead. Without that, a
  mandatory snap container hauls the reader back out of the middle of the
  sequence. The waypoints are inert in cinematic mode.
- The **index** on the right isn't decoration. A held section hides its own
  length — the reader can't see how much is left or what they're being taken
  towards, which is what makes this pattern feel like being trapped rather
  than led. It also *is* the content for anyone whose JS didn't run.

The animation is written straight to the DOM on a rAF, not through React
state. It runs every scroll frame; a re-render per frame would be wasted work
and would fight Lenis for the frame budget.

## One section per screen

Below the jellyfish, each section is a full-screen panel and the scroll settles
on one at a time. This is CSS scroll-snap, not a JavaScript wheel handler. The
browser does the assisting, so the keyboard still works, Page Down still works,
find-in-page still works, the scrollbar still drags, and if the CSS never loads
the page is an ordinary scrolling document. Hijacking the wheel buys a slightly
firmer feel and costs all of that.

It switches itself off below 720px of window height, below 600px of width, and
under `prefers-reduced-motion`. On a short laptop or a phone in landscape a
panel cannot hold its content, and forcing one screen per section would hide
half of it.

Three constraints are not obvious, and each one broke the page during the
build:

**`.page` must be `overflow-x:clip`, never `overflow:hidden`.** `hidden` makes
an element a scroll container, which captures the snap targets inside it away
from `<html>`. The symptom is not subtle: the page stops snapping, the footer
becomes unreachable, and nav jumps land thousands of pixels off. `clip` clips
without creating the container.

**No `scroll-snap-stop:always`.** It looks like exactly what you want — every
panel forces a stop — but it applies to programmatic scrolling too, so a nav
link can no longer jump past the panels between here and there. Skipping
straight to the contact form is the reason the nav exists. The default
`normal` still lands a wheel gesture on a section; it just permits a jump
through.

**`useAnchorScroll` exists because smooth scrolling and mandatory snapping
fight.** The snap container captures a smooth-scroll animation at the first
snap point it passes, so "Get in touch" from the top travelled one panel and
stalled there for good. The hook suspends snapping for the duration of a jump
and restores it once the target has actually arrived — verified by position,
not by the first `scrollend`, because that event can belong to a scroll that
was already in flight. A 3.2s timer backstops it; snapping must never be left
switched off.

The footer gets `scroll-snap-align:end` for a related reason: a mandatory
container only ever rests at a snap point, so without one of its own the footer
can never be shown at all — the scroll springs back to the last panel.

Sections that can genuinely outgrow the viewport (the contact form, the steps
grid once it stacks) carry `panel--tall`, which aligns their content to the top
instead of centring it, so nothing sits below the fold.

## Scroll reveals

Two reveal systems, used for different things:

- **`ScrollReveal`** (GSAP, adapted from reactbits.dev) — word-by-word, scrubbed
  to scroll position, with blur and a slight container rotation. Used on the
  section headings and lead paragraphs, where it reads as deliberate.
- **`Reveal`** — a plain fade-up on an IntersectionObserver, fired once. Used
  for the structured blocks: Julian's rows, the four steps, buttons, the form.
  Word-splitting a reference table makes it harder to read, not more
  impressive, and constant motion across a page of detail is tiring.

Smooth scrolling itself is native (`scroll-behavior: smooth` in `tokens.css`),
with `useAnchorScroll` handling the collision with snapping described above.
Nothing hijacks the wheel. If you ever want momentum scrolling, Lenis is the
usual choice and integrates with ScrollTrigger — but it takes over the scroll
entirely, which means re-solving the snapping in JavaScript, and it needs its
own reduced-motion handling.

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

## Performance

three.js is code-split, so the hero paints without it and the download only
starts when someone scrolls near the jellyfish. The canvas also unmounts when
the section leaves the viewport, and the creature drops from 28 tentacles to
14 on small screens or low core counts.

Initial load is ~63KB gzipped; the jellyfish chunk is ~237KB gzipped.

## The contact form

There is no backend. The design had submit show "Not wired up yet — email us
directly for now", which is honest but leaves someone who has just typed out
their problem with nowhere to send it. Until it is wired up, submitting hands
the text to the visitor's mail client with everything pre-filled, so the form
keeps the promise it makes. The mailto link stays prominent beside it either
way.

Point it at a real endpoint and drop the fallback — see the TODO in
`src/components/ContactForm.tsx`.

## Still open (from the original handoff)

1. Should Julian's link be live at launch, or hidden until his site ships?
   Right now it links out with a "Going live shortly." note beneath it.
2. Where should the contact form deliver?
3. Do they want Julian's pricing tiers on the page later? The page currently
   acknowledges pricing exists without printing numbers, which was deliberate.
4. Is there a phone number to add alongside the email?
