// Package cards (services page): animate each bullet in the first time it scrolls into view.
// Used by src/components/services/PackageFeatures.astro.

const bulletPackage = document.querySelectorAll('.bullet-point-container')

if (bulletPackage.length > 0) {
  const observer = new IntersectionObserver(
    (entries, observerInstance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')

          // Stop observing after the first animation
          observerInstance.unobserve(entry.target)
        }
      })
    },
    {
      threshold: 0.3,
    },
  )

  bulletPackage.forEach((element) => observer.observe(element))
}
