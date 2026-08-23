import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

import {
  CONTACT,
  CONTACT_EMAIL,
  FOOTER,
  HERO,
  HOW_TITLE,
  INTRO,
  JULIAN,
  JULIAN_ROWS,
  JULIAN_URL,
  PROBLEM,
  SLOGAN,
  STEPS,
} from './src/data/content.ts'
import {
  COMPANY_NUMBER,
  ICO_REGISTRATION,
  LEGAL_FORM,
  LEGAL_NAME,
  POLICY_EFFECTIVE,
  POSTAL_ADDRESS,
  PROCESSORS,
  assertLegalIdentityComplete,
} from './src/data/legal.ts'
import {
  DESCRIPTION,
  LOCALE,
  OG_IMAGE,
  OG_IMAGE_ALT,
  ORG_NAME,
  SITE_URL,
  THEME_COLOR,
  TITLE,
  structuredData,
} from './src/data/seo.ts'

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/* The document the app never renders.
 *
 * The built page ships `<div id="root"></div>` and nothing else: every word on
 * this site is written by JavaScript. Google runs JavaScript and will
 * eventually see the real thing, but it does so on a second pass, days behind
 * the first — and the crawlers behind the AI answer engines (GPTBot,
 * ClaudeBot, PerplexityBot and the rest) overwhelmingly do not run it at all.
 * To those, this site is a blank document. For an AI consultancy, being the
 * one company an AI cannot describe is a bad look as well as a bad outcome.
 *
 * So the same copy is written into the HTML at build time, from the same
 * module the components import — it cannot drift, because there is only one
 * copy of the text.
 *
 * It goes in a <noscript>, deliberately, and the trade-off is worth stating.
 * Inside <noscript> the text is in the raw HTML for anything reading the
 * source, and it is what a visitor without JavaScript actually gets, which is
 * the honest justification for it being there at all. What it avoids is the
 * alternative: putting this markup inside #root, where React tears it out on
 * mount — a flash of one layout replaced by another, and a guaranteed layout
 * shift on a metric Google scores.
 *
 * The real fix, if this site ever grows past one page, is prerendering with
 * hydrateRoot so the static HTML *is* the first paint. That needs the WebGL
 * section, the theme hook and Lenis all made safe to run without a DOM, which
 * is a day's work and not worth it for a single page.
 */
function crawlableBody() {
  const rows = JULIAN_ROWS.map(
    (r) => `<li><strong>${esc(r.k)}</strong> — ${esc(r.v)}</li>`
  ).join('')

  const steps = STEPS.map(
    (s) => `<li><h3>${esc(s.n)} — ${esc(s.title)}</h3><p>${esc(s.body)}</p></li>`
  ).join('')

  const pair = PROBLEM.pair
    .map((c) => `<li><strong>${esc(c.label)}:</strong> ${esc(c.value)}</li>`)
    .join('')

  return `<noscript><div class="nojs">
<h1>${esc(HERO.lines[0])} ${esc(HERO.lines[1])}</h1>
<p>${esc(HERO.eyebrow)}</p>
<h2>${esc(SLOGAN)}</h2>
<p>${esc(INTRO.opening)}</p>

<h2>${esc(PROBLEM.title)}</h2>
<h3>${esc(PROBLEM.heading)}</h3>
${PROBLEM.body.map((p) => `<p>${esc(p)}</p>`).join('')}
<ul>${pair}</ul>

<h2>${esc(JULIAN.title)}</h2>
<h3>${esc(JULIAN.heading)}</h3>
<p>${esc(JULIAN.lede)}</p>
<p>${esc(JULIAN.ourOwn)}</p>
<ul>${rows}</ul>
<p><a href="${esc(JULIAN_URL)}">${esc(JULIAN.linkLabel)}</a> — ${esc(JULIAN.note)}</p>

<h2>${esc(HOW_TITLE)}</h2>
<ol>${steps}</ol>

<h2>${esc(CONTACT.title)}</h2>
<h3>${esc(CONTACT.heading)}</h3>
<p>${esc(CONTACT.lede)}</p>
<p><a href="mailto:${esc(CONTACT_EMAIL)}">${esc(CONTACT_EMAIL)}</a></p>

<p>${esc(FOOTER.line)} · ${esc(FOOTER.est)} · <a href="${esc(FOOTER.privacy.href)}">${esc(FOOTER.privacy.label)}</a></p>
</div></noscript>`
}

/* Fills the {{TOKENS}} in privacy.html from src/data/legal.ts.
 *
 * The notice is hand-written HTML rather than generated prose — it is a legal
 * document, and it should be editable by somebody who is not a programmer,
 * including a solicitor reviewing it. Only the identity facts are injected,
 * because those are the ones that must not disagree with anything else on the
 * site, and the ones that are embarrassing to get wrong. */
function fillPrivacy(html: string) {
  const form =
    LEGAL_FORM === 'sole trader'
      ? 'a sole trader'
      : LEGAL_FORM === 'partnership'
        ? 'a partnership'
        : 'a company registered in England and Wales'

  const companyLine = COMPANY_NUMBER
    ? `<p>Registered in England and Wales, company number <strong>${esc(COMPANY_NUMBER)}</strong>.</p>`
    : ''

  /* Omitted rather than faked while the fee is unpaid. Publishing a
     registration number you do not hold is a worse problem than not having
     one yet. */
  const icoLine = ICO_REGISTRATION
    ? `<p>Registered with the Information Commissioner's Office, registration number <strong>${esc(ICO_REGISTRATION)}</strong>.</p>`
    : ''

  const rows = PROCESSORS.map(
    (p) =>
      `<tr><td><strong>${esc(p.name)}</strong><br /><span style="color:var(--text-3)">${esc(p.where)}</span></td>` +
      `<td>${esc(p.role)}</td><td>${esc(p.data)}</td></tr>`
  ).join('')

  return html
    .replaceAll('{{LEGAL_NAME}}', esc(LEGAL_NAME))
    .replaceAll('{{LEGAL_FORM_SENTENCE}}', form)
    .replaceAll('{{POSTAL_ADDRESS_HTML}}', POSTAL_ADDRESS.split('\n').map(esc).join('<br />'))
    .replaceAll('{{COMPANY_NUMBER_LINE}}', companyLine)
    .replaceAll('{{ICO_REGISTRATION_LINE}}', icoLine)
    .replaceAll('{{PROCESSOR_ROWS}}', rows)
    .replaceAll('{{POLICY_EFFECTIVE}}', esc(POLICY_EFFECTIVE))
    .replaceAll('{{CONTACT_EMAIL}}', esc(CONTACT_EMAIL))
}

/** Writes the head metadata, the JSON-LD and the no-script document into
 *  index.html during the build. None of this can be done from React: a <meta>
 *  tag added after mount arrives long after a crawler has read the document
 *  and moved on. */
function seo(): Plugin {
  return {
    name: 'backstage-seo',

    /* Before anything is built, not while it is being written out. */
    buildStart() {
      assertLegalIdentityComplete()
    },

    transformIndexHtml(html, ctx) {
      /* This hook runs for every HTML entry, and privacy.html wants none of
         what follows — it is a standalone document with its own head and no
         bundle. Without this branch it would get the marketing page's title,
         its Open Graph tags and a second copy of the whole site's copy. */
      if (ctx.path.includes('privacy')) return fillPrivacy(html)

      const head = `
    <meta name="description" content="${esc(DESCRIPTION)}" />
    <link rel="canonical" href="${SITE_URL}/" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
    <meta name="author" content="${esc(ORG_NAME)}" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${esc(ORG_NAME)}" />
    <meta property="og:title" content="${esc(TITLE)}" />
    <meta property="og:description" content="${esc(DESCRIPTION)}" />
    <meta property="og:url" content="${SITE_URL}/" />
    <meta property="og:locale" content="${LOCALE}" />
    <meta property="og:image" content="${OG_IMAGE}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${esc(OG_IMAGE_ALT)}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(TITLE)}" />
    <meta name="twitter:description" content="${esc(DESCRIPTION)}" />
    <meta name="twitter:image" content="${OG_IMAGE}" />

    <meta name="theme-color" content="${THEME_COLOR.light}" media="(prefers-color-scheme: light)" />
    <meta name="theme-color" content="${THEME_COLOR.dark}" media="(prefers-color-scheme: dark)" />

    <script type="application/ld+json">${JSON.stringify(structuredData(CONTACT_EMAIL))}</script>`

      return html
        .replace('<title>Backstage</title>', `<title>${esc(TITLE)}</title>${head}`)
        .replace('</body>', `  ${crawlableBody()}\n  </body>`)
    },

    /* Emitted rather than kept in public/ so <lastmod> is the date of the
     * build that produced it. A hand-written sitemap dates from the day
     * somebody remembered to edit it, which is worse than having none —
     * it tells a crawler the page has not changed when it has. */
    generateBundle() {
      const lastmod = new Date().toISOString().slice(0, 10)
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/privacy</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>
`,
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), seo()],
  /* Absolute asset URLs, because the site is served from the root of its own
   * domain now rather than from a GitHub Pages subpath.
   *
   * This matters most for 404.html, which the host serves for *any*
   * unrecognised path. With relative URLs, a request for /a/b/c resolves
   * ./assets/… against /a/b/ — so the error page's own assets 404 as well.
   * Absolute paths always resolve from the root. */
  base: '/',

  build: {
    rollupOptions: {
      /* Two HTML entries. privacy.html has to be listed here — not dropped in
       * public/ — so that the build processes it and the {{TOKENS}} get
       * filled. Files in public/ are copied byte for byte and would ship with
       * the placeholders still in them.
       *
       * index.html must be repeated: naming any input replaces the default
       * rather than adding to it. */
      input: {
        index: resolve(__dirname, 'index.html'),
        privacy: resolve(__dirname, 'privacy.html'),
      },
    },
  },
})
