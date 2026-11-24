# Regression test tools

These tools compare two builds of the site in headless Chrome, to check that a change did not alter how the pages look or behave. They were written during the Astro migration. None of them runs automatically.

They need Google Chrome at `/Applications/Google Chrome.app`, Node 24 and Python 3. Run them from the project root.

## The usual procedure

1. Before changing anything, build and keep a copy of the result:
   ```bash
   npm run build && rm -rf /tmp/dist-before && cp -R dist /tmp/dist-before
   ```
2. Make the change, then `npm run build`.
3. Run the checks below that fit the change, comparing `/tmp/dist-before` with `dist`.
4. Run `npm run seo:compare`. It must show only what you intended. To accept the change, take a new baseline:
   `python3 scripts/seo_snapshot.py snapshot dist seo-baseline/local.json`

## Behaviour: clicks, hovers, scrolling, the form

`interact.sh` drives every page (scrolls, opens the menu, clicks the cookie buttons, the FAQ, the process phases, pauses the reviews, changes the form's reason field, submits the form against a fake server) and records the page state after each step.

```bash
for r in 1 2 3 4; do
  scripts/dev/interact.sh /tmp/dist-before /tmp/int-ref/$r
  scripts/dev/interact.sh dist /tmp/int-new/$r
done
python3 scripts/dev/intcmp.py /tmp/int-ref /tmp/int-new      # must end with ALL MATCH
```

Add `500 900` to each `interact.sh` call for mobile width. Several runs are needed because two scroll-triggered effects (the section fade-in and the timeline headings) land on slightly different steps from run to run. `intcmp.py` ignores which step they land on.

## Animations, in real time

Headless Chrome's virtual clock does not advance frame-driven animations, so these run in real time through Chrome's debugging interface.

```bash
node scripts/dev/rtprobe.mjs /tmp/dist-before        # orbit, review ring, timeline, header: run on both builds, compare
node scripts/dev/rtprobe.mjs dist
node scripts/dev/rtprobe.mjs dist https://astrotrans--billy-nightingale-web-dev.netlify.app   # against a deployed site
```

`cdp_eval.mjs` evaluates any expression file on built pages. The window size comes from `SIZE`:

```bash
node scripts/dev/cdp_eval.mjs dist scripts/dev/phone_expr.js website-development-landes.html fr/creation-site-web-landes.html
node scripts/dev/cdp_eval.mjs dist scripts/dev/reveal_expr.js contact.html
```

Set `REDUCE=1` to run Chrome with the "reduce motion" setting on, to check what those visitors get.

Set `BASE` to run the same expression against a deployed site. Pages are then given as paths:

```bash
BASE=https://astrotrans--billy-nightingale-web-dev.netlify.app SIZE=1920,1080 node scripts/dev/cdp_eval.mjs dist scripts/dev/imgbox_expr.js about website-development-landes
```

- `phone_expr.js`: which image the Landes phone shows at each scroll position.
- `reveal_expr.js`: whether sections reveal, the photo loads and the fonts load.
- `textbox_expr.js`: position, size and type styles of every element that contains text, without the tag name. Run it on both builds and `diff` the output to check that swapping one tag for another (an `<h4>` for a `<p>`) or editing the CSS did not move or restyle anything.

## Styles: has anything changed how a page looks?

The strictest check, written for the stylesheet clean-up. `style_measure.mjs` records the position, size and every computed style property of every element, on every page, at each window width you give it. It sets the width itself, so real phone widths such as 390 work.

```bash
W=390,600,700,767,800,801,1024,1280,1920
node scripts/dev/style_measure.mjs /tmp/dist-before /tmp/style/before  $W
node scripts/dev/style_measure.mjs /tmp/dist-before /tmp/style/before2 $W    # the same build again
node scripts/dev/style_measure.mjs dist             /tmp/style/after   $W
python3 scripts/dev/style_compare.py /tmp/style/before /tmp/style/after /tmp/style/before2
```

A full run is 180 page views and takes about a minute and a half. The second measurement of the "before" build is there because a few animated elements (the hero orbit, the Landes phone, the About timeline) differ from one run to the next: `style_compare.py` ignores any element that differs between two runs of the same build. If a page is still listed with a handful of 1px differences, measure it once more to see whether they repeat.

To see which property changed on an element, measure one page with `DETAIL=<element number>` on both builds and `diff` the two files:

```bash
DETAIL=116 node scripts/dev/style_measure.mjs dist /tmp/style/detail 1280 services.html
```

Its limits: it measures the page as it first appears, so it does not see hover or focus styles, or classes that scripts add later, such as the open menu. When rules have been moved around in the stylesheet, check those with `rule_order.py`, which reports every pair of rules that can apply to the same element with equal weight and whose order changed:

```bash
python3 scripts/dev/rule_order.py /tmp/style-before.css public/css/style.css /tmp/order.js
node scripts/dev/cdp_eval.mjs dist /tmp/order.js index.html about.html services.html     # order-conflicts=0 is the goal
```

It treats a class that appears in no built page as one a script adds, and assumes it could land on any element, so read what it reports: a pair is only a problem if both rules can really apply to the same element.

## Images: position, size and sharpness

Test at several window widths. Layouts that size a column from an image's width can differ at 1920px while matching at 1280px.

```bash
mkdir -p /tmp/matrix
for sz in 390,844 768,1024 1024,768 1280,900 1440,900 1920,1080 2560,1440; do
  SIZE=$sz node scripts/dev/cdp_eval.mjs /tmp/dist-before scripts/dev/imgbox_expr.js index.html about.html services.html contact.html website-development-landes.html fr/index.html > /tmp/matrix/old_${sz%,*}.txt
  SIZE=$sz node scripts/dev/cdp_eval.mjs dist            scripts/dev/imgbox_expr.js index.html about.html services.html contact.html website-development-landes.html fr/index.html > /tmp/matrix/new_${sz%,*}.txt
done
python3 scripts/dev/matrixcmp.py /tmp/matrix 2      # boxes may differ by up to 2px
```

Each pass takes about a minute per window width. `matrixcmp.py` also lists images displayed larger than the file the browser chose ("less sharp than before").

## Screenshots

```bash
scripts/dev/screenshots.sh /tmp/shots-before 1280 2600 /tmp/dist-before
scripts/dev/screenshots.sh /tmp/shots-after  1280 2600 dist
python3 scripts/dev/pngdiff.py /tmp/shots-before/contact.png /tmp/shots-after/contact.png
node scripts/dev/cdp_shot.mjs dist about.html '.wid__sec' /tmp/about.png      # one section, scrolled to in real time
```

`screenshots.sh` also prints any console errors. Its screenshots are only repeatable on pages without animations (the legal pages, the 404 pages, the Landes pages). On the others, compare several captures or use `cdp_shot.mjs`. Lazy-loaded images only appear in `cdp_shot.mjs` captures, because it scrolls the real page.

## Other

- `htmldiff.py old.html new.html`: tag, attribute and text differences between two built pages, ignoring whitespace.
- `analytics_test.mjs`: checks the analytics loader in `dist/index.html` against nine combinations of domain and cookie consent.
