/* The page's ground: four drifting lights, a turning sheen, a vignette and a
 * layer of grain, fixed behind everything.
 *
 * Markup only — the whole thing is CSS, so there is nothing to tune from here
 * and nothing that runs per frame in JavaScript. See AmbientField.css.
 *
 * It takes no theme prop. The colours are custom properties, so a theme change
 * repaints it without React being involved at all; passing `theme` down would
 * re-render the component on every toggle to produce identical markup.
 */

import "./AmbientField.css";

export function AmbientField() {
  return (
    <div className="ambient" aria-hidden="true">
      <div className="ambient__lights">
        <span className="ambient__light ambient__light--a" />
        <span className="ambient__light ambient__light--b" />
        <span className="ambient__light ambient__light--c" />
        <span className="ambient__light ambient__light--d" />
      </div>
      <div className="ambient__sheen" />
      <div className="ambient__vignette" />
      <div className="ambient__grain" />
    </div>
  );
}

export default AmbientField;
