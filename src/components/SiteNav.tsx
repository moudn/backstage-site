import { useCallback, useEffect, useRef, useState } from "react";
import type Lenis from "lenis";
import { NAV_LINKS } from "../data/content";
import type { Theme } from "../lib/useTheme";
import { ThemeToggle } from "./ThemeToggle";

/** Below this the links do not fit on one row, so they move behind a button.
 *  Kept in sync with the media queries in page.css by hand — matchMedia cannot
 *  read a stylesheet breakpoint, and duplicating it is less bad than shipping a
 *  layout that disagrees with its own JavaScript. */
const NARROW = "(max-width: 760px)";

/** Fixed nav that stays out of the way until the visitor has passed the hero.
 *
 *  On a wide screen the links sit in a row, as before. Below 760px they were
 *  wrapping onto a second and third line and turning the bar into a block of
 *  text three rows deep; there they collapse behind a button and open as a
 *  panel instead.
 *
 *  The panel is deliberately not a `<dialog>`. A modal dialog would be the
 *  textbook choice, but it renders in the top layer above everything including
 *  the backdrop-filter's source, so the glass has nothing to sample and the
 *  whole effect goes flat. This is a plain element with the page inerted
 *  behind it, which gets the same containment without that cost. */
export function SiteNav({
  theme,
  onToggleTheme,
  lenisRef,
}: {
  theme: Theme;
  onToggleTheme: () => void;
  lenisRef?: React.RefObject<Lenis | null>;
}) {
  const [visible, setVisible] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  /* The panel hangs from the bottom of the bar, and the bar's height is a
     clamp() of the viewport — so it cannot be a constant in the stylesheet
     without being wrong at most widths. Measured and published as --nav-h;
     the CSS carries a fallback for the frame before this runs. */
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const publish = () =>
      document.documentElement.style.setProperty("--nav-h", `${Math.round(bar.getBoundingClientRect().height)}px`);
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(bar);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.72);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Whether the button exists at all. Tracked in JS as well as CSS because an
     open panel has to close itself if the window widens past the breakpoint —
     otherwise the menu stays open, invisible, holding focus and keeping the
     page inert. */
  useEffect(() => {
    const mq = window.matchMedia(NARROW);
    const sync = () => {
      setNarrow(mq.matches);
      if (!mq.matches) setOpen(false);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    burgerRef.current?.focus();
  }, []);

  /* Everything that has to be true only while the panel is open. */
  useEffect(() => {
    if (!open) return;

    /* Lenis owns the scroll position, so `overflow: hidden` on the body does
       not stop it — it sets scroll programmatically. Stopping the instance is
       the only thing that actually holds the page still behind the panel.
       Captured into a local so the cleanup restarts the same instance it
       stopped, rather than whatever the ref happens to hold by then. */
    const lenis = lenisRef?.current;
    lenis?.stop();

    /* Inert the rest of the page rather than trapping focus by hand. Tab then
       cannot leave the panel, screen readers skip the page behind it, and
       there is no keydown handler to get subtly wrong. */
    const root = document.getElementById("root");
    const siblings = root ? ([...root.children] as HTMLElement[]) : [];
    /* Both the bar and the panel are marked, because they are now siblings
       rather than one containing the other. */
    const inerted = siblings.filter((el) => !el.hasAttribute("data-nav-layer"));
    inerted.forEach((el) => (el.inert = true));

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);

    /* Focus the panel itself, not its first link: announcing the menu before
       reading its first item is the less disorienting of the two. */
    panelRef.current?.focus();

    return () => {
      lenis?.start();
      inerted.forEach((el) => (el.inert = false));
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close, lenisRef]);

  /* A link closes the menu, but the anchor has to be allowed through first —
     useAnchorScroll routes it via Lenis, and Lenis has just been restarted by
     the cleanup above. Closing on click rather than preventing it keeps that
     one code path instead of two. */
  const onLinkClick = () => setOpen(false);

  return (
    <>
    <header
      className="nav"
      data-nav-layer=""
      data-visible={visible}
      inert={!visible || undefined}
    >
      <div className="nav__inner" ref={barRef}>
        <a className="nav__brand" href="#top" onClick={onLinkClick}>
          <span className="nav__dot" aria-hidden="true" />
          <span className="nav__word">Backstage</span>
        </a>

        <nav className="nav__links">
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
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </nav>

        {/* Three bars that become a cross. aria-hidden because the button's
            accessible name already says what it does — a screen reader
            announcing "menu, menu" is the usual result of labelling both. */}
        <button
          ref={burgerRef}
          type="button"
          className="nav__burger"
          aria-expanded={open}
          aria-controls="nav-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="nav__burger-box" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>
    </header>

    {/* OUTSIDE the header, and that is not a style choice.
     *
     * .nav carries a transform for its reveal, and a transformed element
     * becomes the containing block for any `position: fixed` descendant — so
     * inside the header the panel resolved its `inset` against a 66px-tall bar
     * instead of the viewport and ended up a sliver hanging above the screen.
     * Out here it is fixed to the viewport as intended. It still follows the
     * header in DOM order, so the tab order is unchanged.
     *
     * Rendered whenever the layout is narrow, not only while open, so the
     * panel has a resting state to transition from. `inert` when closed keeps
     * it out of the tab order without `display: none`, which would kill the
     * transition. */}
    {narrow && (
        <div
          id="nav-menu"
          ref={panelRef}
          data-nav-layer=""
          className="nav__panel"
          data-open={open}
          inert={!open || undefined}
          tabIndex={-1}
          aria-label="Menu"
        >
          <div className="nav__panel-sheen" aria-hidden="true" />
          <nav className="nav__panel-links">
            {NAV_LINKS.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                onClick={onLinkClick}
                style={{ transitionDelay: `${open ? 90 + i * 55 : 0}ms` }}
              >
                <span className="nav__panel-n" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {l.label}
              </a>
            ))}
          </nav>

          <div
            className="nav__panel-foot"
            style={{ transitionDelay: `${open ? 90 + NAV_LINKS.length * 55 : 0}ms` }}
          >
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            <span className="nav__panel-meta">AI consultancy · UK</span>
          </div>
        </div>
      )}
    </>
  );
}

export default SiteNav;
