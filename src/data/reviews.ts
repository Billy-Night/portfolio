// The client reviews on the homepage. Each entry holds the client's photo, name
// and words in both languages, one string per paragraph. To add a review, put
// the photo in src/assets/images/client_reviews/, import it below and copy an
// entry. The page shows them in this order.
// Used by src/components/home/HomeReviews.astro and, for clients with a
// project page, src/components/project/ProjectReview.astro.
import type { ImageMetadata } from 'astro'
import type { Lang } from '../i18n/routes'
import eveMariePhoto from '../assets/images/client_reviews/eve-marie-billy-web-design-client.webp'
import pacificCoastPhoto from '../assets/images/client_reviews/billy_nightingale_client_pacific_coast_cafe_web_design.webp'
import monkeyMoodPhoto from '../assets/images/client_reviews/monkey_mood_owners_jenny_matt_billy_nightingales_client.webp'

export interface Review {
  /** The `slug` of this client's project page in projects.ts, if it has one: the review is shown on that page too */
  project?: string
  /** Name and business, shown under the review */
  author: string
  photo: ImageMetadata
  photoAlt: Record<Lang, string>
  /** How the photo sits in its frame: 'client__portrait' shows the whole photo, 'client__portrait_1' fills the frame and crops the edges */
  photoClass: string
  paragraphs: Record<Lang, string[]>
}

export const reviews: Review[] = [
  {
    project: 'sophro-by-eve',
    author: 'Eve-Marie, Sophrologue, Montauban',
    photo: eveMariePhoto,
    photoAlt: {
      en: 'portrait of Eve-Marie, a client of Billy Nightingale',
      fr: 'Portrait d’Eve-Marie, cliente de Billy Nightingale',
    },
    photoClass: 'client__portrait',
    paragraphs: {
      en: [
        'Trust Billy! He created my website from start to finish, as well as my blog, in September 2025. He is extremely professional, detail-oriented, and very pleasant to work with. By choosing him, you’re choosing excellent value for money. He speaks French very fluently, makes strong and relevant suggestions throughout the entire project process — and even afterwards. He always takes every request into account. I truly recommend him without hesitation.',
      ],
      fr: [
        "Faites confiance à Billy ! Il m'a créé mon site internet de A à Z ainsi que mon blog en Septembre 2025. C'est une personne extrêmement professionnelle, perfectionniste et très aimable. En le choisissant, vous choisissez l'excellent rapport qualité/prix. Il parle très très bien français, est force de proposition sur tout le process de la conception du projet et même après. Il prends à chaque fois en compte toutes les demandes. Vraiment, je le recommande sans hésitez.",
      ],
    },
  },
  {
    project: 'pacific-coast-cafe',
    author: 'Izia Dunn - Pacific Coast Cafe',
    photo: pacificCoastPhoto,
    photoAlt: {
      en: 'Portrait of Aaron and Izia the owners of Pacific Coast Cafe',
      fr: 'Portrait d’Aaron et Izia, propriétaires du Pacific Coast Cafe et clients de Billy Nightingale',
    },
    photoClass: 'client__portrait_1',
    paragraphs: {
      en: [
        'We hired Billy to create our online store, which is linked to our website, as well as for maintenance and SEO work, and we are absolutely delighted with the result!',
        "Billy is very attentive, responsive, always available, and incredibly kind. Highly professional, he doesn't just execute tasks: he advises, proposes relevant solutions, and even takes the time to do research for us. Thanks to him, we had a clear vision of the actions to take throughout the entire process (with organized lists on Notion), which made the process very smooth.",
        'His support goes far beyond simple technical services: he is a true partner we can trust. We wholeheartedly recommend him. A huge thank you for this excellent work, Billy!',
      ],
      fr: [
        'Nous avons fait appel à Billy pour la création de notre e-shop relié à notre site web, ainsi que pour la maintenance et le travail sur le SEO, et nous sommes absolument ravis du résultat !',
        'Billy est très à l’écoute, réactif, toujours disponible et d’une grande gentillesse. Très professionnel, il ne se contente pas d’exécuter : il conseille, propose des solutions pertinentes et prend même le temps de faire des recherches pour nous. Grâce à lui, nous avons eu une vision claire des actions à mener tout le long (avec des listes organisées sur Notion) ce qui a rendu le processus très fluide.',
        'Son accompagnement va bien au-delà de la simple prestation technique : c’est un vrai partenaire de confiance. Nous ne pouvons que le recommander les yeux fermés. Un grand merci pour ce travail de qualité Billy !',
      ],
    },
  },
  {
    project: 'monkey-mood',
    author: 'Matt Hughes - Monkey Mood',
    photo: monkeyMoodPhoto,
    photoAlt: {
      en: 'Portrait of Matt and Jenny the owners of Monkey Mood restaurant, billy nightingale web design client',
      fr: 'Matt et Jenny, propriétaires du restaurant Monkey Mood à Capbreton et clients de Billy Nightingale Création de Sites Web',
    },
    photoClass: 'client__portrait_1',
    paragraphs: {
      en: [
        "A huge thank you to Billy for creating our fantastic website. He designed and built a bespoke WordPress site that perfectly meets our needs. If you're looking for a professional website with online booking functionality and multiple pages for your business, we highly recommend working with Billy.",
        'His strong understanding of the local Capbreton and Hossegor market was invaluable in helping us identify our requirements and shape the project. Throughout the process, his attention to detail, professionalism, and communication were exceptional.',
        'Thank you again!',
      ],
      fr: [
        "Un immense merci à Billy pour notre superbe site web, qu'il a conçu et réalisé sur mesure avec WordPress. Si vous avez besoin d'un site web fonctionnel avec un système de réservation et plusieurs pages pour votre entreprise, nous vous recommandons vivement Billy.",
        'Sa connaissance approfondie du marché local de Capbreton et Hossegor nous a également été précieuse pour définir précisément nos besoins. Son souci du détail et sa communication sont les points forts de son travail.',
        'Encore merci !',
      ],
    },
  },
]
