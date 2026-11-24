# The stylesheet

The site serves one stylesheet, `/css/style.css`. It is written here as separate files, one per part of the site, so that each is short enough to read in one go.

## How it works

`scripts/build-styles.mjs` joins every `.css` file in this folder into `public/css/style.css`, in the order of the file names. Nothing in the files is changed: no bundling, no minifying. It runs by itself:

- when `npm run dev` or `npm run build` starts;
- in dev, each time a file in this folder is saved. The page then reloads.

`public/css/style.css` is a generated file. Do not edit it, and it is not in git. To see which file a rule came from, look for the `===== src/styles/... =====` line above it in the generated file or in the browser's developer tools.

## The files

The number at the start of each name sets the order. The groups:

| Files | What they hold |
| --- | --- |
| `01` to `04` | Tokens, fonts, base elements, small utility classes |
| `10` to `18` | Components used on more than one page: buttons, bullet lists, cookie banner, header, contact call to action, hero, timeline, image and text rows |
| `20` to `23` | Homepage |
| `30` | Project pages |
| `40`, `41` | About page: process phases and technologies |
| `50` to `56` | Services page |
| `60` | Landes page: hero, phone, mission and approach |
| `80` | Legal pages |
| `90` | Reduced motion. It must stay last |

To style a new component, add a file in the right group with the next free number, for example `24-home-something.css`. Order matters only when two rules of equal weight set the same property on the same element: the later file wins.

## Styles inside a component

A component can also hold its own styles, in a `<style is:global>` block at the end of its `.astro` file. Astro then adds those styles only to the pages that use the component, after the main stylesheet. So far these do: `Footer.astro`, `contact/ContactForm.astro`, `about/AboutLocation.astro` and `landes/LandesChallenges.astro`. The rest are being moved group by group.

- `is:global` keeps the rules unscoped, so they behave exactly as they would in this folder.
- Astro minifies these styles. `cssTarget` in `astro.config.mjs` stops it removing the `-webkit-backdrop-filter` lines that Safari before version 18 needs. Do not remove that setting.
- Only move a rule into a component if every class in it belongs to that component alone. A rule for a shared class (`.layout-two-column`, `.glass__back`, a button) must stay in this folder, or the other pages that use the class lose it.
- Astro's minifier rewrites some values, for example `background: none` becomes `background: 0 0`. That is the same thing written shorter.
- Tokens, base elements, utilities and anything shared by several components stay in this folder.
- The legal pages' styles (`80-legal.css`) stay here too: two pages share them and there is no component to hold them.

## Tokens

`01-tokens.css` holds the shared values: colours, fonts, type sizes, spacing, and the glass panel set (`--glass-bg-*`, `--glass-border`, `--glass-shadow`, `--glass-blur`). Use a token when one exists; add one there when the same value is needed in a second place.

## Screen widths

The older rules use many different widths. For anything new, pick from these three, so that layouts change together:

```css
@media (max-width: 600px)  { /* phones */ }
@media (max-width: 800px)  { /* tablets and below: the menu becomes a button */ }
@media (max-width: 1100px) { /* small laptops and below */ }
```

A "from this width up" rule starts one pixel later (`min-width: 801px`), so it never applies at the same time as its "up to" partner. A width cannot be stored as a token: browsers do not allow variables inside `@media`.

## Checking a change

`scripts/dev/README.md` describes the tools. For a change that should not alter how anything looks, the "Styles" section there compares every element on every page between two builds.
