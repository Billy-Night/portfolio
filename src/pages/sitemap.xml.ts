// Writes /sitemap.xml when the site is built: one entry for every page that
// search engines may index, in both languages.
//
// The list is not written by hand. It comes from the same two places as the
// pages themselves:
//   - `routes` in src/i18n/routes.ts, without the pages named in `noindexRoutes`
//   - the client projects in src/data/projects.ts that have a `page` part
// so a new page is in the sitemap as soon as it exists.
//
// robots.txt points at /sitemap.xml, and so does Google Search Console.
import type { APIRoute } from 'astro'
import { SITE, routes, noindexRoutes, projectPaths, type Paths, type RouteKey } from '../i18n/routes'
import { clientProjects } from '../data/projects'

/**
 * The date each page last changed in a way worth telling search engines about
 * (new content, not a styling fix). This is the only part kept by hand: update
 * a date when you rewrite a page. A page with no date here is listed without one.
 */
const lastChanged: Record<string, string> = {
  '/': '2026-07-06',
  '/fr/': '2026-07-06',
  '/about': '2026-07-06',
  '/fr/a-propos': '2026-07-06',
  '/contact': '2026-07-06',
  '/fr/contact': '2026-07-06',
  '/services': '2026-08-06',
  '/fr/services': '2026-07-06',
  '/website-development-landes': '2026-07-06',
  '/fr/creation-site-web-landes': '2026-07-06',
  '/projects/monkey-mood': '2026-11-24',
  '/fr/projets/monkey-mood': '2026-11-24',
  '/projects/pacific-coast-cafe': '2026-11-24',
  '/fr/projets/pacific-coast-cafe': '2026-11-24',
  '/projects/sophro-by-eve': '2026-11-24',
  '/fr/projets/sophro-by-eve': '2026-11-24',
}

const pages: Paths[] = [
  ...(Object.keys(routes) as RouteKey[]).filter((key) => !noindexRoutes.includes(key)).map((key) => routes[key]),
  ...clientProjects.filter((project) => project.page).map((project) => projectPaths(project.page!.slug)),
]

// English first, then French, for each page
const paths = pages.flatMap((page) => [page.en, page.fr])

const entry = (path: string) => {
  const date = lastChanged[path]
  return ['  <url>', `    <loc>${SITE}${path}</loc>`, ...(date ? [`    <lastmod>${date}</lastmod>`] : []), '  </url>'].join('\n')
}

export const GET: APIRoute = () => {
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...paths.map(entry),
    '</urlset>',
    '',
  ].join('\n')

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}
