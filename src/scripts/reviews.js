// Homepage reviews: rotate every 5 seconds, pause on hover or click, and draw the progress ring.
// Used by src/components/home/HomeReviews.astro.

const clientReviews = document.querySelectorAll('.reviews__item')
const reviewPauseIcon = document.querySelectorAll('.reviews__pause')
const reviewPlayIcon = document.querySelectorAll('.reviews__play')

if (clientReviews.length > 0) {
  let currentReview = 0
  let isRunning = false

  const runReviewIconAnimation = (parentReview, duration = 5000) => {
    const drawPath = parentReview.querySelector(
      '.reviews__play-ring',
    )

    if (!drawPath) return null

    const length = drawPath.getTotalLength()

    drawPath.style.strokeDasharray = `${length} ${length}`
    drawPath.style.strokeDashoffset = length

    let startTime = null
    let pausedAt = null
    let totalPausedTime = 0
    let frameId = null
    let paused = false

    function loop(timeStamp) {
      if (paused) return

      if (!startTime) startTime = timeStamp

      const elapsed = timeStamp - startTime - totalPausedTime
      const progress = (elapsed % duration) / duration

      drawPath.style.strokeDashoffset = length * (1 - progress)

      frameId = requestAnimationFrame(loop)
    }

    function pause() {
      if (paused) return

      paused = true
      pausedAt = performance.now()
      cancelAnimationFrame(frameId)
    }

    function resume() {
      if (!paused) return

      paused = false
      totalPausedTime += performance.now() - pausedAt
      frameId = requestAnimationFrame(loop)
    }

    frameId = requestAnimationFrame(loop)

    return {
      pause,
      resume,
      destroy() {
        paused = true
        cancelAnimationFrame(frameId)
      },
    }
  }

  clientReviews[0].classList.add('reviews__item--active')
  const duration = 5000

  let reviewIconAnimation = runReviewIconAnimation(
    reviewPlayIcon[currentReview],
    duration,
  )

  let timeout
  let remaining = duration
  let timerStartedAt = null

  function startTimer() {
    if (isRunning) return
    isRunning = true
    clearTimeout(timeout) // Clear any existing timeout to avoid multiple timers running
    timerStartedAt = performance.now()

    reviewPauseIcon[currentReview].classList.remove('reviews__pause--active')
    reviewPlayIcon[currentReview].classList.remove('reviews__play--hidden')

    timeout = setTimeout(() => {
      isRunning = false
      nextReview()
      startTimer()
    }, remaining)
  }

  function stopTimer() {
    if (!isRunning) return
    isRunning = false

    clearTimeout(timeout)

    const elapsed = performance.now() - timerStartedAt
    remaining = Math.max(0, remaining - elapsed)
  }

  function nextReview() {
    reviewIconAnimation?.destroy()
    remaining = duration
    clientReviews[currentReview].classList.remove('reviews__item--active')

    currentReview = (currentReview + 1) % clientReviews.length

    clientReviews[currentReview].classList.add('reviews__item--active')

    reviewIconAnimation = runReviewIconAnimation(
      reviewPlayIcon[currentReview],
      duration,
    )
  }

  const stop = () => {
    reviewPlayIcon[currentReview].classList.add('reviews__play--hidden')
    reviewPauseIcon[currentReview].classList.add('reviews__pause--active')
    stopTimer()
    reviewIconAnimation?.pause()
  }

  const start = () => {
    startTimer()
    reviewIconAnimation?.resume()
  }

  // Reduced motion: the reviews start paused. Pressing the button plays them.
  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches
  let isPaused = reduceMotion

  const container = document.querySelector('.reviews__stage')
  if (container) {
    container.addEventListener('mouseenter', stop)
    container.addEventListener('mouseleave', () => {
      if (!isPaused) start()
    })

    container.addEventListener('click', () => {
      isPaused = !isPaused

      if (isPaused) {
        stop()
      } else {
        start()
      }
    })
  }

  if (reduceMotion) {
    stop()
  } else {
    start()
  }
}
