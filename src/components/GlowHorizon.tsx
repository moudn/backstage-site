/* The hero's glowing horizon, with its headline held inside it.
 *
 * The original had the arc sized as a percentage of the hero while the
 * headline was placed from the hero's centre with a vh nudge. Those two
 * numbers move at different rates, so the text drifted through the rim at
 * most window sizes. Here a single variable, --arc-h, drives both: the
 * ellipse is pulled up by half its own height, so the bowl bottoms out at
 * exactly --arc-h / 2, and the content layer *is* that box. Containment is
 * structural rather than a number that happened to work once.
 *
 * The arc stack's paint order is the other thing that matters, and it reads
 * backwards: the page-coloured mask goes on TOP of the bright ellipses. It's
 * smaller than the rim and the indigo, so only their edges survive — which is
 * the horizon line. Put the bright layers on top instead and the whole bowl
 * floods, washing out the headline sitting in it.
 */

import "./GlowHorizon.css";

export function GlowHorizon({
  eyebrow,
  lines,
  scrollTo,
}: {
  eyebrow: string;
  lines: readonly string[];
  scrollTo: string;
}) {
  return (
    <section className="glow-horizon">
      <div className="glow-horizon__arc" aria-hidden="true">
        {/* Order below is paint order: rim first, mask last. */}
        <div className="glow-horizon__stack">
          <div className="glow-horizon__layer glow-horizon__layer--rim" />
          <div className="glow-horizon__layer glow-horizon__layer--mid" />
          <div className="glow-horizon__layer glow-horizon__layer--deep" />
          <div className="glow-horizon__layer glow-horizon__layer--base" />
        </div>
      </div>

      <div className="glow-horizon__content">
        <p className="glow-horizon__eyebrow">{eyebrow}</p>
        <h1 className="glow-horizon__title">
          {lines.map((line, i) => (
            <span key={i}>{line}</span>
          ))}
        </h1>
      </div>

      <a className="glow-horizon__scroll" href={scrollTo}>
        Scroll
      </a>
    </section>
  );
}

export default GlowHorizon;
