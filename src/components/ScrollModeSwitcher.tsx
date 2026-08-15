/* The A/B switch between the two scroll architectures.
 *
 * This is scaffolding for choosing, not a feature of the finished site — no
 * visitor should be asked to pick a scroll engine. Delete this component and
 * its stylesheet along with the losing mode.
 */

import { SCROLL_MODES, type ScrollMode } from "../lib/scrollMode";
import "./ScrollModeSwitcher.css";

const LABELS: Record<ScrollMode, { name: string; hint: string }> = {
  snap: { name: "Snap", hint: "One section per screen" },
  cinematic: { name: "Cinematic", hint: "Inertial, sections hold" },
};

export function ScrollModeSwitcher({
  mode,
  onChange,
}: {
  mode: ScrollMode;
  onChange: (mode: ScrollMode) => void;
}) {
  return (
    <div className="mode-switch">
      <p className="mode-switch__label" id="mode-switch-label">
        Scroll
      </p>
      <div className="mode-switch__group" role="radiogroup" aria-labelledby="mode-switch-label">
        {SCROLL_MODES.map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={mode === value}
            className="mode-switch__btn"
            onClick={() => onChange(value)}
          >
            {LABELS[value].name}
          </button>
        ))}
      </div>
      <p className="mode-switch__hint">{LABELS[mode].hint}</p>
    </div>
  );
}

export default ScrollModeSwitcher;
