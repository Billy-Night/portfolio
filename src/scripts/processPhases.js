// About page process: expand and collapse the four phases.
// Used by src/components/about/AboutProcess.astro.

const processWrapper = document.querySelector('.process__phases')
const phases = document.querySelectorAll('.process__phase')

let openPhase = null

function updatePhases(activePhase) {
  // The button labels come from the component, in the page's language
  const { labelExpand, labelCollapse } = processWrapper.dataset

  phases.forEach((phase) => {
    const button = phase.querySelector('.process__toggle')
    const phaseContent = phase.querySelector('.process__phase-content')
    const isOpen = phase === activePhase

    phase.classList.toggle('process__phase--open', isOpen)
    phase.classList.toggle('process__phase--closed', !isOpen)
    // While one phase is open, the others are hidden
    phase.classList.toggle('process__phase--hidden', !!activePhase && !isOpen)

    if (phaseContent) {
      phaseContent.classList.toggle('process__phase-content--hidden', !isOpen)
      phaseContent.classList.toggle('process__phase-content--open', isOpen)
    }

    if (button) {
      button.classList.toggle('process__toggle--open', isOpen)
      // Tells screen readers whether this phase's details are showing
      button.setAttribute('aria-expanded', String(isOpen))
      button.textContent = isOpen ? labelCollapse : labelExpand
    }
  })
}

if (processWrapper) {
  processWrapper.addEventListener('click', (e) => {
    const button = e.target.closest('.process__toggle')
    if (!button) return

    const clickedPhase = button.closest('.process__phase')
    if (!clickedPhase) return

    openPhase = openPhase === clickedPhase ? null : clickedPhase
    updatePhases(openPhase)
  })
}
