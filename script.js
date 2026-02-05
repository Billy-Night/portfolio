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
//! Need to check if getBoundingClientRect is a good solutions
const navHeight = header.getBoundingClientRect().height
const nav = document.querySelector('.nav')
//* All sections
const allSelections = document.querySelectorAll('.sections')
const clientFormReason = document.querySelector('#reason')
const clientFormProjectFields = document.querySelector('#form-project-fields')
const clientContactForm = document.querySelector('#contact-form')
const clientContactFormSeo = document.querySelector('#seo-objective-form')
const clientContactFormSeoBudget = document.querySelector('#SEO-budget-form')
const cFPrefTimWeb = document.querySelector('#pref-time-website')
const clientContFormWebBud = document.querySelector('#website-budget-form')
const cFPrefTimSeo = document.querySelector('#pref-time-seo')

//* Home Intro
const btnHomeIntro = document.querySelector('#btn-contact')

//* Contact page
const contactScrollIcon = document.querySelector('#contact-icon-scroll')
const statusElPass = document.querySelector('.form-status-pass')
const statusElError = document.querySelector('.form-status-error')

if (btnHomeIntro) {
  btnHomeIntro.addEventListener('click', () => {
    const isFrench = window.location.pathname.includes('fr')
    window.location.href = isFrench ? '/fr/contact' : '/contact'
  })
}

if (clientFormReason) {
  clientFormReason.addEventListener('change', function () {
    const useChoice = clientFormReason.value
    if (useChoice !== 'general-question') {
      clientFormProjectFields.classList.remove('hide-element')
    } else {
      clientFormProjectFields.classList.add('hide-element')
    }
    if (useChoice !== 'seo') {
      // Show website options
      clientContFormWebBud.classList.replace('hide-element', 'form-group')
      cFPrefTimWeb.classList.replace('hide-element', 'form-group')
      // Hide SEO options
      clientContactFormSeo.classList.replace('form-group', 'hide-element')
      clientContactFormSeoBudget.classList.replace('form-group', 'hide-element')
      cFPrefTimSeo.classList.replace('form-group', 'hide-element')
    } else {
      // Hide website options
      clientContFormWebBud.classList.replace('form-group', 'hide-element')
      cFPrefTimWeb.classList.replace('form-group', 'hide-element')
      // Show SEO options
      clientContactFormSeo.classList.replace('hide-element', 'form-group')
      clientContactFormSeoBudget.classList.replace('hide-element', 'form-group')
      cFPrefTimSeo.classList.replace('hide-element', 'form-group')
    }
  })
}

if (clientContactForm) {
  //* NEW code test to hide MAKE API in Netlify functions
  clientContactForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const form = e.target
    const formData = new FormData(form)

    // Honeypot (client-side)
    try {
      if (formData.get('web-check') !== '') throw new Error('Bot detected')
    } catch (err) {
      console.error(err)
      return
    }

    // const seoFeatures = formData.getAll('seo-features[]')
    // formData.set('seo-features-joined', seoFeatures.join(', '))
    // console.log(formData)

    const payload = {
      formName: formData.get('form-name'),
      honeypot: formData.get('web-check'),

      name: formData.get('name'),
      email: formData.get('email'),
      reason: formData.get('reason'),
      message: formData.get('message'),

      business: formData.get('business') || null,
      url: formData.get('url') || null,

      seoFeatures: formData.getAll('seo-features[]'),
      seoBudget: formData.get('seo-budget') || null,
      seoTimeline: formData.get('seo-timeline') || null,

      webBudget: formData.get('web-budget') || null,
      webTimeline: formData.get('web-timeline') || null,
    }

    console.log(payload)

    try {
      const response = await fetch('/.netlify/functions/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const err = await response
          .json()
          .catch(async () => await response.text())
        console.log('Function error:', response.status, err)
        throw new Error(
          typeof err === 'string' ? err : err.error || 'Unknown error',
        )
      }

      statusElError.classList.add('hide-element')
      statusElPass.classList.remove('hide-element')
      form.reset()
    } catch (err) {
      console.error(err)
      statusElPass.classList.add('hide-element')
      statusElError.classList.remove('hide-element')
    }
  })
}

if (contactScrollIcon) {
  contactScrollIcon.addEventListener('click', () => {
    clientContactForm.scrollIntoView({ behavior: 'smooth' })
  })
}

//~ Automatically detect language and redirect

// document.addEventListener('DOMContentLoaded', function () {
//   try {
//     const userLang = navigator.language || navigator.userLanguage
//     if (userLang.startsWith('fr')) {
//       console.log('French language detected')
//     }
//     // if (userLang.startsWith('fr') && !sessionStorage.getItem('redirected')) {
//     //   sessionStorage.setItem('redirected', 'true')
//     //   window.location.href = '/fr/index.html'
//     // }
//   } catch (error) {
//     console.error('Language detection failed:', error)
//   }
// })

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
    nav.classList.add('nav_radius')
  } else {
    header.classList.remove('small-nav')
    nav.classList.remove('nav_radius')
  }
})

//~ Lazy images

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
