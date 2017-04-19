function animate (fn) {
  let start = undefined
  function step (timestamp) {
    if (!start) {
      start = timestamp
    }
    const progress = timestamp - start
    const complete = fn(progress)
    if (!complete) {
      window.requestAnimationFrame(step)
    }
  }
  window.requestAnimationFrame(step)
}

function ease (t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t }

function doScroll (index) {
  const scrollHeight = window.innerHeight
  const scrollStart = document.body.scrollTop || document.documentElement.scrollTop
  const actualScrollStart = scrollStart < scrollHeight * index ? scrollHeight * index : scrollStart
  const scrolledPercent = (actualScrollStart % scrollHeight) / scrollHeight
  return function (progressMs) {
    const timeProgress = progressMs / 300 + scrolledPercent
    const easedTimeProgress = ease(timeProgress)
    const newVal = (easedTimeProgress * scrollHeight) + (scrollHeight * index)
    window.scrollTo(0, newVal)
    if (timeProgress > 1) {
      window.scrollTo(0, scrollHeight * (index + 1))
      return true
    } else {
      return false
    }
  }
}

function scrollToNextFactory (i) {
  return function (event) {
    event.stopPropagation()
    event.preventDefault()
    animate(doScroll(i))
  }
}

const scrollClicks = document.querySelectorAll('.scroll-next')
for (let i = 0; i < scrollClicks.length; i++) {
  const element = scrollClicks[i]
  const handler = scrollToNextFactory(i)
  element.addEventListener('touchend', handler)
  element.addEventListener('click', handler)
}
