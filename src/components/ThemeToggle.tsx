/* The theme switch.
 *
 * It shows the theme you would GET, not the one you are in: a sun while the
 * page is dark, a moon while it is light. That is the convention people
 * actually read — the icon is a button label ("make it light"), not a status
 * light ("it is dark"). The old control did the opposite, showing the word
 * "Dark" while dark, which meant the visible affordance and the accessible
 * name ("Switch to light mode") disagreed with each other.
 *
 * Both icons are always in the DOM and cross-fade past each other, so the swap
 * is a rotation rather than a substitution. Drawn inline rather than pulled
 * from the sprite because they need to animate independently.
 */

import type { Theme } from "../lib/useTheme";
import "./ThemeToggle.css";

export function ThemeToggle({
  theme,
  onToggle,
  className = "",
}: {
  theme: Theme;
  onToggle: () => void;
  className?: string;
}) {
  const next = theme === "dark" ? "light" : "dark";
  const label = `Switch to ${next} mode`;

  return (
    <button
      type="button"
      className={`theme-btn ${className}`.trim()}
      onClick={onToggle}
      aria-label={label}
      title={label}
      data-theme-state={theme}
    >
      <span className="theme-btn__icons" aria-hidden="true">
        {/* Sun — shown while the page is dark. */}
        <svg className="theme-btn__ico theme-btn__ico--sun" viewBox="0 0 24 24" focusable="false">
          <circle cx="12" cy="12" r="4.4" />
          {/* Eight rays, drawn rather than listed, so they stay evenly spaced. */}
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i * Math.PI) / 4;
            const [x, y] = [Math.cos(a), Math.sin(a)];
            return (
              <line
                key={i}
                x1={12 + x * 7.4}
                y1={12 + y * 7.4}
                x2={12 + x * 9.8}
                y2={12 + y * 9.8}
              />
            );
          })}
        </svg>
        {/* Moon — shown while the page is light. A crescent cut from a disc
            rather than a bezier, so it stays a clean shape at 16px. */}
        <svg className="theme-btn__ico theme-btn__ico--moon" viewBox="0 0 24 24" focusable="false">
          <path d="M20.1 14.6A8.6 8.6 0 0 1 9.4 3.9a8.6 8.6 0 1 0 10.7 10.7Z" />
        </svg>
      </span>
    </button>
  );
}

export default ThemeToggle;
