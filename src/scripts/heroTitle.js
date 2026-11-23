// Hero title: the height measure beside the title, and the two orbit animations.
// Used by src/components/home/HomeHero.astro and src/components/about/AboutHero.astro.

const titleText = document.querySelector('.hero__title-text')
const measure = document.querySelector('.type-measure')
const label = document.querySelector('.type-measure__label')

if (titleText) {
  function updateMeasure() {
    const height = Math.round(titleText.getBoundingClientRect().height)
    if (measure === null) return
    measure.style.setProperty('--measure-height', `${height}px`)
    label.textContent = `${height}px`
  }

  function initMeasure() {
    updateMeasure()

    window.addEventListener('resize', updateMeasure)
    window.addEventListener('load', updateMeasure)
  }

  document.fonts.ready.then(initMeasure)
}

animateOrbit({
  path: document.querySelector('#orbitPath1'),
  drawPath: document.querySelector('#orbit-path-draw-1'),
  dot: document.querySelector('#orbitDot1'),
  duration: 18000,
})

animateOrbit({
  path: document.querySelector('#orbitPath2'),
  drawPath: document.querySelector('#orbit-path-draw-2'),
  dot: document.querySelector('#orbitDot2'),
  duration: 24000,
  reverse: true,
})

function animateOrbit({
  path,
  drawPath,
  dot,
  duration = 18000,
  reverse = false,
}) {
  if (!path) return
  const length = path.getTotalLength()

  drawPath.style.strokeDasharray = `${length}px`
  drawPath.style.strokeDashoffset = `${length}px`

  // Reduced motion: show the whole orbit, with the dot at rest on it
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const point = path.getPointAtLength(length * (reverse ? 0.75 : 0.25))
    dot.setAttribute('cx', point.x)
    dot.setAttribute('cy', point.y)
    drawPath.style.strokeDashoffset = '0px'
    return
  }

  function loop(timeStamp) {
    // const rawProgress = (timeStamp % duration) / duration
    // const progress = reverse ? 1 - rawProgress : rawProgress
    const progress = (timeStamp % duration) / duration

    const distance = length * progress
    const point = path.getPointAtLength(distance)

    dot.setAttribute('cx', point.x)
    dot.setAttribute('cy', point.y)

    drawPath.style.strokeDashoffset = `${length - distance}px`

    requestAnimationFrame(loop)
  }

  requestAnimationFrame(loop)
}
