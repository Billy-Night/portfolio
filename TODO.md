# To do

Improvements that are agreed in principle and not started. Each is its own branch.

## Images

`src/components/Photo.astro` serves the original file untouched and only generates smaller versions for small screens. Open questions, parked on purpose:

- A `quality` setting, or compressing the large versions too. This needs the uncompressed originals to be worth doing.
- Whether Astro's own `<Image>` or `<Picture>` could replace `Photo.astro` without losing the "originals untouched" rule.

Any change here must be checked with the image comparison in `scripts/dev/README.md` (position, size and sharpness at seven widths).
