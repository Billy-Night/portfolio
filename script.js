'use strict'

//console.log("Script loaded");

//~ Selected DOM Elements

//* Tabbed Components
const tabs = document.querySelectorAll('.offers__tab')
const tabsContainer = document.querySelector('.offers__tab-container')
const tabsContent = document.querySelectorAll('.offers__content')
//* Select the button :
const btnScrollTo = document.querySelector('#btn-learn-more')
//* Select the section where the viewport will scroll to :
const section1 = document.querySelector('.section-project-container')

const nav = document.querySelector('.nav')

//~ Smooth scrolling from intro to project sections

//* Then add the event onClick
if (btnScrollTo) {
  btnScrollTo.addEventListener('click', function (e) {
    //* The more modern way, only supported in modern browsers
    section1.scrollIntoView({ behavior: 'smooth' })
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

//* First we select all the elements in the document with a class name of section
// const allSelections = document.querySelectorAll('.sections')

// //* Logic to reveal the sections, the function takes in the entries array and the observer object (define by use below)
// const revealSection = function (entries, observer) {
//   console.log(entries)
//   entries.forEach((entry) => {
//     if (entry.target.id === 'intro') {
//       entry.target.classList.remove('sections--hidden')
//       console.log('removed')
//     }
//     // This is a guard to stop the function if the entry is not intersecting
//     if (!entry.isIntersecting) {
//       return
//     }
//     // Now we alter the section and remove the class of section hidden, which will show the section
//     entry.target.classList.remove('sections--hidden')
//     // Then we unobserve each section to insure that the function stops running.
//     observer.unobserve(entry.target)
//   })
// }

// // We create a new intersectionObserver object which takes in a function which we created and an object which defines it's functionality
// // The revealSection is the callback function that executes when the observed element meets the threshold defined in the object.
// const sectionObserver = new IntersectionObserver(revealSection, {
//   root: null, // Observe intersection with the view port,
//   threshold: 0.15, // Trigger when 15% of the element is visible
// })

// allSelections.forEach(function (section) {
//   sectionObserver.observe(section)
//   section.classList.add('sections--hidden')
// })

//~ Header

// const navContainer = document.querySelector(".nav__container");

// const header = document.querySelector(".header");
// const navHeight = navContainer.getBoundingClientRect().height;
// console.log(navHeight);

// const stickyNav = function (entries) {
//   const [entry] = entries;
//   console.log(entry);

//   if (!entry.isIntersecting) navContainer.classList.add("sticky");
//   else navContainer.classList.remove("sticky");
// };

// //When 0 percent of the header is visible we want something to happen
// const headerObserver = new IntersectionObserver(stickyNav, {
//   root: null,
//   threshold: 0,
//   // rootMargin: `-${navHeight}px`,
// });
// headerObserver.observe(header);
