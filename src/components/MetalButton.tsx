/* A button with a liquid-metal ring around it.
 *
 * The shader and the MetalFx wrapper are Jakub Antalík's `metal-fx` package.
 * The published recipe for this is cult-ui's `metal-button`, which wraps
 * shadcn/ui's Button — that is not what this is. This site has no Tailwind, no
 * class-variance-authority and no @/components/ui; adopting shadcn's Button to
 * get a ring around it would mean adopting its whole stack for two controls.
 * metal-fx itself has no dependencies beyond React, so it wraps the site's own
 * .btn-pill directly and the existing styles are untouched.
 *
 * Three things this has to get right that the recipe does not cover:
 *
 *  - `theme` is passed explicitly, never left on "auto". MetalFx's auto mode
 *    reads prefers-color-scheme, and this site's toggle deliberately does not
 *    follow the OS — so on auto the ring would stay dark on a page the reader
 *    had just switched to light.
 *  - `paused` under reduced motion. The ring keeps its last frame, so the
 *    button still looks metallic; it just stops moving.
 *  - `normalizeHostStyles` is off. It moves the host's fill onto the wrapper
 *    and strips the button's own chrome, which for .btn-pill would throw away
 *    the shape the rest of the page is built around. The ring is drawn around
 *    our pill instead of replacing it.
 */

import { useEffect, useState, type ReactNode } from "react";
import { MetalFx } from "metal-fx";
import type { Theme } from "../lib/useTheme";
import "./MetalButton.css";

export function MetalButton({
  theme,
  href,
  onClick,
  children,
  variant = "button",
  className = "btn-pill",
}: {
  theme: Theme;
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  variant?: "button" | "circle";
  className?: string;
}) {
  /* Matched in JS rather than CSS because it is a prop on the shader, not a
     style. The global reduced-motion rule in tokens.css cannot reach inside a
     WebGL loop. */
  const [still, setStill] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setStill(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const inner = href ? (
    <a className={className} href={href}>
      {children}
    </a>
  ) : (
    <button type="button" className={className} onClick={onClick}>
      {children}
    </button>
  );

  return (
    <MetalFx
      className="metal"
      variant={variant}
      preset="chromatic"
      theme={theme}
      strength={0.9}
      paused={still}
      normalizeHostStyles={false}
    >
      {inner}
    </MetalFx>
  );
}

export default MetalButton;
