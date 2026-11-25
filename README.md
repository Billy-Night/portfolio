# Billy Nightingale – Web Design & Development Studio

The website for [billynightingale.com](https://www.billynightingale.com/), in English and French. Built with [Astro](https://astro.build/) as a fully static site and hosted on Netlify.

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies (Node 22.23.4 or newer; Netlify uses Node 24) |
| `npm run dev` | Start the local dev server |
| `npm run build` | Build the site into `dist/` |
| `npm run preview` | Serve the built site locally |
| `npm run seo:compare` | Compare the build against the SEO baseline (run `npm run build` first) |
| `npm run check` | Type-check the Astro files: wrong props, missing imports, undefined variables. Expect 0 errors. It lists one hint, for a function the cookie banner script shares with the analytics script on purpose |

## Structure

```
src/
  pages/            One file per URL. French pages are in pages/fr/.
                    sitemap.xml.ts writes /sitemap.xml from the list of pages at build time.
  layouts/          BaseLayout.astro: the whole <head> (meta tags, canonical, hreflang, social tags, structured data)
  components/       Header, Footer, CookieBanner, Analytics, NotFound
  assets/images/    Photos, served from /_astro/ through components/Photo.astro (originals untouched, smaller versions for small screens).
  i18n/routes.ts    Every page URL in both languages. Canonicals, hreflang and the language switch come from here.
  data/schema.ts    Shared structured data (the "Person" used on every page)
  scripts/          One script per feature (header menu, cookie banner, reviews, timeline, contact form...).
                    Each component imports the one it needs, so a page only loads the scripts it uses.
  styles/           The stylesheet, one file per part of the site. Joined into public/css/style.css (see styles/README.md).
  utils/            assetUrl(): adds a content hash to /css/style.css
public/             Served as-is: the social preview image, logos, icons, fonts, robots.txt, llms.txt,
                    the Markdown copies of each page, and Netlify's _redirects and _headers
netlify/functions/  contact.js: the contact form backend (forwards to a Make.com webhook, and emails an alert if that fails)
scripts/            seo_snapshot.py: the SEO snapshot and compare tool. dev/: regression tests for behaviour, layout and images
seo-baseline/       The SEO baseline the build is compared against
```

## URLs must not change

The live URLs have no trailing slash (`/about`, `/fr/a-propos`), except the two homepages (`/` and `/fr/`). `astro.config.mjs` keeps it that way with `build.format: 'preserve'` and `trailingSlash: 'never'`. To add a page, add it to `src/i18n/routes.ts`, create the page file in both languages, and add it to `public/sitemap.xml`.

## Adding a photo

Export the photo as WebP at the quality you want, at about twice the size it will be displayed. Put it in `src/assets/images/`, import it in the component and use `Photo`:

```astro
---
import Photo from '../Photo.astro'
import photo from '../../assets/images/portraits/my_photo.webp'
---
<Photo src={photo} alt="…" class="…" loading="lazy" />
```

[Photo.astro](src/components/Photo.astro) serves your file as it is, with no recompression, and generates smaller versions for small screens. Add `maxWidth={…}` only when the file is much larger than it is ever displayed. Use `loading="eager"` only for an image visible when the page first opens.

The originals are also copied to `dist/assets/` on every build (see `legacyImageUrls` in `astro.config.mjs`), so the image addresses the site used before Astro keep working.

## Checking SEO before a deploy

`scripts/seo_snapshot.py` records what search engines see on every page: title, meta tags, canonical, hreflang, structured data, headings, links, image alt text and visible text.

```bash
npm run build
npm run seo:compare        # lists every difference from seo-baseline/local.json
```

When a difference is intended, accept it by taking a new baseline:

```bash
python3 scripts/seo_snapshot.py snapshot dist seo-baseline/local.json
```

`python3 scripts/seo_snapshot.py check seo-baseline/local.json` runs consistency checks: canonicals, hreflang pairs, sitemap coverage and internal links.

## Deployment

Netlify builds from `netlify.toml` (`npm run build`, publishing `dist/`). The contact function needs the `MAKE_FORM_API` environment variable. To email you when a message cannot be delivered to Make, it also needs `BREVO_API_KEY` and `ALERT_EMAIL_TO` (and optionally `ALERT_EMAIL_FROM`): see the top of `netlify/functions/contact.js`. The production site sits behind Cloudflare, which rewrites email links and adds its own block to `robots.txt`.

Known open items are listed in [MIGRATION_ISSUES.md](MIGRATION_ISSUES.md).
