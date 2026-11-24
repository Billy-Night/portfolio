# To do

Improvements that are agreed in principle and not started. Each is its own branch.

## Images

`src/components/Photo.astro` serves the original file untouched and only generates smaller versions for small screens. Open questions, parked on purpose:

- A `quality` setting, or compressing the large versions too. This needs the uncompressed originals to be worth doing.
- Whether Astro's own `<Image>` or `<Picture>` could replace `Photo.astro` without losing the "originals untouched" rule.

Any change here must be checked with the image comparison in `scripts/dev/README.md` (position, size and sharpness at seven widths).

## Generated sitemap

`public/sitemap.xml` is written by hand, so every new page needs a manual entry: the three project pages needed six. Astro's sitemap integration can generate it from the pages.

- The generated file will not match today's file line for line. Compare it with the SEO baseline, and check that the addresses have no trailing slash and that the two legal pages (which are `noindex`) stay out.
- `robots.txt` points at `/sitemap.xml`. The integration writes `sitemap-index.xml` by default, so either rename it or update `robots.txt` and resubmit in Search Console.

## Prefetching links

Astro can start loading a page when the visitor hovers over its link, so navigation feels instant. One setting in `astro.config.mjs`.

- Check that analytics still count one page view per visit, and that the cookie banner behaves, since both only exist fully on the live domain.
- Check the Content Security Policy report for anything new.
