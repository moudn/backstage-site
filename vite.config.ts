import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  /* Relative asset URLs.
   *
   * GitHub Pages serves a project site from a subpath —
   * moudn.github.io/backstage-site/ — but Vite's default `base: '/'` writes
   * absolute URLs like /assets/index.js, which resolve to the domain root and
   * 404. The page loads as a blank white screen with no obvious cause.
   *
   * './' makes every asset URL relative to index.html, so the same build works
   * at a subpath, at a domain root, and opened from disk. Change this only if
   * the site moves to its own domain and something needs absolute paths. */
  base: './',
})
