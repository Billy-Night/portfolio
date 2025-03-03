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

// Menu fade animation
// const handlerHover = function (e) {
//   //console.log(this);
//   if (e.target.classList.contains('nav__link')) {
//     const link = e.target
//     //console.log(link);
//     const siblings = link.closest('.nav').querySelectorAll('.nav__link')
//     const logo = link.closest('.nav').querySelector('img')

//     siblings.forEach((el) => {
//       if (el !== link) el.style.opacity = this
//     })
//     logo.style.opacity = this
//   }
// }

// nav.addEventListener('mouseover', handlerHover.bind(0.5))

// nav.addEventListener('mouseout', handlerHover.bind(1))

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
