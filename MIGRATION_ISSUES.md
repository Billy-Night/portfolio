# Astro migration: what was fixed and what is left

Every issue found while porting the site to Astro has been dealt with. This file records what changed, the improvements that are still optional, and the checklist for merging.

## How changes are checked
1. `npm run build && npm run seo:compare` lists every difference from the SEO baseline. It should show **only** the change you intended.
2. When you're happy with it, take a new baseline: `python3 scripts/seo_snapshot.py snapshot dist seo-baseline/local.json`.

Each fix below was made this way, one commit per fix.

---

## Optional improvements (nothing here is broken)

### A. Section components: done
Every page's sections are now components shared by the English and French pages, each with a translation table. A layout change is made once for both languages.

| Pages | Components | Page file before → after |
|---|---|---|
| Contact | 2, in [src/components/contact/](src/components/contact/) | about 300 → 56 and 38 lines |
| Landes | 8, in [src/components/landes/](src/components/landes/) | about 480 → 66 |
| About | 7, in [src/components/about/](src/components/about/) | about 1,100 → 55 |
| Homepages | 7, in [src/components/home/](src/components/home/) | about 1,500 → 70 |
| Services | 8, in [src/components/services/](src/components/services/) | about 900 → 93 |
| Legal | none, on purpose | unchanged |

- **Check used for every page:** the built HTML is identical to the build before, tag for tag, apart from the fixes listed further down.
- **Legal pages: left as they are, on purpose.** Each is about 230 lines, almost all of it the legal text, and the header, cookie banner and `<head>` are already shared. Splitting a contract into a table of 62 keyed strings would make it harder to read and update. Both documents have the same 12 sections in the same order. Their three intro lines differ slightly: the English page bolds the business name, and the French page links the email address and has no dash before it.
- **Translation keys** are generated from the first words of the English text (for example `readyToDiscussYour`). Each sits next to its text, so they're easy to rename.
- **Where the two languages still differ on purpose:**
  - `HomeHero`: the French title has two extra classes, to fit the longer text.
  - `ServicesMain`: one paragraph has a width limit in French only.
  - `ServicesPackages`: the title has a different class per language.
  - `PackageFeatures`: each language passes its own list of bullets. They now say the same things (see "Content decisions" below).

### B. Scripts per component: done
- `public/script.js` (970 lines, loaded on every page) is now 13 modules in [src/scripts/](src/scripts/), one per feature. Each component imports the one it needs in a `<script>` tag at the bottom of its file, so a page only loads the scripts for what's on it. One site-wide script (section reveal) is imported by [BaseLayout.astro](src/layouts/BaseLayout.astro). The old lazy-image script was removed with the image work (see C).
- The code was moved unchanged. Three dead features were dropped (the "offers" tabs, a "learn more" scroll button and a contact scroll icon, whose elements no longer exist), along with one unused variable and three `console.log` calls. One of those logged every visitor's contact-form data to the browser console.
- Astro inlines each single-use script into the page, minified. The two scripts shared by two components (`heroTitle.js`, `timeline.js`) become files in `/_astro/` with a hash in their name, cached for a year.
- **How it was checked:** a scripted browser test drove every page of the old and new builds (scrolling, the menu button, the cookie buttons, the FAQ, the process phases, the reviews, the Landes switcher, changing the form's reason field and submitting it against a fake server) and compared the resulting page state after each step. All 14 pages match at desktop and mobile width. A second, real-time check confirmed the orbit animation, the review progress ring and auto-advance, and the scroll-drawn timeline run the same on both builds.
- **Not covered by those tests:** real touch input, and browsers other than Chrome. Worth a manual pass on a phone and in Safari and Firefox.
- The original issue #15 ("crashes on pages without certain elements") was wrong: every optional element was already guarded with an `if`.

### C. Images through Astro: done. CSS: tried and reverted
- **Images: done, with one correction.** The 28 displayed photos are in [src/assets/images/](src/assets/images/) and render through [Photo.astro](src/components/Photo.astro).
  - **Your files are not recompressed.** For 22 photos, the main version is the original file, byte for byte. They were already WebP at roughly quality 95, so recompressing them only saves bytes by lowering quality.
  - **Six files were much larger than they are ever displayed** and are resized at quality 90: the two 6000px client screenshots (to 1440px), the three review photos (to 360px) and the homepage portrait (1400px to 750px).
  - **Small screens get smaller versions** (half and three quarters of the main width, quality 90). Downscaling hides the re-encoding.
  - **Result on desktop:** homepage photos 2,054 KB to 852 KB, all from the six oversized files. The other pages are unchanged. **On small screens:** homepage about 270 KB, about page about 290 KB, services about 47 KB.
  - **All photos have `width` and `height` attributes**, and everything below the first screen loads lazily.
  - **The first version (commit `a44b8eb`) had two faults,** found by Billy on a wide screen. It used Astro's `<Image>` with the default quality (about 80), a second lossy pass that visibly softened the photos. And it gave each image a `sizes` value measured at a 1280px window ("602px"). The browser treats that value as the image's own width, and the layout sizes the laptop-image columns from it, so at 1920px they sat 141px in from the screen edge and were 779px wide where they used to be 900px. `Photo.astro` gives the true width above 800px.
  - **Image URLs changed** to `/_astro/<name>.<hash>.webp`. The file names are kept, and every `alt` text is unchanged. Google Images will re-index them over the following weeks.
  - **Old URLs still work.** `legacyImageUrls` in [astro.config.mjs](astro.config.mjs) copies the originals to `dist/assets/` on every build. The structured data on the about pages points at one of them.
  - **Not moved:** the social preview image, `billy_portrait.webp` (structured data), favicons, logos, icons and CSS backgrounds. They stay in `public/`.
  - **One CSS rule was needed:** `height: auto` on `img` in [style.css](public/css/style.css). Without it, images with a CSS width kept the height from their new `height` attribute and looked stretched.
  - **The Landes phone animation** gets its image URLs from the component (a `data-screens` attribute), not from paths written in the script. The old `data-src` lazy-loading script is removed: browsers do it natively now.
  - **How it was checked:** the position and size of every image box was compared with the pre-pipeline build at seven window widths (390, 768, 1024, 1280, 1440, 1920 and 2560px), 385 boxes in all. None differs by more than 2px and none is displayed from a smaller file than before. The interaction and animation tests from B also pass.
  - **If the uncompressed originals exist** (the PNG or JPEG exports), putting those in `src/assets/images/` would let Astro compress each photo once, at a chosen quality, and the large versions could then be optimised too.
- **CSS:** bundling [style.css](public/css/style.css) through Astro was tried for #19 and reverted, because it changed how pages render:
  - The minifier keeps only the last of `backdrop-filter: blur(10px) saturate(120%)` and `-webkit-backdrop-filter: blur(10px)`, which is the `-webkit-` line. Chrome ignores that line, so the blur disappears. Putting the `-webkit-` line first in each of the 10 places would avoid this.
  - Astro put the stylesheet link at the end of `<head>`, after the old `script.js` tag, so the script ran before the styles applied and its reveal-on-scroll logic left sections hidden. The scripts now load from the page body (see B), so this would need retesting, not assuming.
- **Caching:** `style.css` and everything in `/_astro/` (scripts and now photos) are cached for a year, because their URLs change when their content does. Files still in `public/assets/` are cached for 10 minutes.

### D. Unused files: cleaned up
- **Deleted 26 files (2.6 MB)** that nothing referenced: 23 images and SVGs in `public/assets/` (old screenshots, `lazy*` placeholders, spare portraits and logos, two backgrounds) and three font files that only appeared in commented-out CSS. The three commented-out `@font-face` blocks were removed from [style.css](public/css/style.css) too. Everything is still in git history.
- **Kept on purpose:**
  - `portraits/billy_nightingale_portrait_standing_laptop_v4-400.webp` and `-800.webp`. No page uses them now, but the live site's homepage still offers them to small screens, so their addresses stay valid.
  - `favicon-n-v1-180.png` and `favicon-n-v1-512.png`. Nothing links to them. The 180 one is the standard iPhone home-screen icon size: adding `<link rel="apple-touch-icon" href="/favicon-n-v1-180.png">` to `BaseLayout` would put it to use.
- **Checked before deleting:** none of the 26 is referenced by the live production pages, stylesheet or script.
- **Checked after:** every file referenced by the built pages, the stylesheet, the scripts, the structured data and the manifest exists, and the browser reports no failed loads.

### E. Small things noticed along the way
- The legal pages have no footer. Every other page does.
- Safari older than version 18 only reads the `-webkit-backdrop-filter` line, so it gets the blur without the `saturate()` part. The difference is barely visible.


### G. Code clean-up suggestions
From a review of the code as it stood before the migration. Most of the list was done on 2026-11-23 (see "✅ Code clean-up" below). What is left:

**1. CSS** ([style.css](public/css/style.css), now 3,787 lines)
- **Naming.** Three conventions are mixed: BEM (`nav__link`, `package-card__title--large`), abbreviations (`wid__sec`, `ts-heading`, `lan-chall-cont`) and one-offs (`packages__title_fr`). Pick one for new code. BEM is already the most common.
- **Broad global rules.** `img { width: 100% }` applies to every image on the site, so each image that shouldn't fill its container needs an override. A class on the images that should stretch would be safer.
- **Four half-dead selectors.** `.package-card--compact`, `.button`, `.button-link` and `.button--primary` are not used anywhere, but each shares a rule with a class that is, so they were left.
- **One file.** With components in place, styles that belong to one component could move into a `<style>` block in that component, leaving the tokens and shared rules in the global file. Do it one component at a time, with the text-box, image-box and screenshot tests in [scripts/dev/](scripts/dev/).

**2. Translation keys**
The keys in the section components were generated from the first words of the English text (`readyToDiscussYour`, `iCraftPremiumWeb`). They work, and each sits next to its text. There are about 400. Renaming them by role (`heading`, `intro`, `ctaQuote`) is only worth it in the files you edit often: [HomeProjects.astro](src/components/home/HomeProjects.astro), [ServicesPackages.astro](src/components/services/ServicesPackages.astro) and [ContactForm.astro](src/components/contact/ContactForm.astro) hold the most. The built HTML must be byte-for-byte identical afterwards.

**Left as they are, deliberately:** the animation code (timeline, orbit, review slider) and the absence of any JavaScript dependency. Both are strengths.

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
- **Homepages:** seven shared section components (see A). Before that, two small alignments on the pages themselves: a project image on the French page gained the `height="600"` the English one has, and three project images on the English page now use absolute paths (`/assets/…`) like everywhere else.
- **Services pages:** eight shared components (see A). Before that, the pricing block got the same labelled `<section class="pricing-section">` on both pages, with the `id="pricing-title"` its `aria-labelledby` was pointing at. No visual change.
- **Wrong-language text:** the English about page said "Développement" in three places and the English services page in two (now "Development"), the French about and Landes pages had four "PROJECTS" buttons (now "PROJETS"), and a service card on the French homepage said "Automation" (now "Automatisation").
- **Content decisions (yours, applied):**
  - The French homepage has the two lines it was missing: "Découvrez-en plus sur moi et mes projets récents" in the hero, and "Encore merci !" as its own paragraph at the end of the Monkey Mood review (it was already there, inside the previous paragraph).
  - The "Best for" and "Delivery time" labels are `<h4>` on both services pages. They were `<h3>` in English, so they're now smaller there.
  - The French package offers match the English ones, which are the reference. The French bullets, the pricing note and the ongoing visibility price ("250 € – 1 000 €+ / mois TTC") are translations of the English. [public/fr/services.md](public/fr/services.md) is updated to match.
  - Left as they were, because they say the same thing in natural French or are French conventions: the package names ("Site vitrine Essentiel"), the keyword-rich headings ("Tarifs de création de site internet"), the "Idéal pour" lines, the package descriptions, and "TTC" on prices.
- **Scripts:** `script.js` split into one script per feature (see B).
- **Images:** the displayed photos go through `Photo.astro`: originals untouched, six oversized files resized, smaller versions for small screens (see C).
- **Test tools:** the regression tests built during this work are in [scripts/dev/](scripts/dev/), with a README.
- **Unused files:** 26 deleted from `public/` (see D).
- **Landes phone animation:** on the English page, the second screen showed the French image. It now shows `phone_web_seo.webp`. That file is no longer one of the unused assets in D.
- **Proofreading:** about 20 typos fixed in the English copy of the Landes, about, services and home components (for example "strategeis", "affective", "insure", "website’s", "Deployement", "PERFROMANCE"). On the French homepage, the GitHub link texts read "GitHub" and "dépôt GitHub" instead of "Github repository", and the sentence around them is now "Le dépôt du frontend est disponible sur GitHub et celui du backend sur GitHub."
- **Caching:** verified on the branch deploy. `style.css` and everything in `/_astro/` (the scripts and photos) are served with `max-age=31536000, immutable`, and everything else with the 10-minute value.

## ✅ Code quality fixes (one commit each)
- **#14 Google Fonts on the terms page:** removed. The Oxygen fonts were never used, and the page screenshot is pixel-identical without them.
- **#23 Font Awesome on the about pages:** removed. No `fa-*` class is used anywhere.
- **#17 Contact form error:** "There was an issue submitting the form, please try again."
- **#18 Copyright year:** set when the site is built.
- **#20 Commented-out markup:** seven blocks removed from the homepages and Landes pages (an old offer section, the Spline viewer, two project links and a tagline). They are in git history, in the commit "Remove commented-out markup from the homepages and Landes pages".
- **#16 Analytics consent:** `loadClarity()` and `loadGoogleAnalytics()` now check consent themselves, and the `console.log` calls are gone. Tested for nine combinations of domain and consent.
- **#19 Cache-busting:** `style.css` gets a version from a hash of its contents (as `script.js` did until it was split, see B) (`assetUrl()` in [src/utils/assetVersion.ts](src/utils/assetVersion.ts)). No more `?v=18` to bump by hand. The files themselves are served untouched.
- **#27 404 page:** rebuilt on the site layout with the header, footer and cookie banner, in English and French ([NotFound.astro](src/components/NotFound.astro)). Unknown `/fr/…` addresses get the French version through a rule in [public/_redirects](public/_redirects).
- **#21 README:** rewritten for the Astro setup.
- **#15 `script.js` crashes:** not a bug. See B above.

## ✅ Code clean-up (section G, 2026-11-23, one commit each)
- **Landes challenge buttons:** the `<h3>` inside each switcher button is now a `<span>`. Removes three `<h3>`s per Landes page from the outline.
- **Homepage FAQ:** each button now sits inside its `<h3>`, not the other way round. The outline is unchanged.
- **Homepage service labels and footer:** "Design", "Development", "SEO", "Automation" are paragraphs, not `<h2>`s. The footer's business name and "Contact Information" are paragraphs, not an `<h4>` and `<h5>`.
- **header.js:** the menu state is tracked directly, and the menu closes when the window crosses 800px in either direction (what it already did, by accident).
- **processPhases.js:** each class is set from the state. The button labels come from `data-` attributes on [AboutProcess.astro](src/components/about/AboutProcess.astro).
- **contactForm.js:** leftover `console.log` removed, variables renamed to full words.
- **Contact function:** a request without an `Origin` header is refused.
- **CSS:** `-webkit-backdrop-filter` comes before `backdrop-filter` with the same value; the misspelt `phone-iteractive…` class is fixed; 44 rules for classes that no longer exist are removed (252 lines).

- **Contact function rate limit:** [contact.js](netlify/functions/contact.js) is converted to Netlify's current function format, which is what allows a rate limit: more than 5 requests a minute from one visitor get status 429 before the function runs. A rate limit needs a path, so the form now posts to `/api/contact`, and `/.netlify/functions/contact` is no longer served. Netlify only checks the rule when it deploys: look for it in the deploy log under post-processing. The Free and Pro plans allow 2 and 5 such rules per site; this is the only one.
- **Heading levels:** every page now has one `<h1>` first and no skipped levels.
  - Footer tagline: `<h3>` → `<h2>` (every page). Contact form title: `<h3>` → `<h2>`.
  - About page: the four journey headings and the four technology group names: `<h4>` → `<h3>`.
  - Services hero: the five linked words above the `<h1>` are paragraphs, no longer `<h2>`s.
  - Homepage FAQ: the ten "Answer" labels are paragraphs, no longer `<h3>`s.
  - They look the same through the new `.h2-style`, `.h3-style` and `.h4-style` classes in [style.css](public/css/style.css), which give an element the look of a heading level it doesn't have.

All were checked with the tools in [scripts/dev/](scripts/dev/): every text element on the affected pages is in the same place at 390, 768, 1280 and 1920px, and the interaction recordings match.

---

## Before merging `AstroTrans` → `main`
- [x] **Make.com: the old webhook.** The French contact form's HTML contained `action="https://hook.eu1.make.com/1sbn8f4m…"`. Billy deleted that webhook in Make long ago, when he realised it was exposed, so the address is dead. It is removed from the page on this branch; the live site's French contact page still shows it until the merge. The Netlify function uses a different webhook.
- [x] Netlify builds the branch from [netlify.toml](netlify.toml) (Node 24, publish `dist`).
- [x] Contact form tested on the branch deploy, in both languages.
- [x] `/about.html` → 301 → `/about`, and an unknown URL returns the 404 page.
- [x] SEO compare of the branch deploy against `seo-baseline/live.json`: only the Cloudflare differences (email obfuscation and the managed `robots.txt`). This was run before the fixes above.
- [x] On the branch deploy: an unknown address such as `/nope` shows the new English 404, and `/fr/nope` shows the French one. Both return status 404.
- [ ] After pushing the 2026-11-23 clean-up commits: send the contact form once on the branch deploy, in each language (the function now refuses requests without an `Origin` header), and look at the FAQ, the Landes challenge buttons, the about page phases and the mobile menu.
- [ ] Visual check on desktop and mobile: fonts, images, animations, sliders, mobile menu, cookie banner, language switch, the contact page footer.
- [ ] Accept the cookie banner on the live site after merging and confirm in the browser's Network tab that Clarity and Google Analytics load, and that they don't load after "Deny".
- [ ] Optional: remove the branch-deploy address from `allowedOrigins` in [contact.js](netlify/functions/contact.js) once testing is finished.
- [ ] After merging: share the homepage and `/fr/` in a social preview tool to confirm the preview image shows, and check Search Console over the following days.
