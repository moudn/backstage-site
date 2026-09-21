/* Entry point for /cost-calculator.
 *
 * A second Vite entry rather than a route inside the homepage app. The site
 * has no router and does not need one for three pages, and a separate entry
 * means this page ships only what it uses: no WebGL jellyfish, no fluid
 * cursor, no scroll sequence. The calculator is the reason somebody arrives
 * here, so it should be on screen quickly.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@fontsource-variable/sora";
import "@fontsource-variable/inter";

import "./styles/tokens.css";
import { CalculatorPage } from "./components/CalculatorPage";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CalculatorPage />
  </StrictMode>
);
