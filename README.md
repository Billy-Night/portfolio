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

## Structure

```
src/
  pages/            One file per URL. French pages are in pages/fr/.
  layouts/          BaseLayout.astro: the whole <head> (meta tags, canonical, hreflang, social tags, structured data)
  components/       Header, Footer, CookieBanner, Analytics, NotFound
  i18n/routes.ts    Every page URL in both languages. Canonicals, hreflang and the language switch come from here.
  data/schema.ts    Shared structured data (the "Person" used on every page)
  utils/            assetUrl(): adds a content hash to /css/style.css and /script.js
public/             Served as-is: CSS, script.js, images, fonts, robots.txt, sitemap.xml, llms.txt,
                    the Markdown copies of each page, and Netlify's _redirects and _headers
netlify/functions/  contact.js: the contact form backend (forwards to a Make.com webhook)
scripts/            seo_snapshot.py: the SEO snapshot and compare tool
seo-baseline/       The SEO baseline the build is compared against
```

## URLs must not change

The live URLs have no trailing slash (`/about`, `/fr/a-propos`), except the two homepages (`/` and `/fr/`). `astro.config.mjs` keeps it that way with `build.format: 'preserve'` and `trailingSlash: 'never'`. To add a page, add it to `src/i18n/routes.ts`, create the page file in both languages, and add it to `public/sitemap.xml`.

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

Netlify builds from `netlify.toml` (`npm run build`, publishing `dist/`). The contact function needs the `MAKE_FORM_API` environment variable. The production site sits behind Cloudflare, which rewrites email links and adds its own block to `robots.txt`.

Known open items are listed in [MIGRATION_ISSUES.md](MIGRATION_ISSUES.md).
