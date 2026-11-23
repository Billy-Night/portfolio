// The homepage FAQ. Each entry holds a question and its answer in both
// languages. To add one, copy an entry and change its text: the page shows
// them in this order, and the first is open when the page loads.
// Used by src/components/home/HomeFaq.astro.
import type { Lang } from '../i18n/routes'

interface FaqEntry {
  question: Record<Lang, string>
  answer: Record<Lang, string>
}

export const faq: FaqEntry[] = [
  {
    question: {
      en: 'How much does a website cost?',
      fr: 'Combien coûte un site internet ?',
    },
    answer: {
      en: 'Every project is different, but most websites start from around 1,500€. The final cost depends on the number of pages, functionality, content requirements, and integrations such as online booking or e-commerce.',
      fr: 'Chaque projet est différent, mais la plupart des sites internet commencent à partir d’environ 1 500 €. Le coût final dépend du nombre de pages, des fonctionnalités, des besoins en contenu et des intégrations telles que la réservation en ligne ou l’e-commerce.',
    },
  },
  {
    question: {
      en: 'How long does it take to build a website?',
      fr: 'Combien de temps faut-il pour créer un site internet ?',
    },
    answer: {
      en: 'Most websites take between 4 and 8 weeks from discovery to launch, depending on project complexity and how quickly content and feedback are provided.',
      fr: 'La plupart des sites internet nécessitent entre 4 et 8 semaines entre la phase de découverte et la mise en ligne, selon la complexité du projet et la rapidité avec laquelle les contenus et retours sont fournis.',
    },
  },
  {
    question: {
      en: 'Do you work with businesses outside Capbreton and Hossegor?',
      fr: 'Travaillez-vous avec des entreprises en dehors de Capbreton et Hossegor ?',
    },
    answer: {
      en: "Yes. While I'm based in Capbreton, I work with businesses throughout France and internationally.",
      fr: 'Oui. Bien que je sois basé à Capbreton, je travaille avec des entreprises partout en France et à l’international.',
    },
  },
  {
    question: {
      en: 'Will my website appear on Google?',
      fr: 'Mon site apparaîtra-t-il sur Google ?',
    },
    answer: {
      en: 'Every website is built with SEO best practices in mind, including performance, accessibility, technical SEO, and clear site structure. SEO is a long-term process, but your website will be set up to give you the best possible foundation.',
      fr: 'Chaque site est conçu selon les bonnes pratiques SEO, notamment en matière de performance, d’accessibilité, de référencement technique et de structure du contenu. Le SEO est un travail de long terme, mais votre site sera construit sur des bases solides pour maximiser ses chances de visibilité.',
    },
  },
  {
    question: {
      en: 'Can you redesign my existing website?',
      fr: 'Pouvez-vous refondre un site internet existant ?',
    },
    answer: {
      en: 'Yes. Whether your current website needs a visual refresh, improved performance, better SEO, or new functionality, I can help modernise and optimise it.',
      fr: 'Oui. Que votre site ait besoin d’un nouveau design, de meilleures performances, d’un SEO plus efficace ou de nouvelles fonctionnalités, je peux vous aider à le moderniser et à l’optimiser.',
    },
  },
  {
    question: {
      en: 'Do you provide maintenance?',
      fr: 'Proposez-vous un service de maintenance ?',
    },
    answer: {
      en: 'Yes. Ongoing maintenance plans are available and can include updates, backups, security monitoring, performance checks, and technical support.',
      fr: 'Oui. Des forfaits de maintenance sont disponibles et peuvent inclure les mises à jour, les sauvegardes, la surveillance de la sécurité, les contrôles de performance et l’assistance technique.',
    },
  },
  {
    question: {
      en: 'Can you add online booking or e-commerce?',
      fr: 'Pouvez-vous ajouter une réservation en ligne ou une boutique e-commerce ?',
    },
    answer: {
      en: "Yes. I can integrate online booking systems, e-commerce platforms, and other third-party tools to enhance your website's functionality and meet your business needs.",
      fr: 'Oui. Je peux intégrer des systèmes de réservation en ligne, des solutions e-commerce, des paiements sécurisés ainsi que des outils adaptés aux besoins de votre activité.',
    },
  },
  {
    question: {
      en: 'Do I own my website?',
      fr: 'Suis-je propriétaire de mon site internet ?',
    },
    answer: {
      en: "Yes. Once the project is complete and paid for, you own the website and its content. You'll also receive access to the tools needed to manage it.",
      fr: 'Oui. Une fois le projet terminé et réglé, vous êtes propriétaire de votre site et de son contenu. Vous recevrez également les accès aux outils nécessaires pour le gérer.',
    },
  },
  {
    question: {
      en: 'What do you need from me to get started?',
      fr: 'De quoi avez-vous besoin pour commencer un projet ?',
    },
    answer: {
      en: 'Usually I need an initial discussion about your business goals, any existing branding or content, and an understanding of what you want your website to achieve.',
      fr: 'Généralement, j’ai besoin d’un premier échange pour comprendre vos objectifs, votre activité, votre contenu existant et ce que vous souhaitez accomplir avec votre site internet.',
    },
  },
  {
    question: {
      en: "Can you help improve an existing website's SEO?",
      fr: 'Pouvez-vous améliorer le SEO d’un site existant ?',
    },
    answer: {
      en: 'Yes. I can audit your current website, identify opportunities, and implement improvements to help increase visibility and generate more qualified traffic.',
      fr: 'Oui. Je peux réaliser un audit de votre site actuel, identifier les opportunités d’amélioration et mettre en place des optimisations pour augmenter votre visibilité et attirer un trafic plus qualifié.',
    },
  },
]
