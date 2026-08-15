/* A plain fade-up for blocks that shouldn't be word-split — lists, cards,
 * buttons, the form. Fires once when the element first comes into view and
 * then stays put; re-hiding things on the way back up makes a page feel
 * unstable.
 *
 * The hidden state lives behind `prefers-reduced-motion: no-preference` in
 * the stylesheet rather than being switched off with !important. That matters:
 * the site has a global `*{animation:none;transition:none}` for reduced
 * motion, so an unconditional `opacity:0` here would leave those visitors
 * looking at permanently invisible content.
 */

import {
  createElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import "./Reveal.css";

export function Reveal({
  children,
  as: Tag = "div",
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Stagger, in ms. */
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        io.disconnect(); // once only
      },
      { rootMargin: "0px 0px -12% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // createElement rather than <Tag>: a polymorphic `as` widens the JSX props
  // to a union that TypeScript resolves to `never`, so ref/className/style all
  // fail to typecheck through the element syntax.
  return createElement(
    Tag,
    {
      ref,
      className: `reveal ${className}`.trim(),
      "data-shown": shown,
      style: { "--reveal-delay": `${delay}ms` } as CSSProperties,
    },
    children
  );
}

export default Reveal;
