// Scroll-drawn timeline: draw the line as the section scrolls and reveal each step as the dot passes it.
// Used by src/components/home/HomeProcess.astro and src/components/about/AboutJourney.astro.

const circle = document.querySelector('.tl_dot')

const timelineSection = document.querySelector('.tl__container')
const path = document.querySelector('.tl_line')
const timeSteps = document.querySelectorAll('.time-step')

let pathLength = 0

if (path) {
  pathLength = path.getTotalLength()
  path.style.strokeDasharray = pathLength
  path.style.strokeDashoffset = pathLength
}

let stepData = []

if (timeSteps) {
  stepData = [...document.querySelectorAll('.time-step')].map((step) => ({
    step,
    heading: step.querySelector('.ts-heading'),
    triggerY: 0,
    isActive: false,
  }))
}

const calculateTimelineSecRect = () => {
  if (timelineSection) {
    return timelineSection.getBoundingClientRect()
  } else {
    return
  }
}

const calculateStepPositions = () => {
  const timelineRect = calculateTimelineSecRect()
  if (stepData.length > 0) {
    stepData.forEach((item) => {
      const stepRect = item.step.getBoundingClientRect()
      item.triggerY = stepRect.top - timelineRect.top + stepRect.height / 2
    })
  } else {
    return
  }
}

function updateTimelinePath() {
  // calculate the timeline containers location:
  const rect = calculateTimelineSecRect()
  if (!rect) return

  //* now draw the line
  // get the height of the window
  const windowHeight = window.innerHeight

  // calculate the start location with offset
  const offsetStart = windowHeight * 0.9
  // get the end of the timeline container, with a small margin so it ends sooner
  const sectionEnd = -rect.height * 0.8

  const progress = (offsetStart - rect.top) / (offsetStart - sectionEnd)
  const clampedProgress = Math.max(0, Math.min(1, progress))
  // Control the speed in which the line is drawn
  const easedProgress = Math.pow(clampedProgress, 1.1)

  path.style.strokeDashoffset = pathLength * (1 - easedProgress)
  const drawLength = pathLength * easedProgress
  const point = path.getPointAtLength(drawLength)

  // Now that we now the location of the end of the line we can use the SVG coordinates to add a circle.
  circle.setAttribute('cx', point.x)
  circle.setAttribute('cy', point.y)

  // Get the location of the circle in regards to the viewport
  const dotRect = circle.getBoundingClientRect()
  // Now convert it to local coordinates system, by subtracting the dots top from the containers top value
  const dotCenterY = dotRect.top - rect.top + dotRect.height / 2
  // console.log(dotCenterY)

  //* now we check each item to see if the dot has passed the trigger point.
  stepData.forEach((item) => {
    // Compare the location of the circle to the trigger point of each item
    // There are both on the local coordinate system of the container.
    const shouldBeActive = dotCenterY >= item.triggerY

    if (shouldBeActive && !item.isActive) {
      item.isActive = true

      item.heading.classList.remove('hide-ts-h')
      item.heading.classList.remove('reveal-text')

      void item.heading.offsetWidth

      item.heading.classList.add('reveal-text')
    }

    if (!shouldBeActive && item.isActive) {
      item.isActive = false

      item.heading.classList.add('hide-ts-h')
      item.heading.classList.remove('reveal-text')
    }
  })
}

let ticking = false

function onScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateTimelinePath()
      ticking = false
    })
    ticking = true
  }
}

function onResize() {
  // calTimeContainerRect()
  calculateStepPositions()
  updateTimelinePath()
}

// calTimeContainerRect()
if (timelineSection) {
  calculateStepPositions()
  updateTimelinePath()
  window.addEventListener('scroll', onScroll)
  window.addEventListener('resize', onResize)
}
