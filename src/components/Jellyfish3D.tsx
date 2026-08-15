/* The jellyfish — a procedural creature built entirely in code: a shaded,
 * ribbed, translucent bell plus shader-driven tentacles and oral arms. No
 * model file, no textures, no footage.
 *
 * Adapted from the supplied component in two ways that mattered:
 *
 *  1. Every colour is a uniform now rather than a constant baked into the
 *     GLSL, so the creature can be recoloured for light and dark.
 *  2. Light mode carries a translucency boost. The same alpha that reads as
 *     a delicate creature on near-black is close to invisible on near-white,
 *     so the palette swap alone isn't enough.
 */

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { Theme } from "../lib/useTheme";

/* ── Palettes ────────────────────────────────────────────────────────────── */
type Palette = {
  bellApex: string;
  bellMid: string;
  bellEdge: string;
  bellSpeck: string;
  rimTint: string;
  core: string;
  tentacleTop: string;
  tentacleTip: string;
  armTop: string;
  armTip: string;
  /** Multiplies every alpha in the creature. */
  opacity: number;
};

/* The original component's palette, for reference, because it is the thing
 * light mode is meant to look like:
 *
 *   ground  #1a1a22   bell  #f1f1f7 → #e7e6f0 → #ddd9ea → #d2cde2
 *   core    #ff6fbf   tentacles #e9b6e6 / #f3d9f0   arms #f7d6ef / #e79fd8
 *
 * Note the ground. That pearl bell was drawn against near-black, where a pale
 * translucent dome glows. Dropped unchanged onto this page's near-white it
 * disappears — same colours, no contrast. So light mode keeps the original's
 * character (pearl dome, hot-pink core, pale pink trailing parts) and darkens
 * only the dome enough to hold an edge against #fafaff. Everything that made
 * the original read as a jellyfish rather than a purple blob is unchanged.
 */
const PALETTES: Record<Theme, Palette> = {
  /* Dark: the original's pink pulled through the site's violet, so the
     creature belongs to this page rather than looking borrowed. */
  dark: {
    bellApex: "#5B2CC9",
    bellMid: "#9B5CF0",
    bellEdge: "#E4B5F0",
    bellSpeck: "#2A1065",
    rimTint: "#FF8FD0",
    core: "#FF6FBF",
    tentacleTop: "#E9B6E6",
    tentacleTip: "#F7D6EF",
    armTop: "#F3D9F0",
    armTip: "#D98FD8",
    // Under 1 the bell stays translucent enough for BACKSTAGE to read through
    // it as it passes behind. At 1 the word disappears into the dome, and the
    // creature cropping the word is the point of the composition.
    opacity: 0.82,
  },
  /* Light: the original, with the dome weighted to survive a white page. */
  light: {
    bellApex: "#B9B4CE",
    bellMid: "#C8C2D8",
    bellEdge: "#A79FC4",
    bellSpeck: "#1A1A22",
    rimTint: "#BDB3E6",
    core: "#FF6FBF",
    tentacleTop: "#E79FD8",
    tentacleTip: "#F3D9F0",
    armTop: "#F7D6EF",
    armTip: "#DE8FC8",
    opacity: 1.15,
  },
};

/* The creature's undulation, and the clock every shader reads from.
 *
 * Under prefers-reduced-motion the clock is frozen rather than the component
 * removed: a still jellyfish is the right thing to show, and the rest of this
 * section already stops its orbit and its bubbles for the same visitors. The
 * frozen value is deliberately not 0 — at t=0 the tentacles are perfectly
 * straight and it reads as a diagram rather than a creature. */
const STILL_POSE = 4.2;

function useTime() {
  const still = useRef(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const t = useRef({ value: still.current ? STILL_POSE : 0 });
  useFrame((s) => {
    if (!still.current) t.current.value = s.clock.elapsedTime;
  });
  return t.current;
}

/* ── Bell ─────────────────────────────────────────────────────────────────── */
const BELL_VERT = /* glsl */ `
  varying vec3 vPos; varying vec3 vNormal; varying vec3 vView;
  void main(){
    vPos = position;
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position,1.0);
    vView = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

const BELL_FRAG = /* glsl */ `
  precision highp float;
  uniform vec3 uApex, uMid, uEdge, uSpeck, uRimTint;
  uniform float uOpacity;
  varying vec3 vPos; varying vec3 vNormal; varying vec3 vView;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
  float noise(vec2 p){
    vec2 i=floor(p), f=fract(p);
    float a=hash(i), b=hash(i+vec2(1.,0.)), c=hash(i+vec2(0.,1.)), d=hash(i+vec2(1.,1.));
    vec2 u=f*f*(3.-2.*f);
    return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
  }

  void main(){
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vView);
    float fres = pow(1.0 - max(dot(N,V),0.0), 2.4);

    float h = clamp((vPos.y + 0.40)/1.40, 0.0, 1.0);  // 1 apex -> 0 margin
    float ang = atan(vPos.z, vPos.x);

    vec3 col = mix(uEdge, uMid, smoothstep(0.0,0.5,h));
    col = mix(col, uApex, smoothstep(0.45,1.0,h));

    // radial ribs, faded out at both apex and margin
    float ribs = abs(fract(ang/(2.0*3.14159265)*18.0) - 0.5) * 2.0;
    float ribLine = smoothstep(0.80, 0.99, ribs);
    float ribMask = smoothstep(0.98,0.55,h) * smoothstep(-0.02,0.22,h);
    col *= 1.0 - ribLine * 0.55 * ribMask;

    // The inward-facing wall is drawn too (DoubleSide). Left alone its dark
    // mottling punches a hard wobbling shadow through the dome, so on back
    // faces drop the mottling and fade the wall right down.
    float backw = gl_FrontFacing ? 1.0 : 0.0;

    float band = smoothstep(0.34, 0.02, h);
    float spots = noise(vec2(ang*7.0, h*12.0));
    float wart = smoothstep(0.58, 0.86, spots) * band;
    col = mix(col, uSpeck, wart*0.85*backw);

    col += fres * uRimTint * 0.55;
    col += (1.0 - fres) * uApex * 0.18 * (0.5 + 0.5*h);

    float alpha = 0.50 + fres*0.45 + ribLine*ribMask*0.22 + wart*0.35*backw;
    alpha *= mix(0.30, 1.0, backw);
    alpha = clamp(alpha * uOpacity, 0.0, 0.96);
    gl_FragColor = vec4(col, alpha);
  }
`;

function Bell({ time, palette }: { time: { value: number }; palette: Palette }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: BELL_VERT,
        fragmentShader: BELL_FRAG,
        uniforms: {
          uTime: time,
          uApex: { value: new THREE.Color(palette.bellApex) },
          uMid: { value: new THREE.Color(palette.bellMid) },
          uEdge: { value: new THREE.Color(palette.bellEdge) },
          uSpeck: { value: new THREE.Color(palette.bellSpeck) },
          uRimTint: { value: new THREE.Color(palette.rimTint) },
          uOpacity: { value: palette.opacity },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [time, palette]
  );
  return (
    <mesh material={mat} scale={[1, 0.84, 1]}>
      <sphereGeometry args={[1, 128, 128, 0, Math.PI * 2, 0, 1.98]} />
    </mesh>
  );
}

/* Inner bioluminescent core — additive, reads through the translucent bell. */
function Glow({ palette }: { palette: Palette }) {
  return (
    <mesh position={[0, 0.18, 0]}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshBasicMaterial
        color={palette.core}
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

/* ── Strands ──────────────────────────────────────────────────────────────── */
const STRAND_VERT = /* glsl */ `
  uniform float uTime, uLen, uPhase, uAmp, uFreq;
  varying float vK; varying vec3 vNormal; varying vec3 vView; varying float vWorldY;
  void main(){
    vec3 p = position;
    float k = clamp(-p.y / uLen, 0.0, 1.0);
    float amp = k*k*uAmp;
    p.x += sin(uTime*1.5 + k*uFreq + uPhase) * amp;
    p.z += cos(uTime*1.2 + k*uFreq*0.9 + uPhase*1.3) * amp;
    vK = k;
    vWorldY = (modelMatrix * vec4(p,1.0)).y;
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(p,1.0);
    vView = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

const STRAND_FRAG = /* glsl */ `
  precision highp float;
  uniform vec3 uTop, uTip; uniform float uOpacity; uniform vec2 uFade, uFadeTop;
  varying float vK; varying vec3 vNormal; varying vec3 vView; varying float vWorldY;
  void main(){
    float fres = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)),0.0), 1.6);
    // Dissolve at the bottom so strands trail off instead of being clipped
    // flat by the frame edge, and at the top so their attachment hides up
    // inside the bell rather than meeting it at a hard ring.
    float vis = smoothstep(uFade.x, uFade.y, vWorldY)
              * smoothstep(uFadeTop.y, uFadeTop.x, vWorldY);
    vec3 col = mix(uTop, uTip, vK) + fres*0.25;
    float alpha = ((1.0 - vK*0.92) * uOpacity + fres*0.12) * vis;
    gl_FragColor = vec4(col, clamp(alpha,0.0,1.0));
  }
`;

function strandGeometry(length: number, thickness: number, curl: number) {
  const seg = 40;
  const radial = 6;
  const spine: THREE.Vector3[] = [];
  for (let i = 0; i <= seg; i++) {
    const t = i / seg;
    spine.push(
      new THREE.Vector3(Math.sin(t * 3) * curl * t, -t * length, Math.cos(t * 2) * curl * t)
    );
  }
  const curve = new THREE.CatmullRomCurve3(spine);
  const frames = curve.computeFrenetFrames(seg, false);
  const pos: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= seg; i++) {
    const t = i / seg;
    const p = curve.getPointAt(t);
    const r = thickness * (1 - Math.pow(t, 0.75));
    const Nf = frames.normals[i];
    const Bf = frames.binormals[i];
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      const c = Math.cos(a);
      const s = Math.sin(a);
      pos.push(
        p.x + (c * Nf.x + s * Bf.x) * r,
        p.y + (c * Nf.y + s * Bf.y) * r,
        p.z + (c * Nf.z + s * Bf.z) * r
      );
    }
  }
  for (let i = 0; i < seg; i++)
    for (let j = 0; j < radial; j++) {
      const a = i * (radial + 1) + j;
      const b = a + radial + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

type StrandProps = {
  time: { value: number };
  angle: number;
  radius: number;
  yOffset: number;
  length: number;
  thickness: number;
  curl: number;
  amp: number;
  freq: number;
  phase: number;
  top: string;
  tip: string;
  opacity: number;
};

function Strand({
  time, angle, radius, yOffset, length, thickness, curl, amp, freq, phase, top, tip, opacity,
}: StrandProps) {
  const geometry = useMemo(
    () => strandGeometry(length, thickness, curl),
    [length, thickness, curl]
  );
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: STRAND_VERT,
        fragmentShader: STRAND_FRAG,
        uniforms: {
          uTime: time,
          uLen: { value: length },
          uPhase: { value: phase },
          uAmp: { value: amp },
          uFreq: { value: freq },
          uTop: { value: new THREE.Color(top) },
          uTip: { value: new THREE.Color(tip) },
          uOpacity: { value: opacity },
          uFade: { value: new THREE.Vector2(-1.85, -0.7) },
          uFadeTop: { value: new THREE.Vector2(-0.62, -0.22) },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [time, length, phase, amp, freq, top, tip, opacity]
  );
  return (
    <mesh
      geometry={geometry}
      material={mat}
      position={[Math.cos(angle) * radius, yOffset, Math.sin(angle) * radius]}
    />
  );
}

/* The creature. It holds the centre; the steady turn is locked to the word
 * ring's period so the whole thing reads as one camera orbiting the scene. */
function Jelly({ loop, palette, quality }: { loop: number; palette: Palette; quality: "high" | "low" }) {
  const time = useTime();
  const grp = useRef<THREE.Group>(null!);

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    grp.current.rotation.y = -(t / loop) * Math.PI * 2;
    grp.current.position.y = Math.sin(t * 0.6) * 0.08;
    const k = Math.sin(t * 1.7);
    grp.current.scale.set(1 + k * 0.05, 1 - k * 0.06, 1 + k * 0.05);
  });

  const tentacleCount = quality === "high" ? 28 : 14;
  const armCount = quality === "high" ? 8 : 5;

  const tentacles = useMemo(
    () =>
      Array.from({ length: tentacleCount }, (_, i) => ({
        angle: (i / tentacleCount) * Math.PI * 2,
        phase: i * 0.5,
      })),
    [tentacleCount]
  );
  const arms = useMemo(
    () =>
      Array.from({ length: armCount }, (_, i) => ({
        angle: (i / armCount) * Math.PI * 2,
        phase: i * 1.0 + 0.4,
      })),
    [armCount]
  );

  return (
    <group ref={grp}>
      <Bell time={time} palette={palette} />
      <Glow palette={palette} />
      {tentacles.map((s, i) => (
        <Strand
          key={`t${i}`} time={time} angle={s.angle} radius={0.82} yOffset={-0.25}
          length={4.2} thickness={0.016} curl={0.05} amp={0.5} freq={7.0} phase={s.phase}
          top={palette.tentacleTop} tip={palette.tentacleTip} opacity={0.55 * palette.opacity}
        />
      ))}
      {arms.map((s, i) => (
        <Strand
          key={`a${i}`} time={time} angle={s.angle} radius={0.22} yOffset={-0.1}
          length={2.0} thickness={0.07} curl={0.14} amp={0.32} freq={10.0} phase={s.phase}
          top={palette.armTop} tip={palette.armTip} opacity={0.72 * palette.opacity}
        />
      ))}
    </group>
  );
}

export function Jellyfish3D({
  loop = 20,
  theme,
  quality = "high",
}: {
  loop?: number;
  theme: Theme;
  quality?: "high" | "low";
}) {
  const palette = PALETTES[theme];
  return (
    <Canvas
      flat
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
      camera={{ position: [0, 0.4, 6], fov: 34 }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
    >
      <ambientLight intensity={1} />
      <Jelly loop={loop} palette={palette} quality={quality} />
    </Canvas>
  );
}

export default Jellyfish3D;
