/* The cost-of-doing-nothing calculator.
 *
 * Native <input type="range">, not a custom-built slider on pointer events.
 * That is the whole accessibility story in one decision: a real range input
 * arrives with arrow keys, Home and End, Page Up and Down, a value announced
 * as a percentage of its span, and the platform's own touch handling on iOS
 * and Android. Every hand-rolled slider on the web reimplements a fraction of
 * that badly. The look is entirely in CSS — ::-webkit-slider-thumb and
 * ::-moz-range-thumb — so nothing about the appearance costs us the behaviour.
 *
 * The figures animate toward their target rather than snapping, for the same
 * reason the stat cards count up: a number that slides makes it obvious that
 * moving the slider changed something. It is a spring, not a fixed-duration
 * tween, so dragging fast does not queue up a backlog of animations — each
 * frame just moves the displayed value a proportion of the way to wherever the
 * target now is.
 */

import { useEffect, useRef, useState } from "react";
import { CALCULATOR } from "../data/content";
import "./Calculator.css";

/** Eases the displayed number toward `target`. Returns the current value. */
function useEased(target: number) {
  const [shown, setShown] = useState(target);
  const raf = useRef(0);
  const current = useRef(target);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      current.current = target;
      setShown(target);
      return;
    }
    const tick = () => {
      const gap = target - current.current;
      /* Close enough that another frame would not change the rendered digits.
         Snapping here rather than easing forever is what lets the loop stop. */
      if (Math.abs(gap) < 0.6) {
        current.current = target;
        setShown(target);
        return;
      }
      current.current += gap * 0.18;
      setShown(current.current);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);

  return shown;
}

const money = (n: number) =>
  `£${Math.round(n).toLocaleString("en-GB", { maximumFractionDigits: 0 })}`;

function Slider({
  input,
  value,
  onChange,
}: {
  input: (typeof CALCULATOR.inputs)[number];
  value: number;
  onChange: (v: number) => void;
}) {
  /* Drives the filled portion of the track. A range input cannot style the
     part of the track behind the thumb on its own, so the fill is a gradient
     on the track whose stop is this percentage. */
  const pct = ((value - input.min) / (input.max - input.min)) * 100;
  return (
    <div className="calc__row">
      <label className="calc__label" htmlFor={`calc-${input.id}`}>
        {input.label}
      </label>
      <output className="calc__out" htmlFor={`calc-${input.id}`}>
        {input.prefix}
        {value}
        {input.suffix}
      </output>
      <input
        id={`calc-${input.id}`}
        className="calc__range"
        type="range"
        min={input.min}
        max={input.max}
        step={input.step}
        value={value}
        style={{ ["--pct" as string]: `${pct}%` }}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {"note" in input && input.note ? <p className="calc__note">{input.note}</p> : null}
    </div>
  );
}

export function Calculator() {
  const [vals, setVals] = useState<Record<string, number>>(() =>
    Object.fromEntries(CALCULATOR.inputs.map((i) => [i.id, i.initial]))
  );

  const people = vals.people ?? 0;
  const hours = vals.hours ?? 0;
  const rate = vals.rate ?? 0;
  const share = vals.share ?? 0;

  const weekHours = people * hours;
  const yearCost = weekHours * CALCULATOR.weeksPerYear * rate;
  const recoverable = yearCost * (share / 100);

  const shownHours = useEased(weekHours);
  const shownYear = useEased(yearCost);
  const shownRecover = useEased(recoverable);

  return (
    <div className="calc">
      <div className="calc__inputs">
        {CALCULATOR.inputs.map((input) => (
          <Slider
            key={input.id}
            input={input}
            value={vals[input.id]}
            onChange={(v) => setVals((s) => ({ ...s, [input.id]: v }))}
          />
        ))}
      </div>

      {/* aria-live so a screen reader hears the totals change when a slider
          moves. Polite, not assertive — it should wait for a pause in the
          dragging rather than interrupt every step of it. */}
      <dl className="calc__results" aria-live="polite">
        <div className="calc__line">
          <dt>{CALCULATOR.results.hours}</dt>
          <dd>{Math.round(shownHours)}h</dd>
        </div>
        <div className="calc__line">
          <dt>{CALCULATOR.results.year}</dt>
          <dd>{money(shownYear)}</dd>
        </div>
        <div className="calc__line calc__line--lead">
          <dt>{CALCULATOR.results.recover}</dt>
          <dd className="calc__big">{money(shownRecover)}</dd>
        </div>
      </dl>

      <p className="calc__closing">{CALCULATOR.closing}</p>
      {/* Same button as the intro's call to action, not a second design for
          the same action. The chrome ring is drawn on the wrapper's two
          pseudo-elements — see chrome.css. */}
      <span className="btn-chrome calc__cta">
        <a className="btn-pill" href="#contact">
          {CALCULATOR.cta}
        </a>
      </span>
      <p className="calc__basis">{CALCULATOR.basis}</p>
    </div>
  );
}

export default Calculator;
