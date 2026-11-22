// Automatic cache-busting for files in public/.
//
// assetUrl('/css/style.css') returns '/css/style.css?v=3f9a1c2b', where the
// version is a hash of the file's contents. It changes whenever the file
// changes, so there is no version number to bump by hand, and the file itself
// is served untouched (no bundling or minification).
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const cache = new Map<string, string>()

export function assetUrl(publicPath: string): string {
  // In dev the file can change between requests, so only cache during a build
  const cached = import.meta.env.PROD ? cache.get(publicPath) : undefined
  if (cached) return cached
  const file = readFileSync(join(process.cwd(), 'public', publicPath))
  const version = createHash('sha256').update(file).digest('hex').slice(0, 8)
  const url = `${publicPath}?v=${version}`
  cache.set(publicPath, url)
  return url
}
