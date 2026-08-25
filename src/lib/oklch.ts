/* oklch() -> #rrggbb, for the build only.
 *
 * The privacy notice is a standalone page: no bundle, no framework, no
 * webfont, no JavaScript, because a legal notice is the one page that has to
 * render for everybody on anything forever — including for someone who has
 * scripting off precisely because they care about being tracked. That means it
 * cannot import tokens.css, so it carries its own palette inline.
 *
 * That palette was hand-copied hex, and it drifted. By the time anyone looked,
 * the notice was still painting the old purple accent (#5B45B8) on a site
 * whose light accent had become blue, and a --text-3 that had been re-cut for
 * contrast against the ambient field two changes earlier. Nothing warned,
 * because nothing connected the two.
 *
 * So the hex is derived from tokens.css at build time instead. The conversion
 * is exact rather than eyeballed, and the notice cannot fall out of step with
 * the site again without the build producing different output.
 */

/** oklab -> linear sRGB, then gamma-encoded and clamped. */
export function oklchToHex(L: number, C: number, hDeg: number): string {
  const h = (hDeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  // oklab -> approximate cone responses, cubed back out of the cube root.
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];

  const hex = lin
    .map((v) => {
      /* Gamma-encode, then clamp. Clamping AFTER encoding matters for colours
         near the edge of sRGB: clamping the linear value first shifts the hue,
         because the three channels stop being clipped by the same proportion. */
      const enc = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(Math.max(v, 0), 1 / 2.4) - 0.055;
      const n = Math.round(Math.min(1, Math.max(0, enc)) * 255);
      return n.toString(16).padStart(2, "0");
    })
    .join("");

  return `#${hex.toUpperCase()}`;
}

/** Pulls `--name:oklch(L C H)` declarations out of a block of CSS text. */
export function readOklchTokens(css: string, names: readonly string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const name of names) {
    /* Alpha is deliberately not handled: every token the notice uses is
       opaque, and silently dropping an alpha channel would be a worse bug than
       failing loudly. */
    const m = new RegExp(`--${name}\\s*:\\s*oklch\\(([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)\\s*\\)`).exec(css);
    if (!m) throw new Error(`oklch: --${name} not found as a plain oklch() value`);
    out[name] = oklchToHex(Number(m[1]), Number(m[2]), Number(m[3]));
  }
  return out;
}
