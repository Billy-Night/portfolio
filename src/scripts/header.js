// Header: fade the other links on hover, the mobile menu button, and the smaller header after scrolling.
// Used by src/components/Header.astro.

const header = document.querySelector('.header')
const navHeight = header.getBoundingClientRect().height
const nav = document.querySelector('.nav__list-full')
const navHamBtn = document.querySelector('.menu-btn--hamburger')
const navHamImg = navHamBtn.querySelector('img')
const navLinksMini = document.querySelectorAll('.mini')
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

let hamToggle = true

const handleNavHamBtn = () => {
  if (hamToggle) {
    navLinksMini.forEach((e) => e.classList.add('nav__links-mob'))
    navHamImg.src = '/assets/icons/close.svg'
    navList.classList.add('nav__dropdown')
    hamToggle = false
  } else {
    navLinksMini.forEach((e) => e.classList.remove('nav__links-mob'))
    navList.classList.remove('nav__dropdown')
    navHamImg.src = '/assets/icons/ham_menu.svg'
    hamToggle = true
  }
}

if (navHamBtn) {
  navHamBtn.addEventListener('click', handleNavHamBtn)
}

const isMobile = window.matchMedia('(max-width: 800px)')

const handleViewportChange = () => {
  if (isMobile) {
    hamToggle = false
    handleNavHamBtn()
    hamToggle = true
  }
}

isMobile.addEventListener('change', handleViewportChange)

window.addEventListener('scroll', () => {
  if (window.scrollY > navHeight) {
    header.classList.add('small-nav')
    nav.classList.add('nav_radius')
  } else {
    header.classList.remove('small-nav')
    nav.classList.remove('nav_radius')
  }
})
