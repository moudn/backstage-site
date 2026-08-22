/* Renders public/og.png — the 1200x630 card LinkedIn, Slack, WhatsApp and
 * X show when somebody pastes the site's URL.
 *
 * Run: node tools/og-image.mjs
 *
 * This is a build tool, not part of the build. The output is committed, so a
 * deploy never depends on Chromium being installed; re-run it only when the
 * wording or the palette changes.
 *
 * Why generate it rather than draw one: the card has to say the same thing as
 * the <title>, and the copy lives in src/data — importing it here means the
 * image cannot end up quoting a tagline the site stopped using.
 *
 * The artwork is a flat echo of GlowHorizon, not a screenshot of it. A
 * screenshot of the real hero is mostly empty space at 1200x630 and the
 * headline comes out unreadable in a LinkedIn feed at a third of that size.
 */

import { execFileSync } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')

/* Playwright is not a dependency of this project — it is a ~300MB install
   whose only job here is to run once, by hand, when the card changes. So look
   for it wherever it happens to be (local first, then the global npm root)
   rather than pinning it into package.json for everybody who clones this. */
async function loadChromium() {
  /* Playwright ships CommonJS, so `await import()` may hand back the exports
     under `default` rather than as named bindings depending on how it was
     resolved. Check both instead of assuming. */
  const pick = (mod) => mod?.chromium ?? mod?.default?.chromium
  const candidates = ['playwright', 'playwright-core']

  const specifiers = [...candidates]
  try {
    const globalRoot = execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim()
    for (const name of candidates) {
      specifiers.push(pathToFileURL(resolve(globalRoot, name, 'index.js')).href)
    }
  } catch {
    /* npm not on PATH — the local specifiers above are all we have */
  }

  for (const spec of specifiers) {
    try {
      const found = pick(await import(spec))
      if (found) return found
    } catch {
      /* not resolvable from here — keep looking */
    }
  }
  throw new Error(
    'Playwright not found. Install it with `npm i -D playwright` (or `npm i -g playwright`) and re-run.'
  )
}

const chromium = await loadChromium()

/* content.ts is TypeScript and node cannot import it without a loader, which
   is not worth adding for one string. Reading it out of the source keeps a
   single source of truth with no toolchain: if the slogan changes, this
   picks it up; if it is renamed or restructured, this throws rather than
   quietly baking a stale tagline into the image. */
async function fromContent(name) {
  const src = await readFile(resolve(root, 'src/data/content.ts'), 'utf8')
  const m = src.match(new RegExp(`export const ${name} = "([^"]+)"`))
  if (!m) throw new Error(`Could not find "export const ${name}" in src/data/content.ts`)
  return m[1]
}

const slogan = await fromContent('SLOGAN')

const fontPath = resolve(root, 'node_modules/@fontsource-variable/sora/files/sora-latin-wght-normal.woff2')
const fontData = await readFile(fontPath)
const fontUrl = `data:font/woff2;base64,${fontData.toString('base64')}`

const html = `<!doctype html><meta charset="utf-8">
<style>
  @font-face{
    font-family:'Sora';
    src:url('${fontUrl}') format('woff2');
    font-weight:100 800;
  }
  *{margin:0;padding:0;box-sizing:border-box}
  body{
    width:1200px;height:630px;overflow:hidden;position:relative;
    background:#08080D;
    font-family:'Sora',system-ui,sans-serif;
    color:#F7F5FA;
    display:flex;flex-direction:column;justify-content:center;
    padding:0 88px;
  }
  /* The horizon: a wide ellipse pushed below the fold so only its lit rim
     shows, which is the hero's whole idea reduced to one shape. */
  .arc{
    position:absolute;left:50%;bottom:-528px;transform:translateX(-50%);
    width:1500px;height:640px;border-radius:50%;
    background:radial-gradient(ellipse at 50% 0%,
      rgba(165,88,251,0.85) 0%,
      rgba(120,70,220,0.42) 38%,
      rgba(60,40,140,0.14) 62%,
      transparent 78%);
    filter:blur(2px);
  }
  .rim{
    position:absolute;left:50%;bottom:-530px;transform:translateX(-50%);
    width:1500px;height:640px;border-radius:50%;
    box-shadow:0 0 90px 2px rgba(190,130,255,0.55);
  }
  .glow{
    position:absolute;left:50%;top:58%;transform:translate(-50%,-50%);
    width:900px;height:420px;
    background:radial-gradient(ellipse,rgba(62,156,196,0.20),transparent 70%);
  }
  .inner{position:relative;z-index:2}
  .eyebrow{
    font-size:21px;font-weight:500;letter-spacing:0.16em;text-transform:uppercase;
    color:#B79BE8;margin-bottom:30px;
  }
  h1{
    font-size:96px;font-weight:700;letter-spacing:-0.045em;line-height:0.94;
    text-transform:uppercase;margin-bottom:26px;
  }
  .slogan{
    font-size:30px;font-weight:400;line-height:1.32;color:#C9C4D6;
    max-width:820px;
  }
  .foot{
    position:absolute;left:88px;bottom:46px;z-index:3;
    font-size:20px;font-weight:500;color:#A9A1BE;letter-spacing:0.01em;
  }
</style>
<div class="arc"></div><div class="rim"></div><div class="glow"></div>
<div class="inner">
  <div class="eyebrow">AI consultancy &middot; UK</div>
  <h1>Backstage</h1>
  <div class="slogan">${slogan.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</div>
</div>
<div class="foot">backstageconsultancy.com</div>`

const tmp = resolve(root, 'tools/.og.html')
await writeFile(tmp, html)

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
await page.goto(`file://${tmp}`)
await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: resolve(root, 'public/og.png') })
await browser.close()

console.log('Wrote public/og.png (1200x630)')
