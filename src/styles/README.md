# Styles

Styles live in two places.

## 1. In the component

A component's own styles are in a `<style>` block at the end of its `.astro` file. Astro adds them only to the pages that use the component, written straight into the page's `<head>` (`inlineStylesheets` in `astro.config.mjs`), so a page still loads one stylesheet file.

These styles are **scoped**: a rule only reaches elements written in that same file. Astro does this by adding a class such as `astro-7oq6r4yx` to each of the component's elements and to each of its selectors. So a class name only has to be unique inside its component.

Parts used on several pages are components too, so their styles live with them: `Hero`, `Timeline`, `ImageTextRows`, `ContactCta`, `BulletList` and `home/ProjectCard`.

### When a rule must reach outside: `:global(...)`

A scoped rule cannot see three kinds of element, because they are not written in the component's own file:

- content passed in through a `<slot>` (the text and photo given to `Hero`, the boxes given to `Timeline`);
- anything a child component renders (the `<img>` from `Photo`, the list from `BulletList`);
- a plain tag such as `p`, `ul` or `img`, which could be either of the above.

Wrap that part of the selector in `:global(...)` and it works as an unscoped selector:

```css
.project-page__facts :global(ul) { margin: 0; }     /* the list comes from BulletList */
:global(.hero__name) { color: var(--light-gold); }   /* the name is written in HomeHero */
```

If a new rule seems to do nothing, this is the first thing to check.

### Rules to keep

- **Shared classes stay in this folder.** A rule for a button, `.glass__back` or `.layout-two-column` belongs here, or the other pages lose it.
- **Order inside a block.** Rules follow the order of the markup, with `@media` blocks at the end. If a state rule must override a `@media` rule (the open menu in `Header.astro`), it comes after it, with a comment.
- **An override goes after what it overrides.** Component styles load after this folder's files. So a "reduced motion" rule sits in the same component as the animation it switches off, after it.
- **Scoping adds no weight.** `scopedStyleStrategy: 'where'` in `astro.config.mjs` means a scoped rule ranks exactly as it would unscoped. Do not change that setting: with Astro's default, every scoped rule would outrank the shared styles.
- **A component cannot take `class` as a prop with a default.** Astro passes the parent's scope class to every child component as `class`. A prop with a default value would be overwritten by it, which is why `BulletList` calls its prop `listClass`.

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
