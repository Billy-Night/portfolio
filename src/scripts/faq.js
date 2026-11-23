// Homepage FAQ (vertical switcher): show an answer on hover or click.
// Used by src/components/home/HomeFaq.astro.

const verticalSwitcher = document.querySelector('.vertical-switcher')
const verticalSwitcherContent = document.querySelectorAll(
  '.vertical-switcher-content',
)

if (verticalSwitcher && verticalSwitcherContent.length > 0) {
  function activateVerticalSwitcherContent(content) {
    if (!content) return
    const button = content.querySelector('.vertical-switcher-btn')
    const text = content.querySelector('.vertical-switcher-txt')

    if (!button || !text) return

    verticalSwitcher
      .querySelectorAll('.vertical-switcher-btn')
      .forEach((btn) => {
        btn.classList.remove('is-active')
        btn.setAttribute('aria-expanded', 'false')
      })

    verticalSwitcher
      .querySelectorAll('.vertical-switcher-txt')
      .forEach((txt) => {
        txt.classList.remove('is-active')
      })

    button.classList.add('is-active')
    // Tells screen readers which question's answer is showing
    button.setAttribute('aria-expanded', 'true')
    text.classList.add('is-active')
  }

  verticalSwitcher.addEventListener('click', (event) => {
    const button = event.target.closest('.vertical-switcher-btn')
    if (!button) return

    const content = button.closest('.vertical-switcher-content')
    activateVerticalSwitcherContent(content)
  })

  verticalSwitcherContent.forEach((content) => {
    content.addEventListener('mouseenter', () => {
      activateVerticalSwitcherContent(content)
    })
  })
}
