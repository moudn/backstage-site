/* The four small charts, one per figure.
 *
 * Hand-drawn rather than a charting library, and that is a decision with
 * history behind it: the last third-party visual dependency added to this page
 * (metal-fx, for a ring around a button) coincided with the site being flagged
 * as malicious by a scanner, and was removed. A chart library for four static
 * shapes would be tens of kilobytes and another supply-chain surface for
 * something a handful of divs can do.
 *
 * Three of the four are HTML and CSS, not SVG. The first attempt drew all four
 * as SVG and it failed twice over: an SVG scales its own text, so a label sized
 * to read on a 500px desktop card came out at 7px on a phone, and a viewBox
 * wide enough to span the card squashed a bar chart into a row of blobs. Laid
 * out as flex columns instead, the bars take their height from a percentage and
 * the labels are real text at a fixed size, so both stay right at every width.
 * Only the adoption line is SVG, because a stroked path is the one shape here
 * that HTML cannot draw honestly.
 *
 * Each chart encodes its own figure rather than decorating it — the 39 bar is
 * 39 units tall against the same scale as the 21 and the 16, the waffle has ten
 * of a hundred cells filled. Every chart also carries the numbers it is drawing
 * as visible labels: a reader should be able to take the meaning off the shape
 * without reading back up to the sentence.
 *
 * All of them are aria-hidden, labels included. Everything they say is already
 * in the claim and the detail beside them, so announcing the shapes as well is
 * the same fact twice.
 */

type On = { on: boolean };

/* A column: the value above, the bar itself, the name below. `grow` is the
   bar's height as a fraction of the plot, already scaled by the caller so all
   the columns in one chart share a denominator. */
function Column({
  grow,
  value,
  name,
  lit,
  delay,
  on,
}: {
  grow: number;
  value: string;
  name: string;
  lit: boolean;
  delay: number;
  on: boolean;
}) {
  return (
    <div className="evc__col">
      <span className="evc__num" style={{ opacity: on ? 1 : 0, transitionDelay: `${delay + 260}ms` }}>
        {value}
      </span>
      <div className="evc__track">
        <div
          className={`evc__bar${lit ? " is-lit" : ""}`}
          style={{
            height: `${grow * 100}%`,
            transform: on ? "scaleY(1)" : "scaleY(0)",
            transitionDelay: `${delay}ms`,
          }}
        />
      </div>
      <span className="evc__name">{name}</span>
    </div>
  );
}

/** Barriers to adoption: 39 / 21 / 16, all against one scale so the gap is the point. */
function Bars({ on }: On) {
  /* 44, not 39, so the tallest bar stops short of the ceiling and reads as a
     measurement rather than something that ran out of room. */
  const max = 44;
  const data = [
    { v: 39, name: "Where it helps" },
    { v: 21, name: "Cost" },
    { v: 16, name: "Skills" },
  ];
  return (
    <div className="evc evc--cols" aria-hidden="true">
      {data.map((d, i) => (
        <Column
          key={d.name}
          grow={d.v / max}
          value={`${d.v}%`}
          name={d.name}
          lit={i === 0}
          delay={i * 110}
          on={on}
        />
      ))}
    </div>
  );
}

/** Adoption over time: about 12% in late 2023 to 35% in June 2026. */
function Rise({ on }: On) {
  /* A wide, short viewBox with no text in it. The two endpoint labels are HTML
     underneath, so they keep their size while the drawing stretches. */
  const W = 200;
  const H = 58;
  /* Four points. Only the endpoints are quoted as figures anywhere; the two
     between are interpolated, and exist so the line has a shape rather than
     being one straight segment. */
  const pts = [12, 19, 27, 35];
  const max = 40;
  const x = (i: number) => 5 + (i * (W - 10)) / (pts.length - 1);
  const y = (v: number) => H - 5 - (v / max) * (H - 12);
  const d = pts.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(v)}`).join(" ");
  return (
    <div className="evc evc--line" aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="evc__svg" focusable="false">
        {/* The area under the line, so the rise reads as volume as well as
            slope. It closes to the baseline, not to the bottom of the box. */}
        <path
          className="evc__area"
          d={`${d} L ${x(pts.length - 1)} ${H - 5} L ${x(0)} ${H - 5} Z`}
          style={{ opacity: on ? 0.15 : 0, transitionDelay: "300ms" }}
        />
        <path
          className="evc__line"
          d={d}
          fill="none"
          /* preserveAspectRatio="none" stretches the box, which would stretch
             the stroke with it. non-scaling-stroke keeps it 2px whatever the
             card does. */
          vectorEffect="non-scaling-stroke"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ strokeDasharray: 400, strokeDashoffset: on ? 0 : 400 }}
        />
        {pts.map((v, i) => (
          <circle
            key={i}
            className="evc__dot"
            cx={x(i)}
            cy={y(v)}
            /* Stretched horizontally by the same amount the box is, so an r of
               2 would come out as an oval. Drawn as a tiny rect instead would
               have the same problem; the fix is to counter-scale, which is
               what the vector-effect above does for the stroke and cannot do
               for a fill. So: keep them small enough that the ovalling is not
               readable, and put the weight on the last one. */
            r={i === pts.length - 1 ? 3 : 1.8}
            style={{ opacity: on ? 1 : 0, transitionDelay: `${460 + i * 90}ms` }}
          />
        ))}
      </svg>
      <div className="evc__ends">
        <span className="evc__name">Late 2023 · 12%</span>
        <span className="evc__name">June 2026 · 35%</span>
      </div>
    </div>
  );
}

/** Depth of use: ten cells in a hundred, laid out twenty across to fit a strip. */
function Waffle({ on }: On) {
  const COLS = 20;
  const TOTAL = 100;
  const LIT = 10;
  return (
    <div className="evc evc--waffle" aria-hidden="true">
      <div className="evc__cells" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
        {Array.from({ length: TOTAL }, (_, i) => {
          const lit = i < LIT;
          return (
            <span
              key={i}
              className={`evc__cell${lit ? " is-lit" : ""}`}
              style={{
                opacity: on ? (lit ? 1 : 0.16) : 0,
                /* The ten land first and in order, so the eye counts them; the
                   rest wash in together behind, as the denominator. */
                transitionDelay: lit ? `${i * 60}ms` : `${620 + (i % COLS) * 12}ms`,
              }}
            />
          );
        })}
      </div>
      <div className="evc__ends">
        <span className="evc__name">10 extensive</span>
        <span className="evc__name">90 narrower</span>
      </div>
    </div>
  );
}

/** Three in four: the share of adopters reporting a productivity gain.
 *
 * Four blocks rather than the hundred the waffle uses. 75% is a proportion the
 * eye can check at a glance if the denominator is small enough to count, and
 * drawing it as 75 lit cells out of 100 would put two near-identical grids on
 * one screen — this card sits diagonally opposite the waffle. */
function Share({ on }: On) {
  const CELLS = 4;
  const LIT = 3;
  return (
    <div className="evc evc--share" aria-hidden="true">
      <div className="evc__blocks">
        {Array.from({ length: CELLS }, (_, i) => (
          <span
            key={i}
            className={`evc__block${i < LIT ? " is-lit" : ""}`}
            style={{
              opacity: on ? (i < LIT ? 1 : 0.18) : 0,
              transform: on ? "translateY(0)" : "translateY(10px)",
              transitionDelay: `${i * 130}ms`,
            }}
          />
        ))}
      </div>
      <div className="evc__ends">
        <span className="evc__name">3 said yes</span>
        <span className="evc__name">1 did not</span>
      </div>
    </div>
  );
}

export function EvidenceChart({ kind, on }: { kind: string; on: boolean }) {
  if (kind === "bars") return <Bars on={on} />;
  if (kind === "rise") return <Rise on={on} />;
  if (kind === "waffle") return <Waffle on={on} />;
  return <Share on={on} />;
}

export default EvidenceChart;
