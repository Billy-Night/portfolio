// Landes page "Real challenges" switcher: hovering, clicking or focusing a
// button shows its text.
// Used by src/components/landes/LandesChallenges.astro.

const challengeBtns = document.querySelectorAll('.challenges__button')
const challengeContents = document.querySelectorAll('.challenges__answer')

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
      block.setAttribute('aria-expanded', 'false')
    })

    btn.classList.add('is-active')
    // Tells screen readers which text is showing
    btn.setAttribute('aria-expanded', 'true')
    activeContent(btn.dataset.index)
  }

  // Hovering is not possible with a keyboard, so a click (Enter or Space) and
  // moving the focus onto a button show its text too.
  challengeBtns.forEach((btn) => {
    ;['mouseenter', 'click', 'focus'].forEach((type) => {
      btn.addEventListener(type, () => {
        activeBtn(btn)
      })
    })
  })
}
