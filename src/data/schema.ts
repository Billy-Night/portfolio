// Shared schema.org structured data: the Person and the Service.
// One Person entity for the whole site: every page that mentions Billy uses
// the same @id, so search engines read it as one person, not several.
import { SITE, routes, type Lang } from '../i18n/routes'

export const PERSON_ID = `${SITE}/#person`

const text = {
  en: {
    jobTitle: 'Web designer & web developer',
    description:
      'Web designer and developer in Capbreton, creating modern, fast, SEO-optimised websites for local businesses.',
    knowsAbout: [
      'web design',
      'website creation',
      'frontend development',
      'WordPress',
      'SEO',
      'local SEO',
      'performance optimisation',
    ],
  },
  fr: {
    jobTitle: 'Web designer et développeur web',
    description:
      'Web designer et développeur web à Capbreton, créant des sites modernes, rapides et optimisés pour le SEO pour les entreprises locales.',
    knowsAbout: [
      'web design',
      'création de site internet',
      'développement frontend',
      'WordPress',
      'SEO',
      'référencement local',
      'optimisation des performances',
    ],
  },
}

interface PersonOptions {
  /** Portrait to use instead of the default one */
  image?: string
  /** true when nested inside another object (e.g. ProfilePage.mainEntity): no @context, no mainEntityOfPage */
  embedded?: boolean
}

export function person(
  lang: Lang,
  { image, embedded = false }: PersonOptions = {},
) {
  const home = SITE + routes.home[lang]
  return {
    ...(embedded ? {} : { '@context': 'https://schema.org' }),
    '@type': 'Person',
    '@id': PERSON_ID,
    name: 'Billy Nightingale',
    jobTitle: text[lang].jobTitle,
    url: home,
    image: image ?? `${SITE}/assets/billy_portrait.webp`,
    description: text[lang].description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Capbreton',
      addressRegion: 'Landes',
      addressCountry: 'FR',
    },
    sameAs: [
      'https://www.linkedin.com/in/billynightingale/',
      'https://github.com/Billy-Night',
    ],
    knowsAbout: text[lang].knowsAbout,
    ...(embedded
      ? {}
      : { mainEntityOfPage: { '@type': 'WebPage', '@id': home } }),
  }
}

const serviceText = {
  en: {
    name: 'Web design, website creation and SEO services',
    description:
      'Web design, website creation and SEO services for local businesses in Capbreton, Hossegor, Landes and the Pays Basque.',
  },
  fr: {
    name: 'Création de Site Web, Web Design, Développement Web, SEO',
    description:
      "Je propose des services de web design, de création de sites web et d'optimisation SEO pour les entreprises locales à Capbreton, Hossegor, Landes et Pays Basque.",
  },
}

/** The service Billy offers, with him as its provider. Used on the home and contact pages. */
export function service(lang: Lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: serviceText[lang].name,
    description: serviceText[lang].description,
    provider: {
      '@type': 'Person',
      '@id': PERSON_ID,
      name: 'Billy Nightingale',
      url: SITE + routes.home[lang],
    },
    areaServed: ['Capbreton', 'Hossegor', 'Landes', 'Pays Basque'],
  }
}
