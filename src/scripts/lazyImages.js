// Images with a data-src attribute: load the real image shortly before it scrolls into view.
// Loaded on every page by src/layouts/BaseLayout.astro.

const imgTargets = document.querySelectorAll('img[data-src]')

const loadImg = function (entries, observer) {
  const [entry] = entries
  // console.log(entry)

  if (!entry.isIntersecting) return

  //replace src with data-src
  entry.target.src = entry.target.dataset.src

  entry.target.addEventListener('load', function () {
    entry.target.classList.remove('lazy-img')
  })

  observer.unobserve(entry.target)
}

const imgObserver = new IntersectionObserver(loadImg, {
  root: null,
  threshold: 0,
  rootMargin: '200px',
})

imgTargets.forEach((img) => imgObserver.observe(img))
