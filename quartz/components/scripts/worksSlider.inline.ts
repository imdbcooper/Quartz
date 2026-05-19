import type {} from "./util"

type RuntimeWindow = Window & {
  __homeWorksItems?: unknown[]
}

let sliderCleanup: (() => void) | null = null

function clearSliderCleanup() {
  sliderCleanup?.()
  sliderCleanup = null
}

function mountSlider(slider: HTMLElement) {
  const slides = Array.from(slider.querySelectorAll<HTMLElement>(".okb-slider__slide"))
  const dots = Array.from(
    slider.querySelectorAll<HTMLElement>(".okb-slider__dots .okb-slider__dot"),
  )
  if (slides.length === 0) return () => {}

  let cur = slides.findIndex((slide) => slide.classList.contains("okb-slider__slide--active"))
  if (cur < 0) cur = 0

  const applyState = (index: number) => {
    slides.forEach((slide, slideIndex) =>
      slide.classList.toggle("okb-slider__slide--active", slideIndex === index),
    )
    dots.forEach((dot, dotIndex) =>
      dot.classList.toggle("okb-slider__dot--active", dotIndex === index),
    )
  }

  const go = (nextIndex: number) => {
    if (slides.length === 0) return
    cur = ((nextIndex % slides.length) + slides.length) % slides.length
    applyState(cur)
  }

  applyState(cur)

  const dotCleanups = dots.map((dot, index) => {
    const onClick = () => go(index)
    dot.addEventListener("click", onClick)
    return () => dot.removeEventListener("click", onClick)
  })

  const intervalId = window.setInterval(() => go(cur + 1), 4000)

  return () => {
    dotCleanups.forEach((cleanup) => cleanup())
    window.clearInterval(intervalId)
  }
}

function mountWorksSliders() {
  clearSliderCleanup()
  const sliders = Array.from(document.querySelectorAll<HTMLElement>("[data-okb-slider]"))
  if (sliders.length === 0) return

  const cleanups = sliders.map((slider) => mountSlider(slider))
  sliderCleanup = () => {
    cleanups.forEach((cleanup) => cleanup())
  }
}

async function loadProject(projectName?: string) {
  const runtime = window as RuntimeWindow
  if (
    Array.isArray(runtime.__homeWorksItems) &&
    runtime.__homeWorksItems.length > 0 &&
    document.querySelector("[data-home-works-list]")
  ) {
    return
  }

  if (!projectName) return

  try {
    const res = await fetch(`/images/Prodject/${projectName}/data.json`)
    if (!res.ok) throw new Error("Failed to load project")

    const data = (await res.json()) as {
      badge?: string
      title?: string
      head?: { badge?: string; title?: string }
      was?: { label?: string; title?: string; desc?: string }
      did?: { label?: string; title?: string; desc?: string }
      result?: { label?: string; title?: string; desc?: string }
      slides?: Array<{ dark?: string; light?: string }>
    }

    let projectBadge = data.badge
    let projectTitle = data.title
    if (data.head) {
      if (typeof data.head.badge === "string") projectBadge = data.head.badge
      if (typeof data.head.title === "string") projectTitle = data.head.title
    }

    const headBadge = document.querySelector<HTMLElement>(".okb-head .okb-badge")
    const headTitle = document.querySelector<HTMLElement>(".okb-head h3")
    if (headBadge && typeof projectBadge === "string") headBadge.textContent = projectBadge
    if (headTitle && typeof projectTitle === "string") headTitle.textContent = projectTitle

    const patchCard = (
      selector: string,
      payload?: { label?: string; title?: string; desc?: string },
    ) => {
      if (!payload) return
      const card = document.querySelector<HTMLElement>(selector)
      if (!card) return
      const label = card.querySelector<HTMLElement>(".okb-card__label p")
      const title = card.querySelector<HTMLElement>("h4")
      const desc = card.querySelector<HTMLElement>(".okb-card__sub")
      if (label && typeof payload.label === "string") label.textContent = payload.label
      if (title && typeof payload.title === "string") title.textContent = payload.title
      if (desc && typeof payload.desc === "string") desc.textContent = payload.desc
    }

    patchCard(".okb-card--was", data.was)
    patchCard(".okb-card--did", data.did)
    patchCard(".okb-card--result", data.result)

    const sliderTrack = document.querySelector<HTMLElement>(".okb-slider__track")
    const dotsContainer = document.querySelector<HTMLElement>(".okb-slider__dots")
    if (sliderTrack) sliderTrack.innerHTML = ""
    if (dotsContainer) dotsContainer.innerHTML = ""

    if (sliderTrack && dotsContainer && Array.isArray(data.slides)) {
      data.slides.forEach((slide, index) => {
        const slideDiv = document.createElement("div")
        slideDiv.className = `okb-slider__slide${index === 0 ? " okb-slider__slide--active" : ""}`

        const imgDark = document.createElement("img")
        imgDark.className = "okb-slide-img okb-slide-img--dark"
        imgDark.src = `/images/Prodject/${projectName}/${slide.dark ?? ""}`
        imgDark.loading = "lazy"

        const imgLight = document.createElement("img")
        imgLight.className = "okb-slide-img okb-slide-img--light"
        imgLight.src = `/images/Prodject/${projectName}/${slide.light ?? ""}`
        imgLight.loading = "lazy"

        slideDiv.append(imgDark, imgLight)
        sliderTrack.appendChild(slideDiv)

        const dot = document.createElement("span")
        dot.className = `okb-slider__dot${index === 0 ? " okb-slider__dot--active" : ""}`
        dotsContainer.appendChild(dot)
      })

      mountWorksSliders()
    }
  } catch (error) {
    console.error(error)
  }
}

const onProjectClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement | null
  const btn = target?.closest<HTMLElement>(".okb-icon-btn[data-project]")
  if (!btn) return

  document
    .querySelectorAll<HTMLElement>(".okb-icon-btn[data-project]")
    .forEach((button) => button.classList.remove("okb-icon-btn--active"))

  btn.classList.add("okb-icon-btn--active")
  void loadProject(btn.dataset.project)
}

function initWorksSlider() {
  mountWorksSliders()

  const activeBtn = document.querySelector<HTMLElement>(
    ".okb-icon-btn.okb-icon-btn--active[data-project]",
  )
  if (activeBtn) {
    void loadProject(activeBtn.dataset.project)
  }
}

document.addEventListener("click", onProjectClick)
document.addEventListener("home:works-rendered", initWorksSlider)
document.addEventListener("nav", initWorksSlider)
window.addCleanup(() => clearSliderCleanup())
initWorksSlider()
