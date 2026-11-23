// The website packages and the pricing table on the services page, in both
// languages. To change a price, edit it here: the card and the table each
// have their own figure. The cards and rows appear in this order.
// Used by src/components/services/ServicesPackages.astro.
// If the lowest or highest price changes, update priceRange in schema.ts too.
import type { Lang } from '../i18n/routes'

type Text = Record<Lang, string>

export interface Package {
  /** Chooses the icon drawn on the card (see PackageIcon.astro) */
  id: 'starter' | 'business' | 'growth'
  /** The small line above the name */
  tagline: Text
  name: Text
  /** The "from" price shown on the card */
  price: Text
  description: Text
  /** The bullet points. The two languages can have different bullets. */
  features: Record<Lang, string[]>
  bestFor: Text
  delivery: Text
  /** Read out by screen readers in place of the icon, where the icon has a meaning */
  iconLabel?: Text
  /** true for the recommended package: larger title, icon and text, and a background pattern */
  highlighted?: boolean
}

export const packages: Package[] = [
  {
    id: 'starter',
    tagline: {
      en: 'Start your presence',
      fr: 'Lancez votre présence en ligne',
    },
    name: {
      en: 'Starter Website',
      fr: 'Site vitrine Essentiel',
    },
    price: {
      en: '€700',
      fr: '700 €',
    },
    description: {
      en: 'A professional one-page website designed to establish your online presence and create a strong foundation for future growth.',
      fr: 'Un site vitrine professionnel d’une page, conçu sur mesure pour lancer votre présence en ligne et créer une base solide pour votre future croissance.',
    },
    features: {
      en: [
        'One custom landing page',
        'Mobile and tablet optimisation',
        'Plan clear routes that encourage visitors to contact you',
        'Set up your pages so Google can understand them',
        'Performance and SEO optimisation',
      ],
      fr: [
        'Une page de présentation entièrement sur mesure',
        'Optimisation pour mobile et tablette',
        'Des parcours clairs qui incitent les visiteurs à vous contacter',
        'Des pages structurées pour être bien comprises par Google',
        'Optimisation des performances et du SEO',
      ],
    },
    bestFor: {
      en: 'New businesses that need to get online professionally',
      fr: 'Les indépendants et jeunes entreprises qui souhaitent créer un site internet professionnel',
    },
    delivery: {
      en: '1–2 weeks',
      fr: '1 à 2 semaines',
    },
  },
  {
    id: 'business',
    tagline: {
      en: 'Recommended for most established businesses',
      fr: 'Recommandé aux entreprises déjà établies',
    },
    name: {
      en: 'Business Website',
      fr: 'Site internet professionnel',
    },
    price: {
      en: '€1,500',
      fr: '1 500 €',
    },
    description: {
      en: 'A complete custom website designed to improve visibility, present your services professionally and generate customer enquiries.',
      fr: 'Un site vitrine complet et sur mesure, conçu pour améliorer votre visibilité sur Google, valoriser vos services et générer davantage de demandes de contact ou de devis.',
    },
    features: {
      en: [
        'Up to four custom pages',
        'Website planning and content structure',
        'Custom responsive website design',
        'User journey and conversion planning',
        'Connect enquiries to your existing CRM',
      ],
      fr: [
        'Jusqu’à quatre pages conçues sur mesure',
        'Stratégie du site et organisation des contenus',
        'Design de site responsive et sur mesure',
        'Conception du parcours utilisateur et des conversions',
        'Connexion des demandes à votre CRM existant',
      ],
    },
    bestFor: {
      en: 'Established businesses, looking to improve their online presence',
      fr: 'Les TPE, PME et indépendants établis qui souhaitent renforcer leur présence en ligne',
    },
    delivery: {
      en: '2-3 weeks',
      fr: '2 à 3 semaines',
    },
    iconLabel: {
      en: 'Three concentric diamonds',
      fr: 'Trois losanges concentriques',
    },
    highlighted: true,
  },
  {
    id: 'growth',
    tagline: {
      en: 'Scale and automate',
      fr: 'Développez et automatisez',
    },
    name: {
      en: 'Growth Website',
      fr: 'Site internet Croissance',
    },
    price: {
      en: '€3,000',
      fr: '3 000 €',
    },
    description: {
      en: 'For growing businesses that need advanced enquiry journeys, integrations, location-focused content and measurable lead tracking.',
      fr: 'Un site web évolutif pour les entreprises en croissance qui ont besoin de parcours de conversion avancés, d’intégrations, de contenus SEO locaux et d’un suivi précis des prospects.',
    },
    features: {
      en: [
        'Five or more custom pages',
        'Advanced enquiry or booking flows',
        'Analytics and conversion tracking',
        'Useful, individually written service-area pages',
        'Blog or resource-centre architecture',
      ],
      fr: [
        'Cinq pages sur mesure ou plus',
        'Parcours avancés de demande de contact ou de réservation',
        'Web analytics et suivi des conversions',
        'Pages locales utiles et rédigées sur mesure pour chaque zone d’intervention',
        'Architecture de blog ou de centre de ressources',
      ],
    },
    bestFor: {
      en: 'Growing businesses with more advanced marketing needs',
      fr: 'Les entreprises en croissance avec des besoins avancés en acquisition et marketing digital',
    },
    delivery: {
      en: '4–6 weeks',
      fr: '4 à 6 semaines',
    },
    iconLabel: {
      en: 'Three concentric circles',
      fr: 'Trois cercles concentriques',
    },
  },
]

interface PricingRow {
  name: Text
  /** The price range, written out as it should appear */
  range: Text
}

export const pricingRows: PricingRow[] = [
  {
    name: {
      en: 'Starter landing page',
      fr: 'Landing page Essentiel',
    },
    range: {
      en: '€700 - €1,200',
      fr: '700 € – 1 200 € TTC',
    },
  },
  {
    name: {
      en: 'Business website',
      fr: 'Site internet professionnel',
    },
    range: {
      en: '€1,500 - €3,000',
      fr: '1 500 € – 3 000 € TTC',
    },
  },
  {
    name: {
      en: 'Growth website',
      fr: 'Site web Croissance',
    },
    range: {
      en: '€3,000 - €6,000',
      fr: '3 000 € – 6 000 € TTC',
    },
  },
  {
    name: {
      en: 'E-commerce module / project',
      fr: 'Module ou projet e-commerce',
    },
    range: {
      en: '€1,500 - €5,000',
      fr: '1 500 € – 5 000 € TTC',
    },
  },
  {
    name: {
      en: 'Maintenance',
      fr: 'Maintenance & hébergement de site internet',
    },
    range: {
      en: '€35 - €150 / Month',
      fr: '35 € – 150 € / mois TTC',
    },
  },
  {
    name: {
      en: 'OnGoing visibility',
      fr: 'Référencement SEO et visibilité continue',
    },
    range: {
      en: '€250 - €1000+ / Month',
      fr: '250 € – 1 000 €+ / mois TTC',
    },
  },
]
