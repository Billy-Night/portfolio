// Fade each .sections element in the first time it scrolls into view.
// Loaded on every page by src/layouts/BaseLayout.astro.

const allSelections = document.querySelectorAll('.sections')

const revealSection = function (entries, observer) {
  // console.log(entries)
  entries.forEach((entry) => {
    // This is a guard to stop the function if the entry is not intersecting
    if (!entry.isIntersecting) {
      return
    }
    // Now we alter the section and remove the class of section hidden, which will show the section
    entry.target.classList.remove('sections--hidden')
    // Then we unobserve each section to insure that the function stops running.
    observer.unobserve(entry.target)
  })
}

// We create a new intersectionObserver object which takes in a function which we created and an object which defines it's functionality
// The revealSection is the callback function that executes when the observed element meets the threshold defined in the object.
const sectionObserver = new IntersectionObserver(revealSection, {
  root: null, // Observe intersection with the view port,
  threshold: 0, // Trigger when 15% of the element is visible
  rootMargin: '-150px 0px 0px 0px',
})

allSelections.forEach(function (section) {
  //console.log(section.id)

  if (!(section.id === 'intro' || section.id === 'about-bio')) {
    section.classList.add('sections--hidden')
    //console.log(`added class to section ${section.id}`)
  }
  //console.log(section)
  sectionObserver.observe(section)
})
