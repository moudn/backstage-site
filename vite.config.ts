import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  /* Absolute asset URLs, because the site is served from the root of its own
   * domain now rather than from a GitHub Pages subpath.
   *
   * This matters most for 404.html, which the host serves for *any*
   * unrecognised path. With relative URLs, a request for /a/b/c resolves
   * ./assets/… against /a/b/ — so the error page's own assets 404 as well.
   * Absolute paths always resolve from the root. */
  base: '/',
})
