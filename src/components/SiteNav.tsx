import { useEffect, useState } from "react";
import { NAV_LINKS } from "../data/content";
import type { Theme } from "../lib/useTheme";

/** Fixed nav that stays out of the way until the visitor has passed the hero.
 *  It is kept in the DOM the whole time (hidden with opacity/transform rather
 *  than unmounted) so its links keep their place in the tab order. */
export function SiteNav({ theme, onToggleTheme }: { theme: Theme; onToggleTheme: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.72);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="nav" data-visible={visible} inert={!visible || undefined}>
      <div className="nav__inner">
        <a className="nav__brand" href="#top">
          <span className="nav__dot" aria-hidden="true" />
          <span className="nav__word">Backstage</span>
        </a>
        <nav className="nav__links">
          {/* Two stacked copies of the label inside a mask: the first slides
              up and out, the second arrives from below. The duplicate is
              aria-hidden and the real one keeps the accessible name, so this
              reads as one link rather than the label twice. */}
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} data-strong={l.strong ? "true" : undefined}>
              <span className="nav__label">
                <span className="nav__label-line">{l.label}</span>
                <span className="nav__label-line nav__label-line--in" aria-hidden="true">
                  {l.label}
                </span>
              </span>
            </a>
          ))}
          <button
            type="button"
            className="theme-btn"
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            <span aria-hidden="true" className="nav__dot" style={{ width: 8, height: 8 }} />
            {theme === "dark" ? "Dark" : "Light"}
          </button>
        </nav>
      </div>
    </header>
  );
}

export default SiteNav;
