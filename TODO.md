# To do

Improvements that are agreed in principle and not started. Each is its own branch.

## Content Security Policy: enforce it

The policy in [public/_headers](public/_headers) is in report-only mode: the browser logs what the policy would block, and blocks nothing. Waiting on purpose, until a Google Ads campaign is running:

1. Arrive on the live site as if from an ad click, with cookies accepted, and open a few pages.
2. Check the browser's console for messages starting with `[Report Only]`. Each one names an address the policy would have blocked: add it to the policy if it is legitimate.
3. When there are none, rename the header from `Content-Security-Policy-Report-Only` to `Content-Security-Policy`.

Do not enforce it before that check: a missing address would silently break ad conversion tracking. With cookies accepted and no campaign running, the live site showed no reports on 2026-11-23, and none appeared while links were hovered on 2026-11-26.

## Images

`src/components/Photo.astro` serves the original file untouched and only generates smaller versions for small screens. Open questions, parked on purpose:

- A `quality` setting, or compressing the large versions too. This needs the uncompressed originals to be worth doing.
- Whether Astro's own `<Image>` or `<Picture>` could replace `Photo.astro` without losing the "originals untouched" rule.

Any change here must be checked with the image comparison in `scripts/dev/README.md` (position, size and sharpness at seven widths).
