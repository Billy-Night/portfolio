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

### 13. Legal pages have no Open Graph tags
- **Where:** [terms-and-conditions.astro](src/pages/terms-and-conditions.astro) and [fr/cgv.astro](src/pages/fr/cgv.astro).
- They now use the standard icons from `BaseLayout` (fixed with #25), but still pass no `og` / `twitter` props, so a shared link shows no preview. Low priority, because both pages are `noindex`.
- **Fix:** add `og` and `twitter` props, as on the other pages.

### 28. English homepage has a "Projets" link
- **Where:** [index.astro](src/pages/index.astro). Search for `>Projets<`.
- A link on the English homepage uses the French word. Change it to "Projects".

### 26. Legal page copy has mixed languages
- [terms-and-conditions.astro](src/pages/terms-and-conditions.astro): the English page says "Website **Création** &amp; Web **Développement**" under the `<h1>`.
- [fr/cgv.astro](src/pages/fr/cgv.astro): the meta description starts in English ("Portfolio of Billy Nightingale, web developer and designer based in…") and ends in French.
- Low priority, because both pages are `noindex`.

---

## 🟡 Code quality and other issues

### 14. Terms page loads Google Fonts for nothing
- **Where:** [terms-and-conditions.astro](src/pages/terms-and-conditions.astro), the `<Fragment slot="head">` block (`TODO`): two `preconnect` tags and the Oxygen / Oxygen Mono stylesheet.
- **Problem:** "Oxygen" isn't referenced anywhere in [style.css](public/css/style.css), so the fonts are never used. The page still sends every visitor's IP address to Google, which is a GDPR risk in the EU (German courts have fined sites for this).
- **Fix:** delete the `<Fragment slot="head">` block. Nothing should change visually.

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

## ✅ Fixed after the port (one commit each, new baseline after each)
- **#1 French footer "Landes" link:** now a working link on fr/contact and fr/a-propos. The `legacyBrokenLandesLink` prop is gone.
- **#2 Services pages' contact links:** `/contact.html` is now `/contact` on the English page and `/fr/contact` on the French page.
- **Wrong-language links (found while fixing #2):** fr/a-propos "Services" now goes to `/fr/services`, fr/services "Devis" to `/fr/contact`, and the English Landes "Quote" button to `/contact`.
- **#3 French homepage `og:image`:** now an absolute URL.
- **#24 French homepage `og:type`:** now `website`.
- **#4 `og:image:height`:** now `600` on every page.
- **#5 English Landes spelling:** "Development" in the title, `og:title`, `twitter:title` and the structured data.
- **#6 "Projects" links:** contact, services and Landes now link to `/#projects`. The `projectsHref` prop is gone.
- **#25 Broken favicon and manifest links:** the legal pages use the standard `BaseLayout` icons, and the 404 uses the same icon files.
- **#22 Structured data URLs:** no trailing slashes, on the about, services and Landes pages.

## ✅ Already fixed as a side effect of the port
- **fr/a-propos `twitter:url`:** it used `property="twitter:url"`; `BaseLayout` outputs the standard `name="twitter:url"`. X accepts both, so there's no SEO change, and the SEO compare treats them as the same tag.
- **Landes pages:** the `script.js` tag now comes before the structured data instead of after it. The script is deferred, so behaviour is the same.
- **Homepage `#projects` links:** they're now `/#projects`. On the homepage that's the same link, and clicking still scrolls on the page.
- **Relative nav and footer links** (`href="about"`): they're now absolute (`/about`) everywhere. They resolve to the same URLs.

---

## Before merging `AstroTrans` → `main`
- [x] Netlify builds the branch from [netlify.toml](netlify.toml) (Node 24, publish `dist`).
- [x] Contact form tested on the branch deploy, in both languages.
- [x] `/about.html` → 301 → `/about`, and an unknown URL returns the 404 page.
- [x] SEO compare of the branch deploy against `seo-baseline/live.json`: only the Cloudflare differences (email obfuscation and the managed `robots.txt`). This was run before the 🔴 fixes.
- [ ] Push the 🔴 fixes and look over the branch deploy once more: favicons on the legal pages, the footer "Landes" link on the French pages, the services "Book a call" / "Devis" buttons.
- [ ] Visual check on desktop and mobile: fonts, images, animations, sliders, mobile menu, cookie banner, language switch.
- [ ] Optional: remove the branch-deploy address from `allowedOrigins` in [contact.js](netlify/functions/contact.js) once testing is finished.
- [ ] After merging: share the homepage and `/fr/` in a social preview tool to confirm the preview image now shows, and check Search Console over the following days.
