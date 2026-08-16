import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

/* Self-hosted, from npm — no Google Fonts request, nothing third-party in the
 * critical path, and the files are fingerprinted and cached like any other
 * asset. Both are variable fonts: one file each covers every weight the page
 * uses, so asking for 700 costs nothing extra over 400. */
import "@fontsource-variable/sora";
import "@fontsource-variable/inter";

import "./styles/tokens.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
