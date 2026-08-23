/* A <section> that drifts with scroll position, so its title is not the only
 * thing moving.
 *
 * The amount is deliberately small — about half the title's. It is not meant
 * to be noticed on its own; it is there so that when the title moves, the copy
 * beneath it moves too, a little slower. See useScrollDrift for why that
 * matters.
 *
 * Not used for "How we work". That section holds itself in place with
 * `position: sticky`, and a transform on an ancestor makes that ancestor the
 * containing block for its descendants — which stops the sticky stage sticking
 * to the viewport and breaks the held sequence outright.
 */

import type { ReactNode } from "react";
import { useScrollDrift } from "../lib/useScrollDrift";

/** Half the title's travel, near enough. Larger and the section visibly slides
 *  against the page; smaller and the title looks detached again. */
const SECTION_SHIFT = 14;

export function DriftSection({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useScrollDrift<HTMLElement>(SECTION_SHIFT);
  return (
    <section ref={ref} id={id} className={`${className ?? ""} drift`.trim()}>
      {children}
    </section>
  );
}

export default DriftSection;
