# Styles

Styles live in two places.

## 1. In the component

A component's own styles are in a `<style is:global>` block at the end of its `.astro` file. Astro adds them only to the pages that use the component.

Parts used on several pages are components too, so their styles live with them: `Hero`, `Timeline`, `ImageTextRows`, `ContactCta`, `BulletList` and `home/ProjectCard`.

Three rules to keep:

- **Only the component's own classes.** Put a rule in a component only if it targets a class that component alone uses. A rule for a shared class (a button, `.glass__back`, `.layout-two-column`) belongs in this folder, or the other pages lose it.
- **Order inside a block.** Rules follow the order of the markup, with `@media` blocks at the end. If a state rule must override a `@media` rule (the open menu in `Header.astro`), it comes after it, with a comment.
- **An override goes after what it overrides.** Component styles load after this folder's files. So a "reduced motion" rule sits in the same component as the animation it switches off, after it.

`is:global` means the rules are not scoped to the component: class names must stay unique across the site.

## 2. In this folder

What every page needs, joined in the order of the file names into one stylesheet, `/css/style.css`:

| File | What it holds |
| --- | --- |
| `01-tokens.css` | Colours, fonts, type sizes, spacing, glass panel values |
| `02-fonts.css` | The font files |
| `03-base.css` | The page, headings, paragraphs, images, links |
| `04-utilities.css` | Small helper classes, section widths, glass panels |
| `05-buttons.css` | Buttons and button rows |
| `06-project-panel.css` | The panel, technology tags and gold labels shared by the homepage cards and the project pages |
| `07-review-photo.css` | The client photo and stars shared by the homepage reviews and the project pages |
| `08-legal.css` | The two legal pages, which have no component |
| `09-reduced-motion.css` | Reduced motion for the fade-in sections. Keep it last |

`scripts/build-styles.mjs` does the joining, at the start of `npm run dev` and `npm run build` and each time a file here is saved. Nothing is processed or minified. `public/css/style.css` is the generated result: do not edit it, and it is not in git.

## Tokens

Use a token from `01-tokens.css` when one exists, and add one there when a value is needed in a second place. The glass panels use `--glass-bg-*`, `--glass-border`, `--glass-shadow` and `--glass-blur`.

## Screen widths

The older rules use many different widths. For anything new, pick from these three:

```css
@media (max-width: 600px)  { /* phones */ }
@media (max-width: 800px)  { /* tablets and below: the menu becomes a button */ }
@media (max-width: 1100px) { /* small laptops and below */ }
```

A "from this width up" rule starts one pixel later (`min-width: 801px`), so it never applies together with its "up to" partner.

## Two things Astro does to component styles

- **It minifies them,** which rewrites some values: `background: none` becomes `background: 0 0`, and `to left` becomes `270deg`. These mean the same.
- **It would remove `-webkit-backdrop-filter`,** which Safari before version 18 needs for the glass blur. `cssTarget` in `astro.config.mjs` prevents that. Do not remove that setting.

## Checking a change

`scripts/dev/README.md` describes the tools. The "Styles" section there compares every element on every page between two builds.
