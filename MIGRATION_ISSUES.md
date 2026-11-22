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

## ✅ Standardised after the port (one commit each, new baseline after each)
- **#7 Footer:** one markup on every page, `<footer class="sections" id="footer">` after `</main>`, and one heading per language ("Create your digital system" / "Création de site web et système digital"). The CSS shows all `h3` headings in uppercase, so nothing changes visually. The legal pages have never had a footer and still don't.
- **#8 Header alt text:** logo is "Billy Nightingale logo" / "Logo Billy Nightingale"; menu icon is "Menu icon" / "Icône du menu".
- **#9 Terms page header:** now has the "Landes" link, like every other page.
- **#10 Social meta tags:** `twitter:domain`, `og:date` and `twitter:date` are removed. `og:site_name` and `og:image:alt` are on every page.
- **#11 Structured data:** one shared Person in [src/data/schema.ts](src/data/schema.ts), with the same `@id` (`https://www.billynightingale.com/#person`), region ("Landes") and details on every page, translated per language. Edit that file to change the job title, description or skills everywhere.
- **#12 French contact page:** the image alt text is in French.
- **#13 Legal pages:** they now have Open Graph and Twitter tags. `og` and `twitter` default to the page title and description in `BaseLayout`.
- **#26 Legal page copy:** the English terms page says "Website Creation & Web Development", and the French CGV's meta description is fully in French.
- **#28 English homepage:** the "Projets" button now says "Projects".

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
