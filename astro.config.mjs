// @ts-check
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://www.billynightingale.com',
  // Keep URLs identical to the pre-Astro site: /about, /fr/a-propos, /fr/
  trailingSlash: 'never',
  build: { format: 'preserve' }, // about.astro -> about.html, fr/index.astro -> fr/index.html
  // Keep HTML output readable/diffable during the 1:1 port
  compressHTML: false,
})
