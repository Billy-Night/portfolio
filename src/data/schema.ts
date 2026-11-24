// Shared schema.org structured data: what search engines read to understand
// who and what the site is about. Four linked entries:
//
// - the business (a ProfessionalService, a kind of local business): name,
//   address, phone, opening hours, area served. This is the main entry.
// - the person: Billy, who founded and runs the business.
// - the website: its name, used by Google for the site name in results.
// - the services: each offered by the business.
//
// Each project page adds its own entries: see projectSchema at the end.
//
// Every entry has one @id, and pages refer to it by that @id, so search
// engines read one business and one person across the whole site.
import { SITE, projectPaths, routes, type Lang } from '../i18n/routes'
import type { Project } from './projects'

export const PERSON_ID = `${SITE}/#person`
export const BUSINESS_ID = `${SITE}/#business`
export const WEBSITE_ID = `${SITE}/#website`

const text = {
  en: {
    jobTitle: 'Web designer & web developer',
    description:
      'Web designer and developer in Capbreton, creating modern, fast, SEO-optimised websites for local businesses.',
    knowsAbout: [
      'web design',
      'custom website development',
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
      'création de site internet sur mesure',
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
    worksFor: businessRef(lang),
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

/** The service on offer, provided by the business. Used on the home and contact pages. */
export function service(lang: Lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: serviceText[lang].name,
    description: serviceText[lang].description,
    provider: businessRef(lang),
    areaServed: AREA_SERVED,
  }
}

const AREA_SERVED = ['Capbreton', 'Hossegor', 'Landes', 'Pays Basque']

const businessText = {
  en: {
    description:
      'Web design, custom website development and SEO studio in Capbreton, Landes, for local businesses in Hossegor, the Landes and the Pays Basque.',
  },
  fr: {
    description:
      'Studio de web design, de création de sites internet sur mesure et de SEO à Capbreton, dans les Landes, pour les entreprises locales de Hossegor, des Landes et du Pays Basque.',
  },
}

/** A short pointer to the business, for use inside other entries (provider, worksFor, publisher). */
export function businessRef(lang: Lang) {
  return {
    '@type': 'ProfessionalService',
    '@id': BUSINESS_ID,
    name: 'Billy Nightingale',
    url: SITE + routes.home[lang],
  }
}

/**
 * The business itself. Used in full on the home and contact pages.
 * Keep the name, phone number and opening hours the same as on the Google
 * Business Profile: search engines compare the two.
 */
export function business(lang: Lang) {
  return {
    '@context': 'https://schema.org',
    ...businessRef(lang),
    description: businessText[lang].description,
    image: `${SITE}/assets/meta_preview1200x600.webp`,
    logo: `${SITE}/assets/nightingale_logo_gold.svg`,
    telephone: '+33766095864',
    email: 'contact@billynightingale.com',
    // The lowest and highest prices in the pricing table on the services page
    priceRange: '€700 - €6000',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Capbreton',
      postalCode: '40130',
      addressRegion: 'Landes',
      addressCountry: 'FR',
    },
    areaServed: AREA_SERVED,
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ],
        opens: '08:00',
        closes: '18:00',
      },
    ],
    founder: { '@type': 'Person', '@id': PERSON_ID, name: 'Billy Nightingale' },
    sameAs: [
      'https://www.instagram.com/billy.nightingale.studio/',
      'https://www.linkedin.com/in/billynightingale/',
    ],
  }
}

/** The website. Used on the two homepages. Google reads its name for the site name in results. */
export function website(lang: Lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: 'Billy Nightingale',
    url: `${SITE}/`,
    inLanguage: ['en', 'fr'],
    publisher: businessRef(lang),
  }
}

const LANGUAGE_TAG = { en: 'en-GB', fr: 'fr-FR' }

const projectText = {
  en: { home: 'Home', projects: 'Projects' },
  fr: { home: 'Accueil', projects: 'Projets' },
}

/**
 * A project page (src/components/project/ProjectPage.astro): the page, its
 * breadcrumb, and the website that was built, with the business as its creator.
 * The client's review is shown on the page but not marked up here: search
 * engines do not show stars for reviews a business publishes about itself.
 */
export function projectSchema(project: Project, lang: Lang) {
  const page = project.page!
  const home = SITE + routes.home[lang]
  const pageUrl = SITE + projectPaths(page.slug)[lang]
  const image = {
    '@type': 'ImageObject',
    url: SITE + project.photo.src,
    width: project.photo.width,
    height: project.photo.height,
  }
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: page.title[lang],
      description: page.description[lang],
      inLanguage: LANGUAGE_TAG[lang],
      isPartOf: { '@id': WEBSITE_ID },
      about: { '@id': `${pageUrl}#project` },
      primaryImageOfPage: image,
      breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: projectText[lang].home, item: home },
        { '@type': 'ListItem', position: 2, name: projectText[lang].projects, item: `${home}#projects` },
        { '@type': 'ListItem', position: 3, name: project.name[lang], item: pageUrl },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      '@id': `${pageUrl}#project`,
      name: project.name[lang],
      description: page.description[lang],
      genre: page.sector[lang],
      dateCreated: String(page.year),
      inLanguage: LANGUAGE_TAG[lang],
      image,
      creator: businessRef(lang),
      mainEntityOfPage: { '@id': `${pageUrl}#webpage` },
      ...(project.link ? { sameAs: project.link.href } : {}),
    },
  ]
}
