// About page process: expand and collapse the four phases.
// Used by src/components/about/AboutProcess.astro.

const processWrapper = document.querySelector('.about__process-cont')
const phases = document.querySelectorAll('.phase-cont')

let openPhase = null

function updatePhases(activePhase) {
  // The button labels come from the component, in the page's language
  const { labelExpand, labelCollapse } = processWrapper.dataset

  phases.forEach((phase) => {
    const button = phase.querySelector('.btn-expand-process')
    const phaseContent = phase.querySelector('.phase__content')
    const isOpen = phase === activePhase

    phase.classList.toggle('phase--active', isOpen)
    phase.classList.toggle('phase__cont--align', !isOpen)
    // While one phase is open, the others are hidden
    phase.classList.toggle('phase--inactive', !!activePhase && !isOpen)

    if (phaseContent) {
      phaseContent.classList.toggle('phase__content--hidden', !isOpen)
      phaseContent.classList.toggle('phase__content--expanded', isOpen)
    }

    if (button) {
      button.classList.toggle('btn--open', isOpen)
      // Tells screen readers whether this phase's details are showing
      button.setAttribute('aria-expanded', String(isOpen))
      button.textContent = isOpen ? labelCollapse : labelExpand
    }
  })
}

if (processWrapper) {
  processWrapper.addEventListener('click', (e) => {
    const button = e.target.closest('.btn-expand-process')
    if (!button) return

    const clickedPhase = button.closest('.phase-cont')
    if (!clickedPhase) return

    openPhase = openPhase === clickedPhase ? null : clickedPhase
    updatePhases(openPhase)
  })
}
