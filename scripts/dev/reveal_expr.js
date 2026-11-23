(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
  const hidden = () => [...document.querySelectorAll('.sections')].map((e) => (e.id || e.className.split(' ')[0]) + ':' + (e.classList.contains('sections--hidden') ? 'hidden' : 'shown')).join(' ')
  await sleep(1200); const atLoad = hidden()
  scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }); await sleep(1500)
  const img = document.querySelector('main img'); const fonts = [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, '')).sort().join(',')
  return `at load: ${atLoad} | after scrolling to the bottom: ${hidden()} | photo: ${img && img.naturalWidth > 0 ? 'loaded' : 'not loaded'} | fonts loaded: ${fonts}`
})()
