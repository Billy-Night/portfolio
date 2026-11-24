// Landes page phone: swap the screen image and the text beside it as the section scrolls.
// Used by src/components/landes/LandesPhone.astro.

const staticPhone = document.querySelector('.landes-phone__image')
const phoneChannel = document.querySelector('.landes-phone')
const textCont = document.querySelectorAll('.landes-phone__text')

if (staticPhone) {
  // The image URLs for the three screens, provided by LandesPhone.astro in the page's language
  const screens = JSON.parse(staticPhone.dataset.screens || '[]')

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
      if (screens[newIndex]) staticPhone.src = screens[newIndex]

      currentIndex = newIndex
    }
  }

  if (staticPhone && phoneChannel) {
    window.addEventListener('scroll', updatePhoneScreen)
    updatePhoneScreen()
  }
}
