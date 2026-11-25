// Single source of truth for every page URL in both languages.
// Canonicals, hreflang tags, og:url / twitter:url and the header language
// switch are all generated from this map, so they can never drift apart.
//
// These paths must match the live site exactly (no trailing slash except the
// homepages) — they are what Google has indexed.

export const SITE = 'https://www.billynightingale.com'

export const routes = {
  home: { en: '/', fr: '/fr/' },
  about: { en: '/about', fr: '/fr/a-propos' },
  contact: { en: '/contact', fr: '/fr/contact' },
  services: { en: '/services', fr: '/fr/services' },
  landes: { en: '/website-development-landes', fr: '/fr/creation-site-web-landes' },
  terms: { en: '/terms-and-conditions', fr: '/fr/cgv' },
} as const

export type Lang = 'en' | 'fr'
export type RouteKey = keyof typeof routes

/**
 * Pages that ask search engines not to index them (`robots="noindex, follow"`
 * in the page file). They are left out of the sitemap.
 */
export const noindexRoutes: RouteKey[] = ['terms']

export const otherLang = (lang: Lang): Lang => (lang === 'en' ? 'fr' : 'en')

export const url = (route: RouteKey, lang: Lang) => SITE + routes[route][lang]

/** The address of one page in each language */
export type Paths = Record<Lang, string>

/**
 * A page given either by its name in `routes` above, or by its two addresses
 * for pages generated from a data list (the project pages).
 */
export type PageRoute = RouteKey | Paths

export const pathsOf = (route: PageRoute): Paths => (typeof route === 'string' ? routes[route] : route)

/** The addresses of a project page. `slug` comes from src/data/projects.ts. */
export const projectPaths = (slug: string): Paths => ({
  en: `/projects/${slug}`,
  fr: `/fr/projets/${slug}`,
})
