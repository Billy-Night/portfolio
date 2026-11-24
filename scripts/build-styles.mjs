// Joins the files in src/styles/ into the one stylesheet the site serves,
// public/css/style.css. The files are joined in the order of their names
// (01-tokens.css first, 90-reduced-motion.css last) and nothing in them is
// changed: no bundling, no minifying.
//
// astro.config.mjs runs this at the start of every build and dev session, and
// again whenever a file in src/styles/ is saved. To run it by hand:
//   node scripts/build-styles.mjs
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
export const stylesDir = join(root, 'src', 'styles')
const outFile = join(root, 'public', 'css', 'style.css')

const HEADER = `/* GENERATED FILE: do not edit, your changes would be overwritten.
   The stylesheet is written in src/styles/, one file per part of the site,
   and joined into this file by scripts/build-styles.mjs. Each part below is
   marked with the file it came from. See src/styles/README.md. */
`

/** Writes public/css/style.css. Returns true if the file changed. */
export function buildStylesheet() {
  const files = readdirSync(stylesDir)
    .filter((name) => name.endsWith('.css'))
    .sort()
  const parts = files.map(
    (name) => `/* ===== src/styles/${name} ===== */\n\n${readFileSync(join(stylesDir, name), 'utf8').trim()}\n`,
  )
  const css = [HEADER, ...parts].join('\n')
  if (existsSync(outFile) && readFileSync(outFile, 'utf8') === css) return false
  mkdirSync(dirname(outFile), { recursive: true })
  writeFileSync(outFile, css)
  return true
}

// Run directly: node scripts/build-styles.mjs
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const changed = buildStylesheet()
  console.log(changed ? 'public/css/style.css written' : 'public/css/style.css is already up to date')
}
