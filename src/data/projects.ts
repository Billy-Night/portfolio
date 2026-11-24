// The projects on the homepage: client websites first, then web applications.
// Each entry holds one project in both languages. To add a project, put its
// screenshot in src/assets/images/, import it below and copy an entry. Only
// `category`, `name`, `summary`, `technologies`, `photo` and `photoAlt` are
// required; leave out the other parts a project does not need. The page shows
// the projects in this order, alternating the side the screenshot sits on.
// Used by src/components/home/HomeProjects.astro and ProjectCard.astro.
import type { ImageMetadata } from 'astro'
import type { Lang } from '../i18n/routes'
import monkeyMoodPhoto from '../assets/images/client_sites/billy_nightingale_client_monkey_mood_creation_de_site_web.webp'
import pacificCoastPhoto from '../assets/images/client_sites/Billy_nightingale_client_pacific_coast_cafe_hossegor.webp'
import eveMariePhoto from '../assets/images/client_sites/client_eve-marie_website.webp'
import turbulentePhoto from '../assets/images/client_sites/client_turbulente_website.webp'
import surfJournalPhoto from '../assets/images/personal_projects/app_world_surf_journal.webp'
import weatherWisePhoto from '../assets/images/personal_projects/app_weather_wise.webp'
import trowitPhoto from '../assets/images/personal_projects/app_trowit.webp'

type Text = Record<Lang, string>

/** A link inside a sentence */
export interface InlineLink {
  text: string
  href: string
}

export interface Project {
  /** Small heading above the name, for example the client's sector */
  category: Text
  name: Text
  /**
   * First paragraph. A plain string, or a list of pieces when the sentence has
   * links inside it. The pieces are joined exactly as written, so put the
   * spaces around a link in the text before and after it.
   */
  summary: Record<Lang, string | (string | InlineLink)[]>
  /** A second paragraph */
  detail?: Text
  /** A bullet list with the line that introduces it */
  tasks?: {
    intro: Text
    items: Record<Lang, string[]>
  }
  /** What the project achieved, shown after the list */
  result?: Text
  /** A closing line that ends with a link to the live site */
  link?: {
    intro: Text
    text: Text
    href: string
  }
  /** Not translated */
  technologies: string[]
  photo: ImageMetadata
  photoAlt: Text
  /** Resize the screenshot to this width. Only for files much larger than their displayed size. */
  photoMaxWidth?: number
}

export const clientProjects: Project[] = [
  {
    category: { en: 'Hospitality', fr: 'Restauration' },
    name: { en: 'Monkey Mood - Restaurant', fr: 'Monkey Mood - restaurant' },
    summary: {
      en: 'Complete website redesign for a growing vegan restaurant brand, simplifying the booking experience across two locations while elevating branding, performance, and SEO.',
      fr: 'Refonte complète du site web pour une marque de restaurant vegan en pleine croissance, simplifiant l’expérience de réservation sur deux établissements tout en renforçant l’identité de marque, les performances et le référencement naturel (SEO).',
    },
    tasks: {
      intro: { en: 'Key aspects of the project:', fr: 'Points clés du projet :' },
      items: {
        en: [
          'Full redesign with mockups and brand direction',
          'User flow mapping to optimise navigation and booking behaviour',
          'Booking system integration (ZenChef)',
          'Custom animations and storytelling elements to reinforce brand identity',
          'Performance and SEO optimisation across all pages',
        ],
        fr: [
          'Refonte complète avec maquettes et direction artistique',
          'Cartographie des parcours utilisateurs afin d’optimiser la navigation et le processus de réservation',
          'Intégration du système de réservation (ZenChef)',
          'Animations personnalisées et éléments narratifs pour renforcer l’identité de marque',
          'Optimisation des performances et du SEO sur l’ensemble du site',
        ],
      },
    },
    result: {
      en: 'This website improved booking experience, increased organic traffic through SEO optimisation and provided and scalable foundation for future marketing growth.',
      fr: 'Ce site a permis d’améliorer l’expérience de réservation, d’augmenter le trafic organique grâce au SEO et de mettre en place une base scalable pour les futures actions marketing.',
    },
    link: {
      intro: {
        en: 'Check out the website and maybe try some vegan food,',
        fr: 'Découvrez le site et pourquoi pas tester leur cuisine vegan,',
      },
      text: { en: 'Monkey Mood website', fr: 'site de Monkey Mood' },
      href: 'https://monkey-mood.fr',
    },
    technologies: ['Figma', 'WordPress CMS', 'Elementor Pro', 'Notion', 'Drive', 'ZenChef'],
    photo: monkeyMoodPhoto,
    photoAlt: {
      en: 'Billy Nightingale client Monkey Mood, website screenshot',
      fr: 'Billy Nightingale client Monkey Mood, capture ecran de site web',
    },
  },
  {
    category: { en: 'E-Commerce', fr: 'E-commerce' },
    name: { en: 'Pacific Coast Cafe - Café', fr: 'Pacific Coast Cafe - restauration' },
    summary: {
      en: 'Performance optimisation and eCommerce integration for a high-traffic café in Hossegor.',
      fr: 'Optimisation des performances et intégration e-commerce pour un café à forte affluence à Hossegor.',
    },
    detail: {
      en: 'Improved site speed by 20%, strengthened search visibility, and launched a seamless online shop with digital gift cards unlocking a new revenue stream without disrupting daily operations.',
      fr: 'Amélioration de la vitesse du site de 20 %, renforcement de la visibilité sur les moteurs de recherche et lancement d’une boutique en ligne fluide avec cartes cadeaux digitales, créant une nouvelle source de revenus sans perturber les opérations quotidiennes.',
    },
    result: {
      en: "This project improved Pacific Coasts Cafe's online presence and their revenue stream.",
      fr: 'Ce projet a amélioré la présence en ligne de Pacific Coast Café ainsi que ses sources de revenus.',
    },
    link: {
      intro: { en: 'The website can be found here:', fr: 'Le site est accessible ici :' },
      text: { en: 'Pacific Coast Cafe website', fr: 'Site du Pacific Coast Café' },
      href: 'https://pacificcoasthossegor.com/',
    },
    technologies: ['Figma', 'CMS', 'Elementor Pro', 'Stripe', 'PW Gift Cards', 'Notion', 'Drive'],
    photo: pacificCoastPhoto,
    photoAlt: {
      en: 'Billy Nightingale client Pacific Coast Cafe Hossegor, website screenshot',
      fr: 'Billy Nightingale client Pacific Coast Cafe Hossegor, capture ecran de site web',
    },
  },
  {
    category: { en: 'Wellness Client', fr: 'Client bien-être' },
    name: { en: 'Sophro by Eve - sophrologue', fr: 'Sophro by Eve - sophrologue' },
    summary: {
      en: 'Eve-Marie needed a website to launch her sophrology practice and present her services in a clear, reassuring way. I created a custom WordPress website with Elementor Pro, focusing on soft colours, simple layouts, and a smooth user experience.',
      fr: 'Eve-Marie avait besoin d’un site web pour lancer son activité de sophrologie et présenter ses services de manière claire et rassurante. J’ai créé un site personnalisé sous WordPress avec Elementor Pro, en mettant l’accent sur des couleurs douces, des mises en page simples et une expérience utilisateur fluide.',
    },
    tasks: {
      intro: { en: 'The project includes:', fr: 'Le projet comprend :' },
      items: {
        en: [
          'A structured sitemap and clean UI design',
          'Blog section for long-term SEO',
          'Calendly booking system with online payments',
          'Speed optimisation and best practices for technical SEO',
          'Full setup of hosting, security, backups, and analytics',
        ],
        fr: [
          'Un sitemap structuré et un design d’interface clair et épuré',
          'Une section blog pour le SEO à long terme',
          'Un système de réservation Calendly avec paiements en ligne',
          'Optimisation de la vitesse et bonnes pratiques pour le SEO technique',
          'Configuration complète de l’hébergement, de la sécurité, des sauvegardes et des outils d’analyse',
        ],
      },
    },
    result: {
      en: 'This project helped strengthen her brand online and provide an easy way for clients to book sessions.',
      fr: 'Ce projet a permis de renforcer sa présence en ligne et d’offrir un moyen simple pour ses clients de réserver des séances.',
    },
    technologies: ['Wordpress', 'Elementor Pro', 'Rank Math SEO', 'Hostinger', 'Calendly'],
    photo: eveMariePhoto,
    photoAlt: {
      en: 'Eve-Marie, a sophrologue website created by Billy Nightingale',
      fr: 'Billy Nightingale client Eve-Marie, capture ecran de site web',
    },
    photoMaxWidth: 1440,
  },
  {
    category: { en: 'E-Commerce', fr: 'E-Commerce' },
    name: { en: 'Turbulente - kombucha', fr: 'Turbulente - kombucha' },
    summary: {
      en: "I created Turbulente's first E-Commerce website to sell their wide range of kombucha's, it was an exciting opportunity to work with a local innovative brand, entwined in the surf culture of the Pays Basque region.",
      fr: 'J’ai créé le premier site e-commerce de Turbulentes pour vendre leur large gamme de kombuchas. C’était une belle opportunité de travailler avec une marque locale et innovante, étroitement liée à la culture surf du Pays Basque.',
    },
    tasks: {
      intro: { en: 'The project includes:', fr: 'Le projet comprend :' },
      items: {
        en: [
          'A structured sitemap and clean UI design',
          'Full online shop with different products',
          'Integrated Payment system',
          'Minimalist design with beautiful graphics and animation.',
          'Full setup of URL and hosting, including DNS and SSL.',
        ],
        fr: [
          'Un sitemap structuré et un design d’interface épuré',
          'Une boutique en ligne complète avec différents produits',
          'Système de paiement intégré',
          'Un design minimaliste avec de magnifiques visuels et animations.',
          'Configuration complète de l’URL et de l’hébergement, incluant le DNS et le SSL.',
        ],
      },
    },
    result: {
      en: 'This project brought Turbulente online and improved their digital presence.',
      fr: 'Ce projet a permis à Turbulente de passer en ligne et d’améliorer sa présence digitale.',
    },
    link: {
      intro: { en: 'Click here to see the', fr: 'Cliquez ici pour voir le' },
      text: { en: 'website', fr: 'site web' },
      href: 'https://www.turbulente.fr/',
    },
    technologies: ['Wix', 'Wix studio', 'Google console', 'Google analytics', 'Figma'],
    photo: turbulentePhoto,
    photoAlt: {
      en: 'Billy Nightingale client Turbulente, website screenshot',
      fr: 'Billy Nightingale client Turbulente, capture ecran de site web',
    },
    photoMaxWidth: 1440,
  },
]

export const webApps: Project[] = [
  {
    category: { en: 'Full-Stack', fr: 'Full-Stack' },
    name: { en: 'World Surf Journal', fr: 'World Surf Journal' },
    summary: {
      en: [
        "The World Surf Journal is a web application that allows the user to register an account and save their surf trips with various details. It's a CRUD application and the user can create, replace, update and delete their surf trips. It's a fullstack application and consists of a frontend, backend and database. Take a look at the deployed ",
        { text: 'web app', href: 'https://worldsurfjournal.netlify.app' },
        '. Click here to see the frontend ',
        { text: 'GitHub repository', href: 'https://github.com/Billy-Night/world_surf_journal' },
        ' and the backend ',
        { text: 'GitHub repository', href: 'https://github.com/Billy-Night/world_surf_journal_backend' },
        '.',
      ],
      fr: [
        "Le World Surf Journal est une application web qui permet à l'utilisateur de créer un compte et d'enregistrer ses voyages de surf avec divers détails. C'est une application CRUD, et l'utilisateur peut créer, remplacer, mettre à jour et supprimer ses voyages de surf. Il s'agit d'une application fullstack composée d'un frontend, d'un backend et d'une base de données. Découvrez la ",
        { text: 'web app déployée', href: 'https://worldsurfjournal.netlify.app' },
        '. Le dépôt du frontend est disponible sur ',
        { text: 'GitHub', href: 'https://github.com/Billy-Night/world_surf_journal' },
        ' et celui du backend sur ',
        { text: 'GitHub', href: 'https://github.com/Billy-Night/world_surf_journal_backend' },
        '.',
      ],
    },
    technologies: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Express', 'MySQL'],
    photo: surfJournalPhoto,
    photoAlt: {
      en: 'The World Surf Journal, a full-stack application created by Billy',
      fr: "Capture d'écran de World Surf Journal, une application fullstack, créé par Billy Nightingale",
    },
  },
  {
    category: { en: 'Frontend Project', fr: 'Projet frontend' },
    name: { en: 'Weather Wise', fr: 'Weather Wise' },
    summary: {
      en: [
        "Weather Wise is a weather & sport application, that will provide the user with a rating on how good the conditions are for that day in their selected sport, which is calculated using an algorithm, which depends on certain weather condition in their current selected location. The application uses API's to get current weather and location information. Click to see a demo of the ",
        { text: 'Web App', href: 'https://weatherwise.netlify.app/' },
        ', click here to see the ',
        { text: 'GitHub repository', href: 'https://github.com/Billy-Night/weather_wise_app' },
        '.',
      ],
      fr: [
        "Weather Wise est une application météo et sport qui fournit à l'utilisateur une évaluation de la qualité des conditions météo pour sa pratique sportive choisie, calculée à l'aide d'un algorithme basé sur certaines conditions météorologiques et de sa localisation actuelle. L'application utilise des API pour obtenir les informations météo et de localisation actuelles. Live: ",
        { text: 'web app', href: 'https://weatherwise.netlify.app/' },
        ', Le dépôt GitHub du frontend est disponible ici: ',
        { text: 'dépôt GitHub', href: 'https://github.com/Billy-Night/weather_wise_app' },
        '.',
      ],
    },
    technologies: ['HTML', 'CSS', 'JavaScript', 'React', 'OpenWeather API'],
    photo: weatherWisePhoto,
    photoAlt: {
      en: 'Screenshot of Weather Wise a React web application created by Billy',
      fr: "Capture d'écran de Weather Wise, une application frontend, créé par Billy Nightingale",
    },
  },
  {
    category: { en: 'Client Project', fr: 'Projet de client' },
    name: { en: 'TROWIT', fr: 'TROWIT' },
    summary: {
      en: 'The TROWIT project has been created to improve the transfer of business and personal details between people. It fills this need by passing user information digitally in the form of Business Cards. The user can set-up an account and create their digital business cards, they can then order these cards as physical cards, which is a service TROWIT will provide. The user can connect with other users via their cards with a URL link. Apologies but the repository is private, I would be happy to discuss the project on request.',
      fr: "Le projet TROWIT a été créé pour améliorer le transfert d'informations professionnelles et personnelles entre les personnes. Il répond à ce besoin en transmettant les informations des utilisateurs sous forme de cartes de visite numériques. L'utilisateur peut créer un compte et concevoir ses cartes de visite numériques, puis les commander sous forme de cartes physiques, un service que TROWIT proposera. L'utilisateur peut se connecter avec d'autres utilisateurs via leurs cartes grâce à un lien URL. Désolé, mais le dépôt est privé. Je serai heureux de discuter du projet sur demande.",
    },
    technologies: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Express', 'MySQL'],
    photo: trowitPhoto,
    photoAlt: {
      en: 'Screenshot of the TROWIT full-stack application created by Billy',
      fr: "Capture d'écran de TROWIT, une application fullstack, créée par Billy Nightingale",
    },
  },
]
