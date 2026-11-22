// About page process: expand and collapse the four phases.
// Used by src/components/about/AboutProcess.astro.

const processWrapper = document.querySelector('.about__process-cont')
const phases = document.querySelectorAll('.phase-cont')

let openPhase = null

function updatePhases(activePhase) {
  phases.forEach((phase) => {
    const button = phase.querySelector('.btn-expand-process')
    const phaseContent = phase.querySelector('.phase__content')
    const isActive = phase === activePhase

    phase.classList.toggle('phase--active', !!activePhase && isActive)
    phase.classList.toggle('phase__cont--align')
    phase.classList.toggle('phase--inactive', !!activePhase && !isActive)

    if (phaseContent) {
      phaseContent.classList.toggle('phase__content--hidden')
      phaseContent.classList.toggle('phase__content--expanded')
    }

    if (button) {
      button.classList.toggle('btn--open', !!activePhase && isActive)
      if (window.location.pathname.includes('/fr/')) {
        button.textContent = !!activePhase && isActive ? 'Fermer' : 'Ouvrir'
      } else {
        button.textContent = !!activePhase && isActive ? 'Collapse' : 'Expand'
      }
    }
  })
}

if (processWrapper) {
  processWrapper?.addEventListener('click', (e) => {
    const button = e.target.closest('.btn-expand-process')
    if (!button) return

    const clickedPhase = button.closest('.phase-cont')
    if (!clickedPhase) return

    openPhase = openPhase === clickedPhase ? null : clickedPhase
    updatePhases(openPhase)
  })
}
