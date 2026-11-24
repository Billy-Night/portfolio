// Header: fade the other links on hover, the mobile menu button, and the smaller header after scrolling.
// Used by src/components/Header.astro.

const header = document.querySelector('.header')
const navHeight = header.getBoundingClientRect().height
const nav = document.querySelector('.nav__list-full')
const navHamBtn = document.querySelector('.menu-btn--hamburger')
const navHamImg = navHamBtn.querySelector('img')
const navLinksMini = document.querySelectorAll('.nav__link--mini')
const navList = document.querySelector('.nav__list')

const handlerHover = function (e) {
  if (e.target.classList.contains('nav__link')) {
    const link = e.target
    //console.log(link);
    const siblings = link
      .closest('.nav__list-full')
      .querySelectorAll('.nav__link')
    // const logo = link.closest('.nav').querySelector('img')
    // console.log(logo)

    siblings.forEach((el) => {
      if (el !== link) el.style.opacity = this
    })
    // logo.style.opacity = this
  }
}

if (nav) {
  nav.addEventListener('mouseover', handlerHover.bind(0.5))
  nav.addEventListener('mouseout', handlerHover.bind(1))
}

let menuOpen = false

// The button tells screen readers whether the menu is open, and its label says
// what pressing it will do. Both labels come from Header.astro.
const setMenuState = (open) => {
  menuOpen = open
  navHamBtn.setAttribute('aria-expanded', String(open))
  navHamBtn.setAttribute(
    'aria-label',
    open ? navHamBtn.dataset.labelClose : navHamBtn.dataset.labelOpen,
  )
}

const openMenu = () => {
  navLinksMini.forEach((e) => e.classList.add('nav__links-mob'))
  navHamImg.src = '/assets/icons/close.svg'
  navList.classList.add('nav__dropdown')
  setMenuState(true)
}

const closeMenu = () => {
  navLinksMini.forEach((e) => e.classList.remove('nav__links-mob'))
  navList.classList.remove('nav__dropdown')
  navHamImg.src = '/assets/icons/ham_menu.svg'
  setMenuState(false)
}

if (navHamBtn) {
  navHamBtn.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()))

  // Escape closes the menu and puts the keyboard focus back on the button
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) {
      closeMenu()
      navHamBtn.focus()
    }
  })
}

// Close the menu whenever the window crosses the mobile breakpoint, in either
// direction, so the desktop links never keep the mobile menu's classes.
window.matchMedia('(max-width: 800px)').addEventListener('change', closeMenu)

window.addEventListener('scroll', () => {
  if (window.scrollY > navHeight) {
    header.classList.add('small-nav')
    nav.classList.add('nav_radius')
  } else {
    header.classList.remove('small-nav')
    nav.classList.remove('nav_radius')
  }
})
