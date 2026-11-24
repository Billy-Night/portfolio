// Run inside each page by style_measure.mjs. Stops animations, scrolls through the page, shows the
// sections and bullets that fade in, then returns one line per element: index|tag|x,y,width,height|style hash.
// The hash covers every computed style property, including ::before and ::after.
(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
  const st = document.createElement('style')
  st.textContent = '*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}'
  document.head.appendChild(st)
  await document.fonts.ready
  const max = document.documentElement.scrollHeight
  for (let y = 0; y < max; y += 700) { scrollTo(0, y); await sleep(30) }
  scrollTo(0, 0)
  await sleep(100)
  window.dispatchEvent(new Event('scroll'))
  await sleep(600)
  document.querySelectorAll('.sections--hidden').forEach((e) => e.classList.remove('sections--hidden'))
  document.querySelectorAll('.is-waiting').forEach((e) => e.classList.remove('is-waiting'))
  await sleep(100)
  const DETAIL = window.__detail || null // set of element indexes to dump in full
  const hash = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36) }
  const els = [...document.querySelectorAll('body, body *')].filter((e) => !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(e.tagName))
  const out = []
  els.forEach((e, i) => {
    let s = ''
    const full = DETAIL && DETAIL.includes(i) ? [] : null
    for (const pe of [null, '::before', '::after']) {
      const cs = getComputedStyle(e, pe)
      if (pe && cs.content === 'none') continue
      for (const p of cs) {
        if (p.startsWith('--')) continue
        let v = cs.getPropertyValue(p)
        if (v.includes('://')) v = v.split(location.origin).join('')
        s += (pe || '') + p + ':' + v + ';'
        if (full) full.push((pe || '') + p + ': ' + v)
      }
    }
    const r = e.getBoundingClientRect()
    out.push(`${i}|${e.tagName}|${Math.round(r.x)},${Math.round(r.y + scrollY)},${Math.round(r.width)},${Math.round(r.height)}|${hash(s)}`)
    if (full) out.push(...full.map((l) => `  #${i} ${l}`))
  })
  return out.join('\n')
})()
