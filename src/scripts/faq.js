// Homepage FAQ (vertical switcher): show an answer on hover or click.
// Used by src/components/home/HomeFaq.astro.

const verticalSwitcher = document.querySelector('.faq')
const verticalSwitcherContent = document.querySelectorAll(
  '.faq__item',
)

if (verticalSwitcher && verticalSwitcherContent.length > 0) {
  function activateVerticalSwitcherContent(content) {
    if (!content) return
    const button = content.querySelector('.faq__button')
    const text = content.querySelector('.faq__answer')

    if (!button || !text) return

    verticalSwitcher
      .querySelectorAll('.faq__button')
      .forEach((btn) => {
        btn.classList.remove('is-active')
        btn.setAttribute('aria-expanded', 'false')
      })

    verticalSwitcher
      .querySelectorAll('.faq__answer')
      .forEach((txt) => {
        txt.classList.remove('is-active')
      })

    button.classList.add('is-active')
    // Tells screen readers which question's answer is showing
    button.setAttribute('aria-expanded', 'true')
    text.classList.add('is-active')
  }

  verticalSwitcher.addEventListener('click', (event) => {
    const button = event.target.closest('.faq__button')
    if (!button) return

    const content = button.closest('.faq__item')
    activateVerticalSwitcherContent(content)
  })

  verticalSwitcherContent.forEach((content) => {
    content.addEventListener('mouseenter', () => {
      activateVerticalSwitcherContent(content)
    })
  })
}
