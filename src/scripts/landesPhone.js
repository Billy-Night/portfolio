// Landes page phone: swap the screen image and the text beside it as the section scrolls.
// Used by src/components/landes/LandesPhone.astro.

const staticPhone = document.querySelector('.static-phone-img')
const phoneChannel = document.querySelector('.static-phone-channel')
const textCont = document.querySelectorAll('.phone-text-content-cont')

if (staticPhone) {
  const screens = [
    '/assets/landes_phone/phone_web_performance.webp',
    '/assets/landes_phone/phone_web_seo.webp',
    '/assets/landes_phone/phone_web_solutions.webp',
  ]

  const screensFr = [
    '/assets/landes_phone/phone_web_performance_fr.webp',
    '/assets/landes_phone/phone_web_seo_fr.webp',
    '/assets/landes_phone/phone_web_solutions_fr.webp',
  ]

  let currentIndex = 0

  function showContent(index) {
    textCont.forEach((block) => {
      block.classList.remove('is-active')
    })

    textCont[index].classList.add('is-active')
  }

  function updatePhoneScreen() {
    const rect = phoneChannel.getBoundingClientRect()

    const progress =
      (window.innerHeight - rect.top) / (window.innerHeight + rect.height)
    // console.log('Progress:', progress)

    let newIndex = 0

    showContent(newIndex)

    if (progress > 0.6) {
      newIndex = 2
      showContent(newIndex)
    } else if (progress > 0.4) {
      newIndex = 1
      showContent(newIndex)
    }

    if (newIndex !== currentIndex) {
      if (window.location.pathname.includes('/fr')) {
        staticPhone.src = screensFr[newIndex]
      } else {
        staticPhone.src = screens[newIndex]
      }

      currentIndex = newIndex
    }
  }

  if (staticPhone && phoneChannel) {
    window.addEventListener('scroll', updatePhoneScreen)
    updatePhoneScreen()
  }
}
