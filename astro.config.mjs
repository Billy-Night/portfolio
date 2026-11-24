// @ts-check
import { defineConfig } from 'astro/config'
import { cp } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { buildStylesheet, stylesDir } from './scripts/build-styles.mjs'

/**
 * Photos live in src/assets/images/ and are optimised by Astro, which serves
 * them from /_astro/ under new, hashed names. Before that they were served
 * from /assets/ (for example /assets/portraits/x.webp), and those addresses
 * are indexed by Google Images and used in the structured data.
 *
 * This copies the originals to dist/assets/ after each build, so every old
 * image URL keeps working. No page links to these copies any more.
 *
 * @returns {import('astro').AstroIntegration}
 */
function legacyImageUrls() {
  return {
    name: 'legacy-image-urls',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const from = fileURLToPath(new URL('./src/assets/images/', import.meta.url))
        const to = fileURLToPath(new URL('./assets/', dir))
        await cp(from, to, { recursive: true, force: false, errorOnExist: false })
      },
    },
  }
}

/**
 * The stylesheet is written as separate files in src/styles/ and served as
 * one file, public/css/style.css. This joins them (scripts/build-styles.mjs)
 * when a build or dev session starts, and in dev again each time one of the
 * files is saved, then reloads the page.
 *
 * @returns {import('astro').AstroIntegration}
 */
function stylesheet() {
  return {
    name: 'stylesheet',
    hooks: {
      'astro:config:setup': () => {
        buildStylesheet()
      },
      'astro:server:setup': ({ server }) => {
        server.watcher.add(stylesDir)
        server.watcher.on('all', (_event, file) => {
          if (!file.startsWith(stylesDir) || !file.endsWith('.css')) return
          if (buildStylesheet()) server.ws.send({ type: 'full-reload' })
        })
      },
    },
  }
}

export default defineConfig({
  site: 'https://www.billynightingale.com',
  // Keep URLs identical to the pre-Astro site: /about, /fr/a-propos, /fr/
  trailingSlash: 'never',
  build: { format: 'preserve' }, // about.astro -> about.html, fr/index.astro -> fr/index.html
  // Keep HTML output readable/diffable during the 1:1 port
  compressHTML: false,
  integrations: [stylesheet(), legacyImageUrls()],
})
