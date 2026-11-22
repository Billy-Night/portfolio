# Astro migration: what was fixed and what is left

Every issue found while porting the site to Astro has been dealt with. This file records what changed, the improvements that are still optional, and the checklist for merging.

## How changes are checked
1. `npm run build && npm run seo:compare` lists every difference from the SEO baseline. It should show **only** the change you intended.
2. When you're happy with it, take a new baseline: `python3 scripts/seo_snapshot.py snapshot dist seo-baseline/local.json`.

Each fix below was made this way, one commit per fix.

---

## Optional improvements (nothing here is broken)

### A. Split the pages into section components
- **Done for the contact pages.** [ContactIntro.astro](src/components/contact/ContactIntro.astro) and [ContactForm.astro](src/components/contact/ContactForm.astro) are shared by both languages, each with its own translation table. The two page files are now 56 and 38 lines.
- **Done for the Landes pages.** Eight components in [src/components/landes/](src/components/landes/). The two page files went from about 480 lines to 66, and the built HTML is identical to before in both languages.
- **Done for the about pages.** Seven components in [src/components/about/](src/components/about/). The two page files went from about 1,100 lines to 55, and the built HTML is identical to before in both languages.
- **Still to do:** the homepages (about 1,500 lines each), services (900) and the legal pages (240). The page content is written out in full in both languages, so every layout change has to be made twice.
- The English and French versions line up well enough to share components: their markup differs by 0–4% per page pair, apart from the text. The differences that do exist are worth a look, because they're places where one language has drifted from the other: 34 on services (the French page has one more section), 12 on the homepage, 6 on the legal pages.
- **How to check each page:** the SEO compare must show no change, and the built HTML must be identical to the previous build apart from intended fixes.

### B. Split `script.js` per component
- [script.js](public/script.js) is one 970-line file loaded on every page. It was checked in a real browser on all 14 pages and throws no errors: every optional element is guarded with an `if`. The original issue #15 ("crashes on pages without certain elements") was wrong and is closed.
- Splitting it into per-component `<script>` tags would only make it easier to maintain. Do it together with A.

### C. Process the CSS and images through Astro
- **CSS:** bundling [style.css](public/css/style.css) through Astro was tried for #19 and reverted, because it changed how pages render:
  - The minifier keeps only the last of `backdrop-filter: blur(10px) saturate(120%)` and `-webkit-backdrop-filter: blur(10px)`, which is the `-webkit-` line. Chrome ignores that line, so the blur disappears. Putting the `-webkit-` line first in each of the 10 places would avoid this.
  - Astro puts the stylesheet link after `script.js` in `<head>`. The script then runs before the styles apply, and its reveal-on-scroll logic leaves sections hidden. Moving the `script.js` tag to the end of `<body>` would avoid this.
- **Images:** `astro:assets` could generate responsive sizes and modern formats for the images in `public/assets/` (7.3 MB in total).
- **Caching:** done and verified for `style.css` and `script.js` (one year). Images are still cached for 10 minutes, because their URLs have no version. Processing them through Astro would give them hashed URLs too.

### D. Unused files in `public/`
- 24 files in `public/assets/` (2.6 MB) aren't referenced by any page, stylesheet or script, for example `lazyBillyPortrait.jpeg`, `TROWITScreenShot.png`, `portrait_standing_laptop_v3.webp` and five of the `portraits/`. `favicon-n-v1-180.png` and `favicon-n-v1-512.png` aren't referenced either.
- Three font files are only mentioned in commented-out CSS: `DTGetaiGroteskDisplay-Black.woff2`, `MangoGrotesque-Black.woff2` and `MangoGrotesque-SemiBold.woff2`.
- Before deleting any image, check Search Console and Google Images: an old image URL may still get visits or be linked from elsewhere.

### F. English copy to proofread
These are your words, so they were left as written. Each is in the `en` table of the named component.

**About page** ([src/components/about/](src/components/about/)):
- `AboutProcess`: "PHASE 4 **Deployement**" (Deployment).
- `AboutWhatIDo`: "SEO & **PERFROMANCE** OPTIMISATION" (PERFORMANCE).

**Landes page** ([src/components/landes/](src/components/landes/)):
- `LandesSeoResults`: "My proven local SEO **strategeis**" (strategies); "While integrating **a** online shop" (an); "The **result are** easy to see" (results are); "Pacific **coast cafe**" (capitals).
- `LandesMission`: "high performance **website’s**" (websites); "premium **web sites**" (websites); "support local **business**" (businesses).
- `LandesApproach`: "designed to be **affective**" (effective); "the **companies** visual identity" (company's); "to **insure** your website stays" (ensure).
- `LandesStudio`: "Studio in **landes**" and "based in **capbreton**" (capitals).
- `LandesChallenges`: "I find tailored **solution** to my **clients** requirements" (solutions, clients').

### E. Small things noticed along the way
- The legal pages have no footer. Every other page does.
- Safari older than version 18 only reads the `-webkit-backdrop-filter` line, so it gets the blur without the `saturate()` part. The difference is barely visible.

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

## ✅ Optional improvements done so far
- **Header labels:** the logo link and menu button have French `aria-label`s on the French pages ("Accueil", "Ouvrir le menu").
- **Contact pages:** shared `ContactIntro` and `ContactForm` components (see A). Three strings on the French form that were still English are translated: the "Project details" heading and two placeholders.
- **French contact form:** the leftover `action`, `method` and `data-netlify` attributes are removed, so it matches the English form.
- **Landes pages:** eight shared section components (see A). The email button on the English page said "PAR MAIL"; it now says "EMAIL ME", as on the homepage.
- **About pages:** seven shared section components (see A). On the English page, the photo wrapper in the personal section now uses the same class as the French page (`layout-two-column-img`), which moves the text panel about 26px on desktop to where the French page has it.
- **Wrong-language text:** the English about page said "Développement" in three places (now "Development"), and the French about and Landes pages had four "PROJECTS" buttons (now "PROJETS").
- **Caching:** verified on the branch deploy. `style.css` and `script.js` are served with `max-age=31536000, immutable`, and everything else with the 10-minute value.

## ✅ Code quality fixes (one commit each)
- **#14 Google Fonts on the terms page:** removed. The Oxygen fonts were never used, and the page screenshot is pixel-identical without them.
- **#23 Font Awesome on the about pages:** removed. No `fa-*` class is used anywhere.
- **#17 Contact form error:** "There was an issue submitting the form, please try again."
- **#18 Copyright year:** set when the site is built.
- **#20 Commented-out markup:** seven blocks removed from the homepages and Landes pages (an old offer section, the Spline viewer, two project links and a tagline). They are in git history, in the commit "Remove commented-out markup from the homepages and Landes pages".
- **#16 Analytics consent:** `loadClarity()` and `loadGoogleAnalytics()` now check consent themselves, and the `console.log` calls are gone. Tested for nine combinations of domain and consent.
- **#19 Cache-busting:** `style.css` and `script.js` get a version from a hash of their contents (`assetUrl()` in [src/utils/assetVersion.ts](src/utils/assetVersion.ts)). No more `?v=18` to bump by hand. The files themselves are served untouched.
- **#27 404 page:** rebuilt on the site layout with the header, footer and cookie banner, in English and French ([NotFound.astro](src/components/NotFound.astro)). Unknown `/fr/…` addresses get the French version through a rule in [public/_redirects](public/_redirects).
- **#21 README:** rewritten for the Astro setup.
- **#15 `script.js` crashes:** not a bug. See B above.

## Before merging `AstroTrans` → `main`
- [ ] **In Make.com: check the old webhook.** The French contact form's HTML contained `action="https://hook.eu1.make.com/1sbn8f4m…"`, so that webhook URL was public on the live site and is still in the git history. It has been removed from the page. It isn't the webhook the Netlify function uses. If it's still active in Make, delete it or replace it with a new one, because anyone can post to it directly.
- [x] Netlify builds the branch from [netlify.toml](netlify.toml) (Node 24, publish `dist`).
- [x] Contact form tested on the branch deploy, in both languages.
- [x] `/about.html` → 301 → `/about`, and an unknown URL returns the 404 page.
- [x] SEO compare of the branch deploy against `seo-baseline/live.json`: only the Cloudflare differences (email obfuscation and the managed `robots.txt`). This was run before the fixes above.
- [ ] On the branch deploy: an unknown address such as `/nope` shows the new English 404, and `/fr/nope` shows the French one. Both must return status 404.
- [ ] Visual check on desktop and mobile: fonts, images, animations, sliders, mobile menu, cookie banner, language switch, the contact page footer.
- [ ] Accept the cookie banner on the live site after merging and confirm in the browser's Network tab that Clarity and Google Analytics load, and that they don't load after "Deny".
- [ ] Optional: remove the branch-deploy address from `allowedOrigins` in [contact.js](netlify/functions/contact.js) once testing is finished.
- [ ] After merging: share the homepage and `/fr/` in a social preview tool to confirm the preview image shows, and check Search Console over the following days.
