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

### 1. French footer "Landes" link does nothing (all French pages)
- **Where:** [Footer.astro](src/components/Footer.astro) (`TODO`), and inline in every other `src/pages/fr/*.astro` until they're ported. Search for `<li class="footer__nav__link" href=`.
- **Problem:** the `href` is on the `<li>`, not the `<a>`, so clicking does nothing. French pages also lose an internal link to the Landes page.
- **Fix:** `<li><a class="footer__nav__link" href="/fr/creation-site-web-landes">Landes</a></li>`

### 2. Services pages link to the English contact page via a redirect
- **Where:** [services.astro](src/pages/services.astro) and [fr/services.astro](src/pages/fr/services.astro), 3× each. Search for `href="/contact.html"`.
- **Problem:** French visitors are sent to the **English** contact page. Every click also goes through a 301 redirect.
- **Fix:** use `/fr/contact` on the French page and `/contact` on the English page.

### 3. French homepage `og:image` is a relative URL
- **Where:** [fr/index.astro](src/pages/fr/index.astro). Search for `og:image`.
- **Problem:** the value is `/assets/meta_preview1200x600.webp`. Facebook, LinkedIn, WhatsApp and others need an absolute URL, so shares of `/fr/` probably show no preview image.
- **Fix:** it is handled automatically once the page uses `BaseLayout`, which always outputs the absolute URL. The SEO compare will then show this as an expected change.

### 4. `og:image:height` is wrong
- **Where:** every page (in `BaseLayout.astro` once ported).
- **Problem:** it says `627`, but `meta_preview1200x600.webp` is actually **1200×600**.
- **Fix:** set it to `600` (or make a 1200×630 image, the recommended size).

### 5. English Landes page title has French spelling
- **Where:** [website-development-landes.astro](src/pages/website-development-landes.astro). Search for `<title>`.
- **Problem:** "Website Design & **Développement** in Landes".
- **Fix:** "Website Design & Development in Landes | Billy Nightingale"

### 6. English contact footer "Projects" link points nowhere
- **Where:** [contact.astro](src/pages/contact.astro) (`TODO`, `projectsHref="#projects"`).
- **Problem:** `#projects` doesn't exist on the contact page.
- **Fix:** remove the `projectsHref` prop. The footer defaults to `/#projects`.

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
- `og:date` isn't a real Open Graph property, and the homepages disagree (EN `2025-11-19`, FR `2022-11-19`). Remove it.
- `og:site_name` and `og:image:alt` are only on the services pages. Add them to `BaseLayout` for every page.

### 11. Structured data (JSON-LD) is inconsistent between languages
- The English `Person` has `@id …/#person` with `addressRegion: "Landes"`. The French one has `@id …/fr/#person` with `addressRegion: "Nouvelle-Aquitaine"`, and fewer fields (no `sameAs`, `knowsAbout` or `description`).
- [fr/a-propos](src/pages/fr/a-propos.astro) already uses the shared `…/#person` id (with `addressRegion: "Landes"`), so the French pages aren't even consistent with each other.
- Google may read these as **two different people**. Use one shared `@id` (`https://www.billynightingale.com/#person`) and the same data, translating only the text fields.
- Fix: move the shared schema into one file, e.g. `src/data/schema.ts`, and import it on each page.

### 12. French contact page has English image alt text
- **Where:** [fr/contact.astro](src/pages/fr/contact.astro). Search for "having a meeting with clients".
- Translate it, e.g. "Billy Nightingale, web designer, en rendez-vous avec des clients à Hossegor".

### 13. Legal pages and 404 have their own `<head>`
- `terms-and-conditions`, `cgv` and `404` use different favicon tags (`shortcut icon`, `apple-touch-icon`, `apple-mobile-web-app-title`) and have no Open Graph tags.
- Fix: move them onto `BaseLayout` (keep `robots="noindex, follow"` on the legal pages).

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

### 21. README
- [README.md](README.md) headings are missing the space after `#` (`#Personal Website`), so they don't render as headings.
- Worth updating for the Astro setup: `npm run dev` / `build` / `seo:compare`.

---

## ✅ Already fixed as a side effect of the port
- **fr/a-propos `twitter:url`:** it used `property="twitter:url"`; `BaseLayout` outputs the standard `name="twitter:url"`. X accepts both, so there's no SEO change, and the SEO compare treats them as the same tag.
- **Relative nav and footer links** (`href="about"`): they're now absolute (`/about`) everywhere. They resolve to the same URLs.

---

## Before merging `AstroTrans` → `main` (not bugs, but don't forget)
- [ ] Netlify dashboard → Build settings: the publish directory must be `dist`, or empty so [netlify.toml](netlify.toml) applies.
- [ ] Test the contact form on the branch deploy. The preview's address may need adding temporarily to `allowedOrigins` in [contact.js](netlify/functions/contact.js).
- [ ] Check that `/about.html` → 301 → `/about`, and that an unknown URL shows the 404 page.
- [ ] `python3 scripts/seo_snapshot.py compare seo-baseline/live.json https://<branch>--<site>.netlify.app`. Expect only the Cloudflare differences: email obfuscation and the managed `robots.txt`.
