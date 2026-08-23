import { GlowHorizon } from "./components/GlowHorizon";
import { JellyfishSection } from "./components/JellyfishSection";
import { JellyfishBackdrop } from "./components/JellyfishBackdrop";
import { PageBody } from "./components/PageBody";
import { SiteNav } from "./components/SiteNav";
import { SplashCursor } from "./components/SplashCursor";
import { HERO } from "./data/content";
import { useAnchorScroll } from "./lib/useAnchorScroll";
import { useLenis } from "./lib/useLenis";
import { useTheme } from "./lib/useTheme";

export default function App() {
  const { theme, toggle } = useTheme();

  /* Lenis drives the scroll for the whole page. Everything below the title
   * card is paced against scroll position rather than snapped to it. */
  const lenisRef = useLenis();
  useAnchorScroll(lenisRef);

  return (
    <>
      <SplashCursor theme={theme} />
      <SiteNav theme={theme} onToggleTheme={toggle} lenisRef={lenisRef} />

      <GlowHorizon eyebrow={HERO.eyebrow} lines={HERO.lines} scrollTo="#title" />

      <div id="title">
        <JellyfishSection theme={theme} />
      </div>

      {/* Drifts behind everything after the title card. */}
      <JellyfishBackdrop theme={theme} />
      <PageBody />
    </>
  );
}
