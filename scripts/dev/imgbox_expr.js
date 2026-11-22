(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
  document.querySelectorAll('.sections--hidden').forEach((e) => e.classList.remove('sections--hidden'))
  const max = document.documentElement.scrollHeight
  for (let y = 0; y < max; y += 600) { scrollTo({ top: y, behavior: 'instant' }); await sleep(150) }
  scrollTo({ top: 0, behavior: 'instant' }); await sleep(900)
  await Promise.all([...document.images].map((i) => i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 3000) })))
  await sleep(300)
  const seen = {}; const out = []
  for (const img of document.querySelectorAll('img')) {
    const r = img.getBoundingClientRect(); const cs = getComputedStyle(img)
    const key = (img.getAttribute('alt') || '').slice(0, 60) + '#' + img.className; seen[key] = (seen[key] || 0) + 1
    out.push([key + '#' + seen[key], Math.round(r.width), Math.round(r.height), Math.round(r.left), Math.round(r.top + scrollY), img.naturalWidth, img.naturalHeight, img.complete && img.naturalWidth > 0 ? 'ok' : 'BROKEN', cs.objectFit, (img.currentSrc || '').split('/').pop().slice(0, 70), img.getAttribute('loading') || '-'].join('|'))
  }
  return 'h=' + document.documentElement.scrollHeight + '\n' + out.join('\n')
})()
