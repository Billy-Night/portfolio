// Position, size and type styles of every element that directly contains text.
// The tag name is left out on purpose, so a build that swaps one tag for
// another (an <h4> for a <p>) can be compared with the build before it.
;(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
  document
    .querySelectorAll('.sections--hidden')
    .forEach((e) => e.classList.remove('sections--hidden'))
  await document.fonts.ready
  const max = document.documentElement.scrollHeight
  for (let y = 0; y < max; y += 600) {
    scrollTo({ top: y, behavior: 'instant' })
    await sleep(100)
  }
  scrollTo({ top: 0, behavior: 'instant' })
  await sleep(900)
  const out = []
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('script, style, svg, noscript')) continue
    const text = [...el.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .join(' ')
      .trim()
    if (!text) continue
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    out.push(
      [
        text.slice(0, 40),
        Math.round(r.left),
        Math.round(r.top + scrollY),
        Math.round(r.width),
        Math.round(r.height),
        cs.fontSize,
        cs.fontFamily.slice(0, 20),
        cs.fontWeight,
        cs.lineHeight,
        cs.letterSpacing,
        cs.textTransform,
        cs.color,
        cs.opacity,
      ].join('|'),
    )
  }
  return 'h=' + document.documentElement.scrollHeight + '\n' + out.join('\n')
})()
