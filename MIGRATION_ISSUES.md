# Issues to fix after the Astro migration

These issues were found while porting the site to Astro. They have been **kept exactly as they were on purpose**, so the port stays a 1:1 copy and the SEO compare stays clean.

## How to work through them
- Fix them **after every page is ported**.
- Make each fix its own commit, so every SEO-visible change can be reviewed on its own.

After each fix:
1. `npm run build && npm run seo:compare`. It should report **only** the change you intended.
2. When you're happy with it, take a new baseline: `python3 scripts/seo_snapshot.py snapshot dist seo-baseline/local.json`.

Locations are given as files plus a search string, because line numbers move during the port. Entries marked `TODO` already have a matching `TODO` comment in the code.

---

## 🔴 Broken or SEO-affecting (fix first)

### 1. French footer "Landes" link does nothing (fr/contact and fr/a-propos)
- **Where:** [fr/contact.astro](src/pages/fr/contact.astro) and [fr/a-propos.astro](src/pages/fr/a-propos.astro). Search for `legacyBrokenLandesLink`.
- **Problem:** on these two pages the `href` is on the `<li>`, not the `<a>`, so clicking does nothing, and the pages lose an internal link to the Landes page. The other French pages are correct.
- **Fix:** remove the `legacyBrokenLandesLink` prop from both pages, then delete the prop and its branch from [Footer.astro](src/components/Footer.astro).

### 2. Services pages link to the English contact page via a redirect
- **Where:** [services.astro](src/pages/services.astro) and [fr/services.astro](src/pages/fr/services.astro), 3× each. Search for `href="/contact.html"`.
- **Problem:** French visitors are sent to the **English** contact page. Every click also goes through a 301 redirect.
- **Fix:** use `/fr/contact` on the French page and `/contact` on the English page.

### 3. French homepage `og:image` is a relative URL
- **Where:** [fr/index.astro](src/pages/fr/index.astro) (`TODO`). Search for `ogImage=`.
- **Problem:** the value is `/assets/meta_preview1200x600.webp`. Facebook, LinkedIn, WhatsApp and others need an absolute URL, so shares of `/fr/` probably show no preview image.
- **Fix:** delete the `ogImage` and `twitterImage` props from the page. `BaseLayout` then outputs the absolute URL for both.

### 24. French homepage `og:type` is "site web"
- **Where:** [fr/index.astro](src/pages/fr/index.astro) (`TODO`). Search for `ogType=`.
- **Problem:** `og:type` is a fixed keyword, not text to translate. "site web" isn't a valid value; it must be `website`.
- **Fix:** delete the `ogType` prop. `BaseLayout` defaults to `website`.

### 4. `og:image:height` is wrong on most pages
- **Where:** the default in [BaseLayout.astro](src/layouts/BaseLayout.astro) (`ogImageHeight = '627'`).
- **Problem:** `meta_preview1200x600.webp` is actually **1200×600**. Only the two services pages have the right value (`ogImageHeight="600"`).
- **Fix:** change the default to `'600'` and remove the `ogImageHeight` prop from the services pages. Or make a 1200×630 image, the recommended size, and use `630` everywhere.

### 5. English Landes page title has French spelling
- **Where:** [website-development-landes.astro](src/pages/website-development-landes.astro). Search for `<title>`.
- **Problem:** "Website Design & **Développement** in Landes".
- **Fix:** "Website Design & Development in Landes | Billy Nightingale"

### 6. "Projects" links that point nowhere (English contact, services, Landes)
- **Where:** search for `projectsHref="#projects"`.
  - Footer on [contact.astro](src/pages/contact.astro), [services.astro](src/pages/services.astro) and [website-development-landes.astro](src/pages/website-development-landes.astro).
  - The **header** on the Landes page too.
- **Problem:** `#projects` only exists on the homepage, so on these pages the link does nothing.
- **Fix:** remove the `projectsHref` props. Header and Footer default to `/#projects`.

### 25. Broken favicon and manifest links on the legal pages and the 404
- **Where:** [terms-and-conditions.astro](src/pages/terms-and-conditions.astro), [fr/cgv.astro](src/pages/fr/cgv.astro) and [404.astro](src/pages/404.astro). Search for `/assets/favicon/`.
- **Problem:** the folder `/assets/favicon/` doesn't exist. Every icon, apple-touch-icon and manifest link on these three pages returns a 404, so they show no favicon and each make several failed requests.
- **Fix:** for the legal pages, see #13 (delete the legacy block). For the 404, replace the tags with the standard ones: `/favicon-n-v1-*.png` and `/site.webmanifest`.

### 22. About pages' structured data uses trailing-slash URLs
- **Where:** [about.astro](src/pages/about.astro) and [fr/a-propos.astro](src/pages/fr/a-propos.astro), in the `ProfilePage` object in `jsonLd`.
- **Problem:** `url` and `@id` are `…/about/` and `…/fr/a-propos/`, but the canonicals are `…/about` and `…/fr/a-propos`. Structured data that points at a different URL from the canonical gives Google mixed signals.
- **Fix:** remove the trailing slash: `"url": "https://www.billynightingale.com/about"`, `"@id": "https://www.billynightingale.com/about#webpage"`. Even better, build both from `url('about', lang)` in [routes.ts](src/i18n/routes.ts).

---

## 🟠 Inconsistencies between pages (standardise once all pages use the components)

### 7. Footer structure and wording differ from page to page
- The English contact page wraps a bare `<footer>` in `<section class="sections" id="footer">` **inside `<main>`**. Every other page uses `<footer class="sections" id="footer">` after `</main>`. Fix: remove `wrapInSection` in [contact.astro](src/pages/contact.astro) and move `<Footer>` below `</main>`. Check the styling afterwards.
- The footer `<h3>` varies: "Create your digital system" (contact) vs "CREATING YOUR DIGITAL SYSTEM" (about). Pick one per language.
- The about pages' footers have no `id="footer"`. Check whether `script.js` or any anchor links rely on it.

### 8. Header alt text differs from page to page
- Logo `alt`: "Billy Nightingales logo" / "…logo for creating websites" / "…logo creation de site web" / "…logo pour créer le site web".
- Menu icon `alt`: "navigation menu icon" / "menu icon" / "icon de menu".
- Pick one per language and remove the `logoAlt` / `menuIconAlt` overrides. Also consider "Billy Nightingale logo" (no stray "s"). The French pages should have French alt text.

### 9. Terms page header has no "Landes" link
- **Where:** [terms-and-conditions.astro](src/pages/terms-and-conditions.astro).
- Probably an oversight. Fix it by removing `showLandes={false}` once the page is ported.

### 10. `<head>` extras are inconsistent
- `twitter:domain` has a different value on each page that has it (`https://www.billynightingale.com/`, `.../about`, `.../fr/`, `billynightingale.com`), and most pages don't have it at all. It should be just `billynightingale.com`, or be removed everywhere: X barely uses it.
- `og:date` and `twitter:date` aren't real Open Graph or X properties, and the homepages disagree (`og:date` is `2025-11-19` on EN and `2022-11-19` on FR). Remove the `ogDate` and `twitterDate` props from both homepages, then from `BaseLayout`.
- `og:site_name` and `og:image:alt` are only on the services pages. Add them to `BaseLayout` for every page.

### 11. Structured data (JSON-LD) is inconsistent between languages
- The English `Person` has `@id …/#person` with `addressRegion: "Landes"`. The French one has `@id …/fr/#person` with `addressRegion: "Nouvelle-Aquitaine"`, and fewer fields (no `sameAs`, `knowsAbout` or `description`).
- [fr/a-propos](src/pages/fr/a-propos.astro) already uses the shared `…/#person` id (with `addressRegion: "Landes"`), so the French pages aren't even consistent with each other.
- Google may read these as **two different people**. Use one shared `@id` (`https://www.billynightingale.com/#person`) and the same data, translating only the text fields.
- Fix: move the shared schema into one file, e.g. `src/data/schema.ts`, and import it on each page.

### 12. French contact page has English image alt text
- **Where:** [fr/contact.astro](src/pages/fr/contact.astro). Search for "having a meeting with clients".
- Translate it, e.g. "Billy Nightingale, web designer, en rendez-vous avec des clients à Hossegor".

### 13. Legal pages have their own legacy `<head>`
- **Where:** [terms-and-conditions.astro](src/pages/terms-and-conditions.astro) and [fr/cgv.astro](src/pages/fr/cgv.astro) (`TODO`). Search for `siteIcons={false}` and `<Fragment slot="head">`.
- **Problem:** they don't use the standard favicon, font preload or theme-color tags, and they have no Open Graph tags. Their own icon tags are broken (see #25). The two pages also differ from each other (`apple-mobile-web-app-title` is "Billy" on one and "B.N" on the other).
- **Fix:** delete the `siteIcons={false}` prop and the `<Fragment slot="head">` block on both pages. They then get the same icons as every other page. Keep `robots="noindex, follow"`. On the terms page, sort out the Google Fonts tags first (see #14).

### 26. Legal page copy has mixed languages
- [terms-and-conditions.astro](src/pages/terms-and-conditions.astro): the English page says "Website **Création** &amp; Web **Développement**" under the `<h1>`.
- [fr/cgv.astro](src/pages/fr/cgv.astro): the meta description starts in English ("Portfolio of Billy Nightingale, web developer and designer based in…") and ends in French.
- Low priority, because both pages are `noindex`.

---

## 🟡 Code quality and other issues

### 14. Terms page loads Google Fonts from Google's servers
- **Where:** [terms-and-conditions.astro](src/pages/terms-and-conditions.astro). Search for `fonts.googleapis.com` (Oxygen and Oxygen Mono).
- It's an extra external request, and in the EU it's a GDPR risk: German courts have fined sites for sending visitor IPs to Google Fonts. Self-host the fonts in `public/assets/fonts/` like the others, or use a font you already have.

### 15. `script.js` crashes on pages without certain elements
- `header.getBoundingClientRect()`, `navHamBtn.querySelector(...)` and similar run on every page and throw if the element is missing.
- Fix: split it into per-component `<script>` tags as the pages are componentised, or at least add null checks.

### 16. Analytics consent check is unreliable
- **Where:** [Analytics.astro](src/components/Analytics.astro), `loadClarity()`.
- `cookiesAccepted = localStorage.getItem('cookiesAccepted')` gives back the **string** `'false'`, and a non-empty string counts as true. The `!cookiesAccepted` guard therefore never blocks. It works today only because `loadClarity()` is called after consent.
- Fix: `=== 'true'`. Also remove the `console.log` calls before production.

### 17. Typo in the English contact form error
- **Where:** [contact.astro](src/pages/contact.astro). Search for "There was a issue".
- Fix: "There was an issue submitting the form, please try again."

### 18. Hardcoded copyright year
- **Where:** [Footer.astro](src/components/Footer.astro) (`&copy; 2026`).
- Could be `{new Date().getFullYear()}`, which updates at build time.

### 19. Manual CSS cache-busting
- `style.css?v=18` has to be bumped by hand. Once the CSS is imported through Astro (`src/styles/`), filenames are hashed automatically.
- Then add long caching for `/_astro/*` in [public/_headers](public/_headers).

### 20. Leftover commented-out code
- The Spline viewer `<section class="hero-phone">` block on both Landes pages.
- The apple-touch-icon `<link>` comment in the old heads.
- Remove them or bring them back.

### 23. Unused Font Awesome stylesheet on the about pages
- **Where:** [about.astro](src/pages/about.astro) and [fr/a-propos.astro](src/pages/fr/a-propos.astro), in `<Fragment slot="head">`. The original HTML had a `<!--! Need to check this -->` comment next to it.
- **Problem:** no `fa-` class is used anywhere: pages, CSS or `script.js`. It's a render-blocking request to a third-party CDN, loaded for nothing, so it slows first paint on the about pages.
- **Fix:** delete the `<Fragment slot="head">` block on both pages. Check the icons visually afterwards.

### 27. The 404 page is standalone and doesn't match the site
- **Where:** [404.astro](src/pages/404.astro). It was left as a standalone file during the port, on purpose.
- It has its own inline styles, no header or footer, English text only (French visitors get the same page), a "Go back home" link to the absolute production URL, and no `noindex`. It returns a 404 status, so the missing `noindex` is harmless.
- **Fix:** rebuild it on `BaseLayout` with `Header` and `Footer`, so it looks like the rest of the site. Netlify serves only one `404.html`, so make it bilingual on one page, or add a `/fr/*` rule in `_redirects` that points to a French 404.

### 21. README
- [README.md](README.md) headings are missing the space after `#` (`#Personal Website`), so they don't render as headings.
- Worth updating for the Astro setup: `npm run dev` / `build` / `seo:compare`.

---

## ✅ Already fixed as a side effect of the port
- **fr/a-propos `twitter:url`:** it used `property="twitter:url"`; `BaseLayout` outputs the standard `name="twitter:url"`. X accepts both, so there's no SEO change, and the SEO compare treats them as the same tag.
- **Landes pages:** the `script.js` tag now comes before the structured data instead of after it. The script is deferred, so behaviour is the same.
- **Homepage `#projects` links:** they're now `/#projects`. On the homepage that's the same link, and clicking still scrolls on the page.
- **Relative nav and footer links** (`href="about"`): they're now absolute (`/about`) everywhere. They resolve to the same URLs.

---

## Before merging `AstroTrans` → `main` (not bugs, but don't forget)
- [ ] Netlify dashboard → Build settings: the publish directory must be `dist`, or empty so [netlify.toml](netlify.toml) applies.
- [ ] Test the contact form on the branch deploy. The preview's address may need adding temporarily to `allowedOrigins` in [contact.js](netlify/functions/contact.js).
- [ ] Check that `/about.html` → 301 → `/about`, and that an unknown URL shows the 404 page.
- [ ] `python3 scripts/seo_snapshot.py compare seo-baseline/live.json https://<branch>--<site>.netlify.app`. Expect only the Cloudflare differences: email obfuscation and the managed `robots.txt`.
