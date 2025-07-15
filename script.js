'use strict'

//console.log("Script loaded");

//~ Selected DOM Elements

//* Tabbed Components
const tabs = document.querySelectorAll('.offers__tab')
const tabsContainer = document.querySelector('.offers__tab-container')
const tabsContent = document.querySelectorAll('.offers__content')
//* Learn more button :
const btnScrollTo = document.querySelector('#btn-learn-more')
//* Select the section where the viewport will scroll to :
const sectionProject = document.querySelector('.section-project-container')
//* Navbar
const header = document.querySelector('.header')
const navHeight = header.getBoundingClientRect().height
const nav = document.querySelector('.nav')
//* All sections
const allSelections = document.querySelectorAll('.sections')

//~ Automatically detect language and redirect

document.addEventListener('DOMContentLoaded', function () {
  try {
    const userLang = navigator.language || navigator.userLanguage
    if (userLang.startsWith('fr') && !sessionStorage.getItem('redirected')) {
      sessionStorage.setItem('redirected', 'true')
      window.location.href = '/fr/index.html'
    }
  } catch (error) {
    console.error('Language detection failed:', error)
  }
})

//~ Smooth scrolling from intro to project sections

//* Then add the event onClick
if (btnScrollTo) {
  btnScrollTo.addEventListener('click', function (e) {
    //* The more modern way, only supported in modern browsers
    sectionProject.scrollIntoView({ behavior: 'smooth' })
  })
}

//~ service section tabs

//* Event delegations
if (tabsContainer) {
  tabsContainer.addEventListener('click', function (e) {
    const clicked = e.target.closest('.offers__tab')
    //console.log(clicked);
    //* Guard clause, if return gets executed no code will run after
    if (!clicked) return

    //* Remove active classes
    tabs.forEach((t) => t.classList.remove('offers__tab--active'))
    tabsContent.forEach((c) => c.classList.remove('offers__content--active'))
    clicked.classList.add('offers__tab--active')

    //* Activate content area
    //console.log(clicked.dataset.tab)
    document
      .querySelector(`.offers__content--${clicked.dataset.tab}`)
      .classList.add('offers__content--active')
  })
}

//~ Navbar fade animation

const handlerHover = function (e) {
  //console.log(this);
  if (e.target.classList.contains('nav__link')) {
    const link = e.target
    //console.log(link);
    const siblings = link.closest('.nav').querySelectorAll('.nav__link')
    // const logo = link.closest('.nav').querySelector('img')
    // console.log(logo)

    siblings.forEach((el) => {
      if (el !== link) el.style.opacity = this
    })
    // logo.style.opacity = this
  }
}
nav.addEventListener('mouseover', handlerHover.bind(0.5))
nav.addEventListener('mouseout', handlerHover.bind(1))

//~ Reveal sections

// The benefit of using this logic over scroll events is that it is more efficient.

//* Logic to reveal the sections, the function takes in the entries array and the observer object (define by use below)
const revealSection = function (entries, observer) {
  //console.log(entries)
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
  threshold: 0.1, // Trigger when 15% of the element is visible
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

//~ Header transform when scroll
const hamburgerMenu = document.querySelector('.hamburger-menu')
const navLinks = document.querySelectorAll('.nav__link')
//console.log(navLinks)
//console.log(header)

window.addEventListener('scroll', () => {
  //ToDo add hamburger menu
  // if (window.scrollY > navHeight) {
  //   hamburgerMenu.classList.remove('hide-element')
  //   header.classList.add('small-nav')
  //   navLinks.forEach((e) => {
  //     e.classList.add('hide-element')
  //   })
  // }
  if (window.scrollY > navHeight) {
    header.classList.add('small-nav')
  } else {
    header.classList.remove('small-nav')
  }
})

//~ Lazy images

const imgTargets = document.querySelectorAll('img[data-src]')

const loadImg = function (entries, observer) {
  const [entry] = entries
  //console.log(entry)

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
