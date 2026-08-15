/* The jellyfish section — the site's title card.
 *
 * The word ring is a rigid 3D world the camera orbits: BACKSTAGE is pinned at
 * five fixed seats around a vertical ring standing about the creature, each
 * facing inward. One container turns steadily, which reads as the viewpoint
 * circling — whichever copy currently faces us swells to full size, sweeps
 * across with real turntable perspective, then turns away as the next rounds
 * into view. The word passes *behind* the jellyfish, so the creature crops it.
 *
 * Everything from the original demo that belonged to a different, fictional
 * studio — its nav, manifesto, rotating captions, side rulers, audio pill,
 * drifting squares, film grain — is gone. What's left is the creature, the
 * ring, and the ambience that serves them.
 */

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { Theme } from "../lib/useTheme";

/* three.js is ~900KB of the bundle. Splitting it out means the hero — which
 * is pure CSS — paints without waiting on a 3D library it never uses, and the
 * download only happens once someone scrolls this far. */
const Jellyfish3D = lazy(() =>
  import("./Jellyfish3D").then((m) => ({ default: m.Jellyfish3D }))
);

const WORD = "BACKSTAGE";
const RING_N = 5;                       // seats on the ring
const RING_STEP = 360 / RING_N;
const LOOP = 20;                        // seconds for one full orbit
const RING_R = 760;                     // px from hub to each word
const PERSP = 2200;                     // px camera distance

export function JellyfishSection({ theme }: { theme: Theme }) {
  const ref = useRef<HTMLElement>(null);
  const [live, setLive] = useState(false);
  const [quality, setQuality] = useState<"high" | "low">("high");

  // Only mount the canvas while the section is near the viewport — a WebGL
  // scene running off-screen for the whole visit is a needless battery drain
  // and keeps the main thread busy during the rest of the page.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setLive(entry.isIntersecting),
      { rootMargin: "200px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Thin the creature out on small screens and low core counts rather than
  // shipping 36 shader meshes to a phone.
  useEffect(() => {
    const small = window.matchMedia("(max-width: 820px)").matches;
    const weak = (navigator.hardwareConcurrency ?? 8) <= 4;
    if (small || weak) setQuality("low");
  }, []);

  const seats = Array.from({ length: RING_N }, (_, i) => i);

  return (
    <section
      ref={ref}
      aria-label={WORD}
      className="jelly-panel"
      style={{
        position: "relative",
        height: "100svh",
        minHeight: 560,
        width: "100%",
        overflow: "hidden",
        isolation: "isolate",
        background: "var(--bg)",
      }}
    >
      <style>{RING_CSS}</style>

      {/* ── the word ring, behind the creature ─────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          perspective: `${PERSP}px`,
          perspectiveOrigin: "50% 46%",
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <div className="jf-stage" style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d" }}>
          {seats.map((i) => (
            <span
              key={i}
              className="jf-word"
              style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                font: "900 clamp(64px, 17.5vh, 210px)/1 Helvetica Neue,Helvetica,Arial Black,sans-serif",
                letterSpacing: "-0.05em",
                whiteSpace: "nowrap",
                color: "var(--text)",
                opacity: 0,
                // Pin at its seat, then face inward so the readable copy
                // rounds the far side and reads through the centre.
                transform: `rotateY(${(i * RING_STEP).toFixed(2)}deg) translateZ(${RING_R}px) rotateY(180deg)`,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                animationDelay: `${((-LOOP * ((RING_N - i) % RING_N)) / RING_N - LOOP / 2).toFixed(3)}s`,
              }}
            >
              <span
                className="jf-rise"
                style={{
                  animationDelay: `${((-LOOP * ((RING_N - i) % RING_N)) / RING_N - LOOP / 2).toFixed(3)}s`,
                }}
              >
                <span style={{ display: "inline-block", transform: "scaleX(0.82)" }}>{WORD}</span>
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* ── the creature, front and centre ─────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "43%",
          transform: "translate(-50%, -50%)",
          width: "min(74vh, 92vw)",
          height: "94svh",
          zIndex: 2,
          pointerEvents: "none",
        }}
      >
        {live && (
          <Suspense fallback={null}>
            <Jellyfish3D loop={LOOP} theme={theme} quality={quality} />
          </Suspense>
        )}
      </div>

      {/* ── ambient bubbles ────────────────────────────────────────────── */}
      {[
        { left: "22%", size: "0.9vh", delay: "0s", dur: "13s" },
        { left: "71%", size: "1.4vh", delay: "4s", dur: "16s" },
        { left: "58%", size: "0.7vh", delay: "8s", dur: "11s" },
        { left: "38%", size: "1.1vh", delay: "6s", dur: "15s" },
      ].map((b, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="jf-bubble"
          style={{
            left: b.left,
            width: b.size,
            height: b.size,
            animationDuration: b.dur,
            animationDelay: b.delay,
          }}
        />
      ))}

      {/* h2, not h1: GlowHorizon's headline is the page's h1 and comes first.
          Two h1s on one page is a broken outline, and this reads as the
          company's statement rather than the page's title. */}
      <div className="jf-slogan">
        <h2 className="jf-slogan__line">
          We work backstage, so you can take centre stage.
        </h2>
        <p className="jf-slogan__meta">An AI consultancy · UK</p>
      </div>

    </section>
  );
}

const RING_CSS = `
.jf-stage{ animation: jf-orbit ${LOOP}s linear infinite; will-change: transform }
.jf-word{ animation: jf-fade ${LOOP}s linear infinite; will-change: opacity }
.jf-rise{ display:inline-block; animation: jf-rise ${LOOP}s linear infinite; will-change: transform }

@keyframes jf-orbit{ from{transform:rotateY(0deg)} to{transform:rotateY(-360deg)} }

/* Peaks sharply at dead centre and falls away either side. The original held
   full brightness for a while after passing centre, which with five copies of
   the SAME word left two on screen at once at different brightnesses — that
   reads as a rendering fault rather than repetition. Five seats are 20% of the
   loop apart, so a window near that keeps one copy clearly dominant with only
   a brief crossfade at the hand-over. */
@keyframes jf-fade{
  0%{opacity:1}
  12%{opacity:0}
  88%{opacity:0}
  100%{opacity:1}
}

/* Rises into place as it turns into frame, settling before centre. */
@keyframes jf-rise{
  0%{transform:translateY(0)}
  21%{transform:translateY(0)}
  50%{transform:translateY(28vh)}
  78%{transform:translateY(28vh);animation-timing-function:ease-out}
  87%{transform:translateY(0)}
  100%{transform:translateY(0)}
}

/* The slogan sits over the foot of the creature, so it needs its own footing:
   a soft wash of the page colour behind it keeps the type legible without
   drawing a visible box across the artwork. */
.jf-slogan{
  position:absolute;
  left:50%;
  bottom:clamp(20px,4.5vh,54px);
  transform:translateX(-50%);
  z-index:3;
  width:min(760px, 88vw);
  text-align:center;
  padding:clamp(14px,2vh,22px) clamp(16px,3vw,28px) clamp(10px,1.4vh,16px);
  background:radial-gradient(120% 140% at 50% 60%, var(--bg) 38%, transparent 78%);
  pointer-events:none;
}
.jf-slogan__line{
  margin:0 0 clamp(8px,1.2vh,14px);
  font:400 clamp(21px,3.1vw,38px)/1.22 Georgia,'Times New Roman',serif;
  letter-spacing:-0.012em;
  color:var(--text);
  text-wrap:balance;
}
.jf-slogan__meta{
  margin:0;
  font:400 11px/1 ui-monospace,SFMono-Regular,Menlo,monospace;
  letter-spacing:0.22em;
  text-transform:uppercase;
  color:var(--text-3);
}

.jf-bubble{
  position:absolute; bottom:-4vh; border-radius:50%;
  background: color-mix(in srgb, var(--accent) 34%, transparent);
  box-shadow: 0 0 6px color-mix(in srgb, var(--accent) 40%, transparent);
  z-index:1; animation-name: jf-bubble; animation-timing-function: linear;
  animation-iteration-count: infinite; will-change: transform, opacity;
}
@keyframes jf-bubble{
  0%{transform:translateY(0);opacity:0}
  12%{opacity:.7} 80%{opacity:.5}
  100%{transform:translateY(-108svh) translateX(2vh);opacity:0}
}

/* Hold one readable frame: stop the orbit with the first copy facing us. */
@media (prefers-reduced-motion: reduce){
  .jf-stage{ animation:none !important; transform:rotateY(0deg) !important }
  .jf-word{ animation:none !important; opacity:0 !important }
  .jf-word:first-of-type{ opacity:1 !important }
  .jf-rise{ animation:none !important; transform:none !important }
  .jf-bubble{ animation:none !important; opacity:0 !important }
}
`;

export default JellyfishSection;
