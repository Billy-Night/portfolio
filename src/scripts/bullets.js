// Bullet lists: fade each bullet in the first time it scrolls into view.
// Used by src/components/BulletList.astro.
//
// The bullets are visible by default, and it is this script that hides the
// ones further down the page until they are reached. So if scripts are turned
// off or fail to load, every list simply shows as a normal list.

const bullets = document.querySelectorAll('.bullet-point-container')

if (bullets.length > 0) {
  const observer = new IntersectionObserver(
    (entries, observerInstance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('is-waiting')

          // Stop observing after the first animation
          observerInstance.unobserve(entry.target)
        }
      })
    },
    {
      threshold: 0.3,
    },
  )

  bullets.forEach((element) => {
    // Bullets already on screen stay as they are: hiding them now would make them blink
    if (element.getBoundingClientRect().top < window.innerHeight) return
    element.classList.add('is-waiting')
    observer.observe(element)
  })
}
