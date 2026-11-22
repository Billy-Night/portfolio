// Landes page "Real challenges" switcher: hovering a button shows its text.
// Used by src/components/landes/LandesChallenges.astro.

const challengeBtns = document.querySelectorAll('.ver-switcher-btn')
const challengeContents = document.querySelectorAll('.ver-switcher-content-txt')

if (challengeBtns.length && challengeContents.length) {
  let currentIndex = 0
  function activeContent(index) {
    challengeContents.forEach((block) => {
      block.classList.remove('is-active')
    })
    currentIndex = Number(index)

    challengeContents[currentIndex].classList.add('is-active')
  }

  function activeBtn(btn) {
    challengeBtns.forEach((block) => {
      block.classList.remove('is-active')
    })

    btn.classList.add('is-active')
    activeContent(btn.dataset.index)
  }

  challengeBtns.forEach((btn) => {
    btn.addEventListener('mouseenter', () => {
      activeBtn(btn)
    })
  })
}
