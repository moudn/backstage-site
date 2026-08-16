/* The Backstage mark, redrawn.
 *
 * Kept from the original: the B built as a bar over two round-bottomed
 * columns, and the four-point star. Those are the two ideas worth keeping —
 * the B reads as a proscenium arch with two curtains under it, which is on
 * the nose for the name in a good way.
 *
 * Changed, to sit with the rest of the site:
 *
 *  - Drawn as geometry rather than a raster, so it is crisp at any size and
 *    weighs a few hundred bytes.
 *  - `currentColor`, not the fixed corporate blue. The mark inherits whatever
 *    it sits in, so it works in both themes without a second asset.
 *  - The vertical "EST. 2026" and the italic serif "ackstage" are gone. They
 *    fought the mark at small sizes and the serif belongs to a different
 *    typographic voice than the one the site now uses; the wordmark is set in
 *    Sora alongside it instead.
 *  - The star is optional and sits behind at low opacity, rather than
 *    competing with the letterform.
 */

import "./Logo.css";

export function Logo({
  withWordmark = true,
  className = "",
}: {
  withWordmark?: boolean;
  className?: string;
}) {
  return (
    <span className={`logo ${className}`.trim()}>
      <svg
        className="logo__mark"
        viewBox="0 0 100 100"
        role="img"
        aria-label={withWordmark ? undefined : "Backstage"}
        aria-hidden={withWordmark ? "true" : undefined}
        focusable="false"
      >
        {/* The star, behind and quiet. */}
        <path
          className="logo__star"
          d="M50 4 L58 38 L92 46 L58 54 L50 88 L42 54 L8 46 L42 38 Z"
          fill="currentColor"
        />
        {/* Bar across the top. */}
        <rect x="12" y="26" width="76" height="13" rx="3" fill="currentColor" />
        {/* Two round-bottomed columns. Each is a U: down the outside, round
            the bottom, back up the inside. */}
        <path
          d="M12 39 h13 v20 a8.5 8.5 0 0 0 17 0 v-20 h13 v20 a21.5 21.5 0 0 1 -43 0 Z"
          fill="currentColor"
        />
        <path
          d="M45 39 h13 v20 a8.5 8.5 0 0 0 17 0 v-20 h13 v20 a21.5 21.5 0 0 1 -43 0 Z"
          fill="currentColor"
        />
      </svg>
      {withWordmark && <span className="logo__word">Backstage</span>}
    </span>
  );
}

export default Logo;
