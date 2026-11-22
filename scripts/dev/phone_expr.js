(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
  const ch = document.querySelector('.static-phone-channel'), img = document.querySelector('.static-phone-img')
  const abs = ch.getBoundingClientRect().top + scrollY, h = ch.getBoundingClientRect().height
  const out = []
  for (const target of [0.2, 0.5, 0.8, 0.2]) {
    const top = innerHeight - target * (innerHeight + h)
    scrollTo({ top: abs - top, behavior: 'instant' }); await sleep(600)
    await new Promise((r) => { if (img.complete) r(); else { img.onload = img.onerror = r; setTimeout(r, 2500) } })
    const active = [...document.querySelectorAll('.phone-text-content-cont')].findIndex((e) => e.classList.contains('is-active'))
    const name = img.currentSrc.split('/').pop().replace(/\.[A-Za-z0-9_-]{8}_[A-Za-z0-9_-]+\.webp$/, '').replace('.webp', '')
    out.push(`${target}: ${name} ${img.naturalWidth > 0 ? 'loaded ' + img.naturalWidth + 'px' : 'BROKEN'}, shown ${Math.round(img.getBoundingClientRect().width)}x${Math.round(img.getBoundingClientRect().height)} (text ${active + 1})`)
  }
  return out.join(' | ')
})()
