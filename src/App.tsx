import { GlowHorizon } from "./components/GlowHorizon";
import { JellyfishSection } from "./components/JellyfishSection";
import { PageBody } from "./components/PageBody";
import { ScrollModeSwitcher } from "./components/ScrollModeSwitcher";
import { SiteNav } from "./components/SiteNav";
import { useAnchorScroll } from "./lib/useAnchorScroll";
import { useLenis } from "./lib/useLenis";
import { useScrollMode } from "./lib/scrollMode";
import { useTheme } from "./lib/useTheme";

export default function App() {
  const { theme, toggle } = useTheme();
  const { mode, choose } = useScrollMode();

  const lenisRef = useLenis(mode === "cinematic");
  useAnchorScroll(mode, lenisRef);

  return (
    <>
      <SiteNav theme={theme} onToggleTheme={toggle} />

      <GlowHorizon
        eyebrow="Backstage · AI consultancy · Gloucester, UK"
        lines={["Welcome to your new", "AI-powered world"]}
        scrollTo="#title"
      />

      <div id="title">
        <JellyfishSection theme={theme} />
      </div>

      <PageBody mode={mode} />

      {/* Review scaffolding — goes when a mode is chosen. */}
      <ScrollModeSwitcher mode={mode} onChange={choose} />
    </>
  );
}
